import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

const LEETCODE_GQL = 'https://leetcode.com/graphql';

const statsQuery = (username) => ({
  query: `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { realName ranking }
        submitStats {
          acSubmissionNum { difficulty count submissions }
        }
        badges { id name icon }
        activeBadge { displayName icon { url } }
      }
      userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended rating contest { title startTime }
      }
    }`,
  variables: { username },
});

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `lc_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const response = await axios.post(LEETCODE_GQL, statsQuery(username), {
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
    });
    const d = response.data.data;
    if (!d.matchedUser) return res.status(404).json({ success: false, message: 'LeetCode user not found' });

    const acNums   = d.matchedUser.submitStats.acSubmissionNum;
    const all      = acNums.find(x => x.difficulty === 'All');
    const easy     = acNums.find(x => x.difficulty === 'Easy');
    const medium   = acNums.find(x => x.difficulty === 'Medium');
    const hard     = acNums.find(x => x.difficulty === 'Hard');
    const contest  = d.userContestRanking;
    const history  = (d.userContestRankingHistory || []).filter(h => h.attended).slice(-20);

    const data = {
      username,
      totalSolved:  all?.count    || 0,
      easySolved:   easy?.count   || 0,
      mediumSolved: medium?.count || 0,
      hardSolved:   hard?.count   || 0,
      ranking:      d.matchedUser.profile.ranking,
      contestRating:      contest?.rating              || 0,
      contestRank:        contest?.globalRanking       || 0,
      contestsAttended:   contest?.attendedContestsCount || 0,
      topPercentage:      contest?.topPercentage       || 0,
      ratingHistory: history.map(h => ({ rating: Math.round(h.rating), title: h.contest.title, date: h.contest.startTime })),
      badges: (d.matchedUser.badges || []).slice(0, 8).map(b => ({ name: b.name, icon: b.icon })),
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`lc_${req.params.username}`);
  res.json({ success: true, message: 'LeetCode cache cleared' });
});

export default router;
