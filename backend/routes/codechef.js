import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Uses unofficial CodeChef API wrapper (community-maintained)
const CC_API = 'https://codechef-api.vercel.app';

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `cc_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const response = await axios.get(`${CC_API}/handle/${username}`, { timeout: 10000 });
    const d = response.data;

    const data = {
      username,
      rating:          d.currentRating    || 0,
      maxRating:       d.highestRating    || 0,
      stars:           d.stars            || '0★',
      globalRank:      d.globalRank       || 'N/A',
      countryRank:     d.countryRank      || 'N/A',
      problemsSolved:  d.totalProblemsSolved || 0,
      contestsCount:   (d.ratingData || []).length,
      ratingHistory:   (d.ratingData || []).slice(-20).map(r => ({
        rating: r.rating, contestName: r.name, date: r.end_date,
      })),
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data });
  } catch (err) {
    // Fallback: return zeros gracefully if API is down
    res.json({
      success: true,
      data: { username, rating: 0, maxRating: 0, stars: 'N/A', problemsSolved: 0, contestsCount: 0, ratingHistory: [] },
      note: 'CodeChef API unavailable, showing fallback data',
    });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`cc_${req.params.username}`);
  res.json({ success: true, message: 'CodeChef cache cleared' });
});

export default router;
