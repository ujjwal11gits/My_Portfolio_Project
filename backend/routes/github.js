import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

const GH_BASE = 'https://api.github.com';
const getHeaders = () => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
});

router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `gh_user_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    // Fetch GitHub User Info, Repos, and Contribution Activity in parallel
    const [userRes, reposRes, contribRes] = await Promise.allSettled([
      axios.get(`${GH_BASE}/users/${username}`, { headers: getHeaders(), timeout: 12000 }),
      axios.get(`${GH_BASE}/users/${username}/repos?sort=pushed&per_page=100`, { headers: getHeaders(), timeout: 15000 }),
      axios.get(`https://github-contributions-api.deno.dev/${username}.json`, { timeout: 12000 }),
    ]);

    const user  = userRes.status === 'fulfilled' ? userRes.value.data : {};
    const repos = reposRes.status === 'fulfilled' && Array.isArray(reposRes.value.data) ? reposRes.value.data : [];

    // Language stats — calculate from repos
    const langMap = {};
    repos.forEach(r => {
      if (r.language) {
        langMap[r.language] = (langMap[r.language] || 0) + (r.size || 100);
      }
    });

    const totalSize = Object.values(langMap).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percent: totalSize > 0 ? +((bytes / totalSize) * 100).toFixed(1) : 0,
      }));

    // All Public Repositories (sorted by last pushed / activity)
    const allPublicRepos = [...repos]
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at || 0).getTime() - new Date(a.pushed_at || 0).getTime())
      .map(r => ({
        name:        r.name,
        description: r.description || '',
        url:         r.html_url,
        stars:       r.stargazers_count || 0,
        forks:       r.forks_count || 0,
        language:    r.language,
        topics:      r.topics || [],
        updatedAt:   r.pushed_at,
      }));

    // Contribution activity calendar grid
    let contributions = [];
    let totalContributions = 0;

    if (contribRes.status === 'fulfilled' && contribRes.value.data) {
      const cd = contribRes.value.data;
      totalContributions = cd.totalContributions || 0;
      if (Array.isArray(cd.contributions)) {
        contributions = cd.contributions.flat().map(d => ({
          date:  d.date,
          count: d.contributionCount || 0,
          color: d.color,
          level: d.contributionLevel,
        }));
      }
    }

    const data = {
      name:               user.name || 'Ujjwal Choubey',
      username:           user.login || username,
      bio:                user.bio || '',
      avatar:             user.avatar_url || '',
      location:           user.location || '',
      publicRepos:        user.public_repos || allPublicRepos.length,
      followers:          user.followers || 0,
      following:          user.following || 0,
      createdAt:          user.created_at || '',
      totalStars:         repos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
      totalForks:         repos.reduce((s, r) => s + (r.forks_count || 0), 0),
      totalContributions,
      languages,
      topRepos:           allPublicRepos, // All public repos for the grid
      contributions,
    };

    cache.set(cacheKey, data);
    res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('[GitHub] fetch error:', err.message);
    // Return graceful structure — never 500
    res.json({
      success: true,
      data: {
        name: 'Ujjwal Choubey', username, bio: '', avatar: '', location: '',
        publicRepos: 0, followers: 0, following: 0, createdAt: '',
        totalStars: 0, totalForks: 0, totalContributions: 0,
        languages: [], topRepos: [], contributions: [], apiDown: true,
      },
      note: 'GitHub stats temporarily unavailable.',
    });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`gh_user_${req.params.username}`);
  res.json({ success: true, message: 'GitHub cache cleared' });
});

export default router;
