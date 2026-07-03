import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Scrape CodeChef user profile page directly — highly accurate and fast
const scrapeCodeChef = async (username) => {
  const response = await axios.get(`https://www.codechef.com/users/${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    timeout: 20000,
  });

  const html = response.data;

  // Rating
  const rMatch = html.match(/class="rating-number">\s*(\d+)/);
  const currentRating = rMatch ? parseInt(rMatch[1]) : 0;

  // Max Rating
  const maxMatch = html.match(/Highest Rating\s*(\d+)/i) || html.match(/\(Highest Rating\s*(\d+)\)/);
  const maxRating = maxMatch ? parseInt(maxMatch[1]) : currentRating;

  // Total Solved
  const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
  const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

  // Stars
  let stars = '1★';
  if (currentRating >= 2500) stars = '7★';
  else if (currentRating >= 2200) stars = '6★';
  else if (currentRating >= 2000) stars = '5★';
  else if (currentRating >= 1800) stars = '4★';
  else if (currentRating >= 1600) stars = '3★';
  else if (currentRating >= 1400) stars = '2★';

  // Contest Rating History JSON array
  let ratingHistory = [];
  const chartMatch = html.match(/\[\s*\{.*?"rating".*?\}\s*\]/s);
  if (chartMatch) {
    try {
      const parsed = JSON.parse(chartMatch[0]);
      ratingHistory = parsed.map(c => ({
        rating: parseInt(c.rating) || 0,
        contestName: c.name || c.code || '',
        date: c.end_date ? new Date(c.end_date).toISOString() : '',
        rank: parseInt(c.rank) || 0,
      }));
    } catch (e) {
      console.warn('[CodeChef] JSON parse error for rating history:', e.message);
    }
  }

  return {
    username,
    rating: currentRating,
    maxRating: maxRating,
    stars: stars,
    globalRank: 'N/A',
    countryRank: 'N/A',
    problemsSolved: totalSolved,
    contestsCount: ratingHistory.length,
    ratingHistory: ratingHistory,
    apiDown: false,
  };
};

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `cc_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const data = await scrapeCodeChef(username);
    cache.set(cacheKey, data);
    return res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[CodeChef] scrape error:', err.message);
    return res.json({
      success: true,
      data: {
        username,
        rating: 0, maxRating: 0, stars: 'N/A',
        globalRank: 'N/A', countryRank: 'N/A',
        problemsSolved: 0, contestsCount: 0, ratingHistory: [],
        apiDown: true,
      },
      note: 'CodeChef profile temporarily unavailable.',
    });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`cc_${req.params.username}`);
  res.json({ success: true, message: 'CodeChef cache cleared' });
});

export default router;
