import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { getGitHub, clearCache } from '../utils/api';
import {
  FiGithub, FiStar, FiGitBranch, FiBook, FiUsers,
  FiRefreshCw, FiExternalLink, FiCode, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DevStats.css';

export default function DevStats() {
  const { data: portfolioData } = usePortfolio();
  const profile = portfolioData?.profile || {};
  const username = profile.codingProfiles?.github || 'bytewiz_ujjwal';

  const [ghData, setGhData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGitHubStats = async () => {
    setLoading(true);
    try {
      const res = await getGitHub(username);
      if (res.data?.success) {
        setGhData(res.data.data);
      }
    } catch (err) {
      console.error('Failed fetching GitHub stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubStats();
  }, [portfolioData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Refreshing GitHub data...', { id: 'gh-refresh' });
    try {
      await clearCache('github', username);
      await fetchGitHubStats();
      toast.success('GitHub stats updated live!', { id: 'gh-refresh' });
    } catch (e) {
      toast.error('Failed updating GitHub stats', { id: 'gh-refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  const languages = ghData?.languages || [
    { name: 'JavaScript', percent: 35, color: '#f7df1e' },
    { name: 'C++', percent: 25, color: '#f34b7d' },
    { name: 'HTML/CSS', percent: 20, color: '#e34c26' },
    { name: 'Python', percent: 15, color: '#3572A5' },
    { name: 'TypeScript', percent: 5, color: '#3178c6' },
  ];

  const repos = ghData?.topRepos || [
    { name: 'portfolio-mern', description: 'Personal Portfolio website built with MERN stack, Vite, Framer Motion and Chart.js', stars: 12, forks: 4, language: 'JavaScript', url: `https://github.com/${username}` },
    { name: 'dsa-cpp-solutions', description: 'Solutions to 1500+ LeetCode, Codeforces, and CodeChef problems in C++', stars: 28, forks: 9, language: 'C++', url: `https://github.com/${username}` },
    { name: 'web3-dapp-starter', description: 'Full stack decentralized application template with Hardhat, Ethers.js and React', stars: 15, forks: 3, language: 'Solidity', url: `https://github.com/${username}` },
    { name: 'ai-code-assistant', description: 'AI Powered Code Reviewer and Analyzer using Gemini API and Node.js', stars: 19, forks: 6, language: 'Python', url: `https://github.com/${username}` },
  ];

  // Language color mapping
  const LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    'C++': '#f34b7d',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Java: '#b07219',
  };

  return (
    <div className="dev-stats-page page">

      {/* Orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '5%', right: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 350, height: 350, top: '55%', left: '-5%', opacity: 0.4 }} />

      <div className="container">

        {/* Header */}
        <div className="dev-header glass-card">
          <div className="dev-header-info">
            <div className="github-icon-badge">
              <FiGithub />
            </div>
            <div>
              <h2>GitHub & Development Activity</h2>
              <p className="user-handle mono">@{username}</p>
            </div>
          </div>

          <div className="dev-header-actions">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <FiExternalLink /> GitHub Profile
            </a>
            <button
              className={`btn btn-primary ${refreshing ? 'disabled' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Syncing...' : 'Sync GitHub'}
            </button>
          </div>
        </div>

        {/* Top GitHub Quick Stats Row */}
        <div className="dev-stats-grid grid-4">
          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag"><FiBook /></div>
            <div className="stat-info">
              <span className="stat-label">Public Repos</span>
              <h3 className="stat-val mono">{ghData?.publicRepos || 24}</h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag gold"><FiStar /></div>
            <div className="stat-info">
              <span className="stat-label">Total Stars</span>
              <h3 className="stat-val mono">{ghData?.totalStars || 74}</h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag cyan"><FiGitBranch /></div>
            <div className="stat-info">
              <span className="stat-label">Total Forks</span>
              <h3 className="stat-val mono">{ghData?.totalForks || 22}</h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag green"><FiUsers /></div>
            <div className="stat-info">
              <span className="stat-label">Followers</span>
              <h3 className="stat-val mono">{ghData?.followers || 45}</h3>
            </div>
          </div>
        </div>

        {/* Language Breakdown Card */}
        <div className="languages-card glass-card">
          <h3 className="card-title"><FiCode /> Most Used Languages</h3>
          <p className="card-desc">Calculated across public GitHub repositories</p>

          <div className="lang-stacked-bar">
            {languages.map((lang, idx) => (
              <div
                key={idx}
                className="lang-bar-segment"
                style={{
                  width: `${lang.percent}%`,
                  backgroundColor: LANG_COLORS[lang.name] || '#8b5cf6',
                }}
                title={`${lang.name}: ${lang.percent}%`}
              />
            ))}
          </div>

          <div className="lang-legend-grid">
            {languages.map((lang, idx) => (
              <div key={idx} className="lang-legend-item">
                <span
                  className="lang-color-dot"
                  style={{ backgroundColor: LANG_COLORS[lang.name] || '#8b5cf6' }}
                />
                <span className="lang-name">{lang.name}</span>
                <span className="lang-pct mono">{lang.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Contribution Heatmap Card */}
        <div className="heatmap-card glass-card">
          <div className="heatmap-header">
            <div>
              <h3 className="card-title"><FiActivity /> Contribution Heatmap</h3>
              <p className="card-desc">GitHub commit & activity history</p>
            </div>
            <span className="badge-year">2026 / 2025</span>
          </div>

          <div className="heatmap-img-wrap">
            <img
              src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&bg_color=0d0d1f&hide_border=true`}
              alt={`${username}'s Github Contribution Chart`}
              className="heatmap-img"
              onError={(e) => {
                e.target.src = `https://ghchart.rshah.org/8b5cf6/${username}`;
              }}
            />
          </div>
        </div>

        {/* Top Repositories Grid */}
        <div className="repos-section">
          <div className="section-header">
            <div className="section-tag">⭐ Featured Repos</div>
            <h2>Pinned <span className="gradient-text">Repositories</span></h2>
          </div>

          <div className="repos-grid grid-2">
            {repos.map((repo, idx) => (
              <motion.a
                key={idx}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="repo-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="repo-header">
                  <div className="repo-title-wrap">
                    <FiBook className="repo-icon" />
                    <h3 className="repo-name">{repo.name}</h3>
                  </div>
                  <FiExternalLink className="external-icon" />
                </div>

                <p className="repo-desc">{repo.description}</p>

                <div className="repo-footer">
                  {repo.language && (
                    <span className="repo-lang">
                      <span
                        className="lang-color-dot"
                        style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b5cf6' }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="repo-stat"><FiStar /> {repo.stars}</span>
                  <span className="repo-stat"><FiGitBranch /> {repo.forks}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}