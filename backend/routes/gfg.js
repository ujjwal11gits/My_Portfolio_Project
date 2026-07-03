import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Scrape GFG profile page directly — highly reliable
const scrapeGFG = async (username) => {
  const response = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 20000,
  });

  const html = response.data;

  const extractNum = (key) => {
    const re = new RegExp(`\\\\?"${key}\\\\?"\\s*:\\s*(\\d+)`);
    const m = html.match(re);
    return m ? parseInt(m[1]) : 0;
  };

  const totalSolved  = extractNum('total_problems_solved');
  const codingScore  = extractNum('score');
  const streak       = extractNum('pod_solved_longest_streak');

  return {
    username,
    totalSolved: totalSolved,
    codingScore: codingScore,
    streak: streak,
    school: 0,
    basic: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    apiDown: false,
  };
};

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `gfg_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const data = await scrapeGFG(username);
    cache.set(cacheKey, data);
    return res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[GFG] fetch error:', err.message);
    return res.json({
      success: true,
      data: {
        username,
        totalSolved: 0, codingScore: 0, streak: 0,
        school: 0, basic: 0, easy: 0, medium: 0, hard: 0,
        apiDown: true,
      },
      note: 'GFG stats temporarily unavailable.',
    });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`gfg_${req.params.username}`);
  res.json({ success: true, message: 'GFG cache cleared' });
});

export default router;
