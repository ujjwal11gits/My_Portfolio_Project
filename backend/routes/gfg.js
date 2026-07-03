import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Primary GFG stats API
const GFG_API = 'https://geeks-for-geeks-stats-api.vercel.app';

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `gfg_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const response = await axios.get(`${GFG_API}/?raw=y&userName=${username}`, { timeout: 15000 });
    const d = response.data;

    if (d.error) {
      return res.status(404).json({ success: false, message: d.error });
    }

    // The API returns two formats — handle both
    const info         = d.info         || d;
    const solvedStats  = d.solvedStats  || {};

    const data = {
      username,
      totalSolved:  info.totalProblemsSolved || d.totalProblemsSolved || 0,
      school:       solvedStats.school?.count   || d.School  || 0,
      basic:        solvedStats.basic?.count    || d.Basic   || 0,
      easy:         solvedStats.easy?.count     || d.Easy    || 0,
      medium:       solvedStats.medium?.count   || d.Medium  || 0,
      hard:         solvedStats.hard?.count     || d.Hard    || 0,
      institute:    info.institute    || '',
      instituteRank:info.instituteRank || 0,
      codingScore:  info.codingScore  || 0,
      globalRank:   info.globalRank   || 0,
      streak:       info.currentStreak || '0',
    };

    cache.set(cacheKey, data);
    return res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[GFG] fetch error:', err.message);
    // Graceful fallback — no fake data
    return res.json({
      success: true,
      data: {
        username,
        totalSolved: 0, school: 0, basic: 0, easy: 0, medium: 0, hard: 0,
        institute: '', instituteRank: 0, codingScore: 0, globalRank: 0, streak: '0',
        apiDown: true,
      },
      note: 'GFG stats API temporarily unavailable.',
    });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`gfg_${req.params.username}`);
  res.json({ success: true, message: 'GFG cache cleared' });
});

export default router;
