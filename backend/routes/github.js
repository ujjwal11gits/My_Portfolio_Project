import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

const GH_BASE = 'https://api.github.com';
const getHeaders = () => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
});

// Fallback HTML scraper when GitHub REST API hits 60 req/hr rate limits
const scrapeGitHubHTML = async (username) => {
  const res = await axios.get(`https://github.com/${username}?tab=repositories`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 15000,
  });

  const html = res.data;
  const blocks = html.split('<li class="col-12 d-flex');
  const repos = [];
  const langMap = {};

  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    const nameMatch = b.match(/href="\/[^\/]+\/([^"\/]+)" itemprop="name codeRepository"/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const descMatch = b.match(/itemprop="description">([^<]+)/);
    const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&').trim() : '';

    const langMatch = b.match(/itemprop="programmingLanguage">([^<]+)/);
    const language = langMatch ? langMatch[1].trim() : '';

    const starMatch = b.match(/href="\/[^\/]+\/[^\/]+\/stargazers"[^>]*>\s*(\d+)/s);
    const stars = starMatch ? parseInt(starMatch[1]) : 0;

    const forkMatch = b.match(/href="\/[^\/]+\/[^\/]+\/network\/members"[^>]*>\s*(\d+)/s);
    const forks = forkMatch ? parseInt(forkMatch[1]) : 0;

    if (language) {
      langMap[language] = (langMap[language] || 0) + 1;
    }

    repos.push({
      name,
      description: desc,
      url: `https://github.com/${username}/${name}`,
      stars,
      forks,
      language,
      topics: [],
      updatedAt: new Date().toISOString(),
    });
  }

  const followerMatch = html.match(/href="\/[^\/]+\?tab=followers"[^>]*>.*?<span[^>]*class="Counter[^"]*"[^>]*>\s*(\d+)/s);
  const repoCountMatch = html.match(/href="\/[^\/]+\?tab=repositories"[^>]*>.*?<span[^>]*class="Counter[^"]*"[^>]*>\s*(\d+)/s);

  const totalLangCount = Object.values(langMap).reduce((a, b) => a + b, 0);
  const languages = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      bytes: count,
      percent: totalLangCount > 0 ? +((count / totalLangCount) * 100).toFixed(1) : 0,
    }));

  return {
    name: username === 'ujjwal11gits' ? 'Ujjwal Choubey' : username,
    username,
    bio: 'Full Stack Developer',
    avatar: `https://github.com/${username}.png`,
    location: 'India',
    publicRepos: repoCountMatch ? parseInt(repoCountMatch[1]) : repos.length,
    followers: followerMatch ? parseInt(followerMatch[1]) : 1,
    following: 0,
    createdAt: '',
    totalStars: repos.reduce((s, r) => s + r.stars, 0),
    totalForks: repos.reduce((s, r) => s + r.forks, 0),
    languages,
    topRepos: repos,
  };
};

router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `gh_user_${username}`;
  if (cache.has(cacheKey)) return res.json({ success: true, data: cache.get(cacheKey), cached: true });

  try {
    // 1. Fetch Contributions from Deno API (always fast & accurate)
    let contributions = [];
    let totalContributions = 0;

    try {
      const contribRes = await axios.get(`https://github-contributions-api.deno.dev/${username}.json`, { timeout: 10000 });
      if (contribRes.data) {
        totalContributions = contribRes.data.totalContributions || 0;
        if (Array.isArray(contribRes.data.contributions)) {
          contributions = contribRes.data.contributions.flat().map(d => ({
            date:  d.date,
            count: d.contributionCount || 0,
            color: d.color,
            level: d.contributionLevel,
          }));
        }
      }
    } catch (e) {
      console.warn('[GitHub] Deno contributions API warning:', e.message);
    }

    // 2. Fetch User & Repos via REST API or Scraper Fallback
    let mainData = null;
    try {
      const [userRes, reposRes] = await Promise.all([
        axios.get(`${GH_BASE}/users/${username}`, { headers: getHeaders(), timeout: 10000 }),
        axios.get(`${GH_BASE}/users/${username}/repos?sort=pushed&per_page=100`, { headers: getHeaders(), timeout: 12000 }),
      ]);

      const user  = userRes.data;
      const repos = Array.isArray(reposRes.data) ? reposRes.data : [];

      const langMap = {};
      repos.forEach(r => {
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + (r.size || 100);
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

      const topRepos = [...repos]
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

      mainData = {
        name:        user.name || 'Ujjwal Choubey',
        username:    user.login || username,
        bio:         user.bio || '',
        avatar:      user.avatar_url || `https://github.com/${username}.png`,
        location:    user.location || '',
        publicRepos: user.public_repos || topRepos.length,
        followers:   user.followers || 0,
        following:   user.following || 0,
        createdAt:   user.created_at || '',
        totalStars:  repos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
        totalForks:  repos.reduce((s, r) => s + (r.forks_count || 0), 0),
        languages,
        topRepos,
      };
    } catch (apiErr) {
      console.warn('[GitHub] REST API rate limited or failed — engaging HTML Scraper fallback:', apiErr.message);
      // Engage bulletproof HTML scraper fallback
      mainData = await scrapeGitHubHTML(username);
    }

    const finalData = {
      ...mainData,
      totalContributions,
      contributions,
    };

    cache.set(cacheKey, finalData);
    res.json({ success: true, data: finalData, cached: false });
  } catch (err) {
    console.error('[GitHub] fetch error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/cache/:username', (req, res) => {
  cache.del(`gh_user_${req.params.username}`);
  res.json({ success: true, message: 'GitHub cache cleared' });
});

export default router;
