import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Primary: unofficial CodeChef wrapper
const CC_PRIMARY = 'https://codechef-api.vercel.app';
// Fallback: codechef profile via unofficial API mirror
const CC_FALLBACK = 'https://competitive-companion.vercel.app/codechef';

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `cc_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  // Helper to build data object from API response
  const buildData = (d) => ({
    username,
    rating:         d.currentRating    || d.rating         || 0,
    maxRating:      d.highestRating    || d.max_rating      || 0,
    stars:          d.stars            || '0★',
    globalRank:     d.globalRank       || d.global_rank     || 'N/A',
    countryRank:    d.countryRank      || d.country_rank    || 'N/A',
    problemsSolved: d.totalProblemsSolved || d.problems_solved || 0,
    contestsCount:  (d.ratingData || []).length,
    ratingHistory:  (d.ratingData || []).slice(-30).map(r => ({
      rating:      r.rating,
      contestName: r.name || r.contest_name || '',
      date:        r.end_date || r.date || '',
    })),
  });

  // Try primary API
  try {
    const response = await axios.get(`${CC_PRIMARY}/handle/${username}`, { timeout: 10000 });
    const data = buildData(response.data);
    cache.set(cacheKey, data);
    return res.json({ success: true, data, cached: false });
  } catch (primaryErr) {
    console.warn('[CodeChef] Primary API failed:', primaryErr.message, '— trying fallback...');
  }

  // Return graceful zeros — do NOT use fake data
  const fallbackData = {
    username,
    rating: 0,
    maxRating: 0,
    stars: 'N/A',
    globalRank: 'N/A',
    countryRank: 'N/A',
    problemsSolved: 0,
    contestsCount: 0,
    ratingHistory: [],
    apiDown: true,
  };

  res.json({
    success: true,
    data: fallbackData,
    note: 'CodeChef API is currently unavailable. Data will update when API recovers.',
  });
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`cc_${req.params.username}`);
  res.json({ success: true, message: 'CodeChef cache cleared' });
});

export default router;
