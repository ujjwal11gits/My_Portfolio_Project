import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Using alfa-leetcode-api — a reliable public LeetCode API proxy
// (LeetCode's own GraphQL blocks direct server-to-server requests)
const LC_API = 'https://alfa-leetcode-api.onrender.com';

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `lc_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    // Fetch profile stats and contest ranking in parallel
    const [profileRes, contestRes] = await Promise.allSettled([
      axios.get(`${LC_API}/userProfile/${username}`, { timeout: 20000 }),
      axios.get(`${LC_API}/userContestRankingInfo/${username}`, { timeout: 20000 }),
    ]);

    // Profile data
    const profileOk = profileRes.status === 'fulfilled' && profileRes.value.data?.matchedUserStats;
    const profileData = profileOk ? profileRes.value.data : null;

    if (!profileData) {
      const errMsg = profileRes.reason?.message || profileRes.value?.data?.errors?.[0]?.message || 'LeetCode user not found';
      return res.status(404).json({ success: false, message: errMsg });
    }

    const acNums  = profileData.matchedUserStats?.acSubmissionNum || [];
    const all     = acNums.find(x => x.difficulty === 'All');
    const easy    = acNums.find(x => x.difficulty === 'Easy');
    const medium  = acNums.find(x => x.difficulty === 'Medium');
    const hard    = acNums.find(x => x.difficulty === 'Hard');

    // Contest data
    let contestRanking  = null;
    let ratingHistory   = [];

    if (contestRes.status === 'fulfilled' && contestRes.value.data) {
      const cd = contestRes.value.data;
      contestRanking = cd.data?.userContestRanking || cd.userContestRanking || null;
      const historyRaw = cd.data?.userContestRankingHistory || cd.userContestRankingHistory || [];
      ratingHistory = historyRaw
        .filter(h => h.attended)
        .map(h => ({
          rating:      Math.round(h.rating),
          title:       h.contest?.title || '',
          date:        h.contest?.startTime
            ? new Date(h.contest.startTime * 1000).toISOString()
            : '',
        }));
    }

    const data = {
      username,
      totalSolved:      all?.count      || 0,
      easySolved:       easy?.count     || 0,
      mediumSolved:     medium?.count   || 0,
      hardSolved:       hard?.count     || 0,
      ranking:          profileData.profile?.ranking || 0,
      contestRating:    contestRanking?.rating               || 0,
      contestRank:      contestRanking?.globalRanking        || 0,
      contestsAttended: contestRanking?.attendedContestsCount || 0,
      topPercentage:    contestRanking?.topPercentage        || 0,
      ratingHistory,
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[LeetCode] fetch error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`lc_${req.params.username}`);
  res.json({ success: true, message: 'LeetCode cache cleared' });
});

export default router;
