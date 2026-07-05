import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();

// Initialize NodeCache:
// stdTTL is set to 3600 seconds (1 Hour).
// NodeCache stores data in memory (RAM). When a user requests stats, if it is already in RAM, we return it in 5ms instead of fetching from LeetCode (which takes 2 seconds).
const cache = new NodeCache({ stdTTL: 3600 });

// LeetCode's official endpoint is GraphQL and blocks server-to-server requests using Cloudflare protection.
// We use a public, open-source proxy service (alfa-leetcode-api) running on Render which acts as our bridge.
const LC_API = 'https://alfa-leetcode-api.onrender.com';

// Express GET Route: `/api/leetcode/stats/:username`
router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `lc_${username}`; // Key to search inside memory (e.g. lc_bytewiz_ujjwal)

  // 1. Cache Check (Cache Hit):
  // If data exists in memory, return it instantly and stop.
  if (cache.has(cacheKey)) {
    return res.json({ success: true, data: cache.get(cacheKey), cached: true });
  }

  // 2. Cache Miss:
  // Data is not in memory. We must fetch it from the LeetCode proxy.
  try {
    // We make two requests: one for general profile info and one for contest rankings.
    // Instead of waiting for one to finish before starting the second, we run them in parallel (concurrently)
    // using Promise.allSettled.
    // Promise.allSettled is resilient: if contest info fails to fetch, the profile data still loads instead of throwing an app crash.
    const [profileRes, contestRes] = await Promise.allSettled([
      axios.get(`${LC_API}/userProfile/${username}`, { timeout: 20000 }), // 20s network timeout safety
      axios.get(`${LC_API}/userContestRankingInfo/${username}`, { timeout: 20000 }),
    ]);

    // Parse Profile Data:
    // We check if the promise was successfully 'fulfilled' and contains data.
    const profileOk = profileRes.status === 'fulfilled' && profileRes.value.data?.matchedUserStats;
    const profileData = profileOk ? profileRes.value.data : null;

    if (!profileData) {
      const errMsg = profileRes.reason?.message || profileRes.value?.data?.errors?.[0]?.message || 'LeetCode user not found';
      return res.status(404).json({ success: false, message: errMsg });
    }

    // LeetCode stores stats inside arrays. We search the array to find difficulty objects.
    const acNums  = profileData.matchedUserStats?.acSubmissionNum || [];
    const all     = acNums.find(x => x.difficulty === 'All');
    const easy    = acNums.find(x => x.difficulty === 'Easy');
    const medium  = acNums.find(x => x.difficulty === 'Medium');
    const hard    = acNums.find(x => x.difficulty === 'Hard');

    // Parse Contest Data:
    let contestRanking  = null;
    let ratingHistory   = [];

    if (contestRes.status === 'fulfilled' && contestRes.value.data) {
      const cd = contestRes.value.data;
      // Extract general ranking values
      contestRanking = cd.data?.userContestRanking || cd.userContestRanking || null;
      // Extract contest history array
      const historyRaw = cd.data?.userContestRankingHistory || cd.userContestRankingHistory || [];
      
      // We filter only the contests where the user actually participated, and map them to our simple frontend fields.
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

    // 3. Assemble Clean Data Object:
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

    // 4. Save to NodeCache:
    // Store it under our key (`lc_username`) so the next request gets it instantly from memory.
    cache.set(cacheKey, data);
    res.json({ success: true, data, cached: false });

  } catch (err) {
    console.error('[LeetCode] fetch error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cache Invalidation Route (DELETE): `/api/leetcode/cache/:username`
// Allows the admin to force-sync updates by manually clearing the cache key from RAM memory.
router.delete('/cache/:username', (req, res) => {
  cache.del(`lc_${req.params.username}`);
  res.json({ success: true, message: 'LeetCode cache cleared' });
});

export default router;
