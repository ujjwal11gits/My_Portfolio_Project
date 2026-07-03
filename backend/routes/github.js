import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

const GH_BASE = 'https://api.github.com';
const getHeaders = () => ({
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
});

// ── GET GitHub user stats ────────────────────────────────────
router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `gh_user_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`${GH_BASE}/users/${username}`, { headers: getHeaders() }),
      axios.get(`${GH_BASE}/users/${username}/repos?sort=stars&per_page=100`, { headers: getHeaders() }),
    ]);

    const user  = userRes.data;
    const repos = reposRes.data;

    // Language stats
    const langMap = {};
    const langRequests = repos.slice(0, 20).map(r =>
      r.languages_url ? axios.get(r.languages_url, { headers: getHeaders() }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} })
    );
    const langResponses = await Promise.all(langRequests);
    langResponses.forEach(r => {
      Object.entries(r.data).forEach(([lang, bytes]) => {
        langMap[lang] = (langMap[lang] || 0) + bytes;
      });
    });
    const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
    const languages  = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, bytes]) => ({ name, bytes, percent: +((bytes / totalBytes) * 100).toFixed(1) }));

    // Pinned / top repos
    const topRepos = repos
      .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
      .slice(0, 6)
      .map(r => ({
        name: r.name, description: r.description, url: r.html_url,
        stars: r.stargazers_count, forks: r.forks_count,
        language: r.language, topics: r.topics,
      }));

    const data = {
      name: user.name, username: user.login, bio: user.bio,
      avatar: user.avatar_url, location: user.location,
      publicRepos: user.public_repos, followers: user.followers,
      following: user.following, createdAt: user.created_at,
      totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
      totalForks: repos.reduce((s, r) => s + r.forks_count, 0),
      languages, topRepos,
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Force refresh ────────────────────────────────────────────
router.delete('/cache/:username', (req, res) => {
  cache.del(`gh_user_${req.params.username}`);
  res.json({ success: true, message: 'GitHub cache cleared' });
});

export default router;
