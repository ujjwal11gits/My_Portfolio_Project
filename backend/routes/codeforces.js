import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });
const CF = 'https://codeforces.com/api';

router.get('/stats/:handle', async (req, res) => {
  const { handle } = req.params;
  const cacheKey = `cf_${handle}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const [userRes, ratingRes, submissionsRes] = await Promise.all([
      axios.get(`${CF}/user.info?handles=${handle}`, { timeout: 15000 }),
      axios.get(`${CF}/user.rating?handle=${handle}`, { timeout: 15000 }),
      axios.get(`${CF}/user.status?handle=${handle}`, { timeout: 20000 }), // fetch ALL submissions
    ]);

    const user    = userRes.data.result[0];
    const history = ratingRes.data.result || [];
    const subs    = submissionsRes.data.result || [];

    // Count ALL unique solved problems accurately
    const solved = new Set();
    subs.forEach(s => {
      if (s.verdict === 'OK' && s.problem) {
        const pKey = s.problem.contestId ? `${s.problem.contestId}-${s.problem.index}` : s.problem.name;
        solved.add(pKey);
      }
    });

    const ratingHistory = history.map(h => ({
      rating:      h.newRating,
      contestName: h.contestName,
      date:        new Date(h.ratingUpdateTimeSeconds * 1000).toISOString(),
      rank:        h.rank,
    }));

    const data = {
      handle:         user.handle,
      rating:         user.rating      || 0,
      maxRating:      user.maxRating   || 0,
      rank:           user.rank        || 'unrated',
      maxRank:        user.maxRank     || 'unrated',
      contribution:   user.contribution || 0,
      problemsSolved: solved.size,
      contestsCount:  history.length,
      ratingHistory,
      avatar:         user.avatar,
      country:        user.country,
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[Codeforces] fetch error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/cache/:handle', (req, res) => {
  cache.del(`cf_${req.params.handle}`);
  res.json({ success: true, message: 'Codeforces cache cleared' });
});

export default router;
