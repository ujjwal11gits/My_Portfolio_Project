import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { getGitHub, clearCache } from '../utils/api';
import {
  FiGithub, FiStar, FiGitBranch, FiBook, FiUsers,
  FiRefreshCw, FiExternalLink, FiCode, FiActivity, FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './DevStats.css';

const LS_KEY = 'devstats_last_synced';

function timeAgo(isoStr) {
  if (!isoStr) return null;
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day(s) ago`;
}

const LANG_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  'C++':       '#f34b7d',
  Python:      '#3572A5',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Java:        '#b07219',
  Shell:       '#89e051',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  C:           '#555555',
  Dart:        '#00B4AB',
};

export default function DevStats() {
  const { data: portfolioData } = usePortfolio();
  const profile  = portfolioData?.profile || {};
  const username = profile.codingProfiles?.github || 'ujjwal11gits';

  const [ghData,     setGhData]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem(LS_KEY) || null);

  const hasFetched = useRef(false);

  const fetchGitHubStats = useCallback(async () => {
    setError(null);
    try {
      const res = await getGitHub(username);
      if (res.data?.success) {
        setGhData(res.data.data);
        const now = new Date().toISOString();
        localStorage.setItem(LS_KEY, now);
        setLastSynced(now);
      } else {
        setError('GitHub data unavailable');
      }
    } catch (err) {
      console.error('[DevStats] GitHub fetch error:', err);
      setError(err.message || 'Failed to fetch GitHub data');
    }
  }, [username]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    fetchGitHubStats().finally(() => setLoading(false));
  }, []); // run once on mount

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Clearing cache & fetching GitHub data...', { id: 'gh-refresh' });
    try {
      await clearCache('github', username);
      await fetchGitHubStats();
      toast.success('GitHub stats refreshed!', { id: 'gh-refresh' });
    } catch (e) {
      toast.error('Failed to refresh GitHub stats', { id: 'gh-refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  // Only use real data — no fake fallbacks
  const languages = ghData?.languages || [];
  const repos     = ghData?.topRepos  || [];

  return (
    <div className="dev-stats-page page">

      {/* Orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '5%', right: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, top: '55%', left: '-5%', opacity: 0.4 }} />

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
              {lastSynced && (
                <p className="last-synced-text">
                  <FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Synced {timeAgo(lastSynced)}
                </p>
              )}
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
              <h3 className="stat-val mono">
                {loading ? '—' : ghData?.publicRepos ?? (error ? 'Error' : '—')}
              </h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag gold"><FiStar /></div>
            <div className="stat-info">
              <span className="stat-label">Total Stars</span>
              <h3 className="stat-val mono">
                {loading ? '—' : ghData?.totalStars ?? (error ? 'Error' : '—')}
              </h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag cyan"><FiGitBranch /></div>
            <div className="stat-info">
              <span className="stat-label">Total Forks</span>
              <h3 className="stat-val mono">
                {loading ? '—' : ghData?.totalForks ?? (error ? 'Error' : '—')}
              </h3>
            </div>
          </div>

          <div className="dev-stat-card glass-card">
            <div className="stat-icon-tag green"><FiUsers /></div>
            <div className="stat-info">
              <span className="stat-label">Followers</span>
              <h3 className="stat-val mono">
                {loading ? '—' : ghData?.followers ?? (error ? 'Error' : '—')}
              </h3>
            </div>
          </div>
        </div>

        {/* Language Breakdown Card */}
        <div className="languages-card glass-card">
          <h3 className="card-title"><FiCode /> Most Used Languages</h3>
          <p className="card-desc">Calculated across public GitHub repositories</p>

          {loading ? (
            <div className="skeleton-bar" />
          ) : languages.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="chart-error" style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
              {error ? `⚠ ${error}` : 'No language data available. Click Sync GitHub to fetch.'}
            </div>
          )}
        </div>

        {/* GitHub Contribution Heatmap */}
        <div className="heatmap-card glass-card">
          <div className="heatmap-header">
            <div>
              <h3 className="card-title"><FiActivity /> Contribution Heatmap</h3>
              <p className="card-desc">GitHub commit & activity history</p>
            </div>
            <span className="badge-year">2025 / 2026</span>
          </div>

          <div className="heatmap-img-wrap">
            <img
              src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&bg_color=0d0d1f&hide_border=true&color=8b5cf6&line=06b6d4&point=f59e0b`}
              alt={`${username}'s Github Contribution Graph`}
              className="heatmap-img"
              onError={e => {
                // Fallback to a simpler heatmap
                e.target.src = `https://ghchart.rshah.org/8b5cf6/${username}`;
                e.target.onerror = null;
              }}
            />
          </div>
        </div>

        {/* Top Repositories */}
        <div className="repos-section">
          <div className="section-header">
            <div className="section-tag">⭐ Featured Repos</div>
            <h2>Top <span className="gradient-text">Repositories</span></h2>
          </div>

          {loading ? (
            <div className="repos-grid grid-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="repo-card glass-card skeleton-repo" />
              ))}
            </div>
          ) : repos.length > 0 ? (
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
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="repo-header">
                    <div className="repo-title-wrap">
                      <FiBook className="repo-icon" />
                      <h3 className="repo-name">{repo.name}</h3>
                    </div>
                    <FiExternalLink className="external-icon" />
                  </div>

                  <p className="repo-desc">{repo.description || 'No description provided.'}</p>

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
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>
              {error
                ? `⚠ ${error} — Click "Sync GitHub" to retry.`
                : 'Click "Sync GitHub" to load your repositories.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}