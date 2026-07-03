import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getLeetCode, getCodeforces, getCodeChef, clearCache,
} from '../utils/api';
import DonutChart from '../components/ui/DonutChart';
import RatingChart from '../components/ui/RatingChart';
import {
  FiRefreshCw, FiExternalLink, FiAward, FiCheckCircle,
  FiTrendingUp, FiCode, FiActivity, FiZap, FiClock, FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Coding.css';

const LS_KEY = 'coding_last_synced';

// Helper: "2 minutes ago" / "30 minutes ago" etc.
function timeAgo(isoStr) {
  if (!isoStr) return null;
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day(s) ago`;
}

export default function Coding() {
  const { data: portfolioData } = usePortfolio();
  const profile  = portfolioData?.profile || {};

  // ── Real usernames from DB (with correct keys) ──
  const usernames = {
    leetcode:   profile.codingProfiles?.leetcode         || 'bytewiz__ujjwal',
    codeforces: profile.codingProfiles?.codeforces       || 'bytewiz_ujjwal',
    codechef:   profile.codingProfiles?.codechef         || 'byte_wizard11',
    gfg:        profile.codingProfiles?.geeksforgeeks    || 'bytewiz_ujjwal',
    github:     profile.codingProfiles?.github           || 'ujjwal11gits',
  };

  const [lcData, setLcData] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [ccData, setCcData] = useState(null);

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors,     setErrors]     = useState({});  // { leetcode: 'msg', codeforces: 'msg', ... }
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem(LS_KEY) || null);
  const [ratingPlatform, setRatingPlatform] = useState('leetcode');

  // Only run once on mount (not on every portfolioData change)
  const hasFetched = useRef(false);

  const fetchStats = useCallback(async (force = false) => {
    const newErrors = {};

    try {
      const [lcRes, cfRes, ccRes] = await Promise.allSettled([
        getLeetCode(usernames.leetcode),
        getCodeforces(usernames.codeforces),
        getCodeChef(usernames.codechef),
      ]);

      if (lcRes.status === 'fulfilled' && lcRes.value.data?.success) {
        setLcData(lcRes.value.data.data);
      } else {
        newErrors.leetcode = lcRes.reason?.message || 'LeetCode fetch failed';
        console.warn('[Coding] LeetCode error:', newErrors.leetcode);
      }

      if (cfRes.status === 'fulfilled' && cfRes.value.data?.success) {
        setCfData(cfRes.value.data.data);
      } else {
        newErrors.codeforces = cfRes.reason?.message || 'Codeforces fetch failed';
        console.warn('[Coding] Codeforces error:', newErrors.codeforces);
      }

      if (ccRes.status === 'fulfilled' && ccRes.value.data?.success) {
        setCcData(ccRes.value.data.data);
      } else {
        newErrors.codechef = ccRes.reason?.message || 'CodeChef fetch failed';
        console.warn('[Coding] CodeChef error:', newErrors.codechef);
      }

    } catch (err) {
      console.error('[Coding] fetchStats error:', err);
    }

    setErrors(newErrors);

    // Update last synced timestamp
    const now = new Date().toISOString();
    localStorage.setItem(LS_KEY, now);
    setLastSynced(now);
  }, [usernames.leetcode, usernames.codeforces, usernames.codechef]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, []); // ← empty deps: run once on mount only

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Clearing cache & fetching fresh data...', { id: 'refresh' });
    try {
      // Clear server-side caches
      await Promise.allSettled([
        clearCache('leetcode',   usernames.leetcode),
        clearCache('codeforces', usernames.codeforces),
        clearCache('codechef',   usernames.codechef),
      ]);
      await fetchStats(true);
      toast.success('All stats refreshed with live data!', { id: 'refresh' });
    } catch (e) {
      toast.error('Partial refresh — check console for errors', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  // ── Aggregated stats (only real data, no fake floors) ──
  const lcSolved    = lcData?.totalSolved      || 0;
  const cfSolved    = cfData?.problemsSolved   || 0;
  const ccSolved    = ccData?.problemsSolved   || 0;
  const totalSolved = lcSolved + cfSolved + ccSolved;

  const lcContests    = lcData?.contestsAttended || 0;
  const cfContests    = cfData?.contestsCount    || 0;
  const ccContests    = ccData?.contestsCount    || 0;
  const totalContests = lcContests + cfContests + ccContests;

  const dsaTopics = profile.dsaTopics || [];

  // Rating history for selected platform
  const ratingHistory =
    ratingPlatform === 'leetcode'   ? (lcData?.ratingHistory   || []) :
    ratingPlatform === 'codeforces' ? (cfData?.ratingHistory   || []) :
                                       (ccData?.ratingHistory   || []);

  return (
    <div className="coding-page page">

      {/* Background Orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '10%', left: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, top: '60%', right: '-5%', opacity: 0.4 }} />

      <div className="container">

        {/* ── HEADER BAR ── */}
        <div className="coding-header glass-card">
          <div className="user-profile-header">
            <div className="user-avatar-wrap">
              <img
                src={profile.photoUrl || '/assets/images/profile.png'}
                alt={profile.name}
                className="user-avatar"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U C')}&background=8b5cf6&color=fff`; }}
              />
              <span className="online-badge" />
            </div>
            <div>
              <div className="user-title-row">
                <h2>{profile.name || 'Ujjwal Choubey'}</h2>
                <span className="user-handle">@{usernames.leetcode}</span>
              </div>
              <p className="user-subtitle">Competitive Programmer & Full Stack Developer</p>
              {/* Last synced timestamp */}
              {lastSynced && (
                <p className="last-synced-text">
                  <FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Synced {timeAgo(lastSynced)}
                </p>
              )}
            </div>
          </div>

          <div className="coding-header-actions">
            <button
              className={`btn btn-outline ${refreshing ? 'disabled' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Live Data'}
            </button>
          </div>
        </div>

        {/* ── TOP STATS SUMMARY ── */}
        <div className="coding-stats-summary grid-4">
          <div className="summary-card glass-card">
            <div className="card-icon-tag violet"><FiCode /></div>
            <div>
              <span className="summary-label">Total Solved</span>
              <h3 className="summary-val mono">
                {loading ? '—' : totalSolved > 0 ? totalSolved : '—'}
              </h3>
              <span className="summary-sub">LC + CF + CC combined</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag cyan"><FiAward /></div>
            <div>
              <span className="summary-label">Total Contests</span>
              <h3 className="summary-val mono">
                {loading ? '—' : totalContests > 0 ? totalContests : '—'}
              </h3>
              <span className="summary-sub">Rated competitions</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag gold"><FiTrendingUp /></div>
            <div>
              <span className="summary-label">LeetCode Rating</span>
              <h3 className="summary-val mono">
                {loading ? '—' : lcData?.contestRating ? Math.round(lcData.contestRating) : (errors.leetcode ? 'Error' : '—')}
              </h3>
              <span className="summary-sub">
                {lcData?.topPercentage ? `Top ${lcData.topPercentage.toFixed(1)}%` : 'Rated'}
              </span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag green"><FiZap /></div>
            <div>
              <span className="summary-label">Codeforces</span>
              <h3 className="summary-val mono">
                {loading ? '—' : cfData?.rank ? cfData.rank.charAt(0).toUpperCase() + cfData.rank.slice(1) : (errors.codeforces ? 'Error' : '—')}
              </h3>
              <span className="summary-sub">
                Rating: {cfData?.rating || (loading ? '…' : '—')}
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN DASHBOARD GRID ── */}
        <div className="coding-dashboard-grid">

          {/* Left Column */}
          <div className="dashboard-col-left">

            {/* Platform Profiles */}
            <div className="platform-list-card glass-card">
              <h3 className="card-title"><FiCheckCircle /> Platform Profiles</h3>
              <div className="platform-items">

                {/* LeetCode — correct URL uses /u/ prefix */}
                <a
                  href={`https://leetcode.com/u/${usernames.leetcode}`}
                  target="_blank" rel="noreferrer"
                  className="platform-row"
                >
                  <div className="platform-brand">
                    <span className="platform-dot leetcode" />
                    <strong>LeetCode</strong>
                    {errors.leetcode && <FiAlertCircle className="platform-err-icon" title={errors.leetcode} />}
                  </div>
                  <span className="platform-handle mono">
                    @{usernames.leetcode}
                    {lcData && <span className="platform-stat"> · {lcData.totalSolved} solved</span>}
                    <FiExternalLink />
                  </span>
                </a>

                {/* Codeforces */}
                <a
                  href={`https://codeforces.com/profile/${usernames.codeforces}`}
                  target="_blank" rel="noreferrer"
                  className="platform-row"
                >
                  <div className="platform-brand">
                    <span className="platform-dot codeforces" />
                    <strong>Codeforces</strong>
                    {errors.codeforces && <FiAlertCircle className="platform-err-icon" title={errors.codeforces} />}
                  </div>
                  <span className="platform-handle mono">
                    @{usernames.codeforces}
                    {cfData && <span className="platform-stat"> · {cfData.rating} ({cfData.rank})</span>}
                    <FiExternalLink />
                  </span>
                </a>

                {/* CodeChef */}
                <a
                  href={`https://www.codechef.com/users/${usernames.codechef}`}
                  target="_blank" rel="noreferrer"
                  className="platform-row"
                >
                  <div className="platform-brand">
                    <span className="platform-dot codechef" />
                    <strong>CodeChef</strong>
                    {errors.codechef && <FiAlertCircle className="platform-err-icon" title={errors.codechef} />}
                  </div>
                  <span className="platform-handle mono">
                    @{usernames.codechef}
                    {ccData && !ccData.apiDown && <span className="platform-stat"> · {ccData.stars}</span>}
                    {ccData?.apiDown && <span className="platform-stat platform-stat-warn"> · API down</span>}
                    <FiExternalLink />
                  </span>
                </a>

                {/* GFG */}
                <a
                  href={`https://www.geeksforgeeks.org/user/${usernames.gfg}`}
                  target="_blank" rel="noreferrer"
                  className="platform-row"
                >
                  <div className="platform-brand">
                    <span className="platform-dot gfg" />
                    <strong>GeeksForGeeks</strong>
                  </div>
                  <span className="platform-handle mono">@{usernames.gfg} <FiExternalLink /></span>
                </a>

              </div>
            </div>

            {/* LeetCode DSA Difficulty Donut */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiActivity /> DSA Breakdown</h3>
              <p className="card-desc">LeetCode Problem Distribution</p>
              {loading ? (
                <div className="skeleton-donut" />
              ) : lcData ? (
                <DonutChart
                  easy={lcData.easySolved}
                  medium={lcData.mediumSolved}
                  hard={lcData.hardSolved}
                  total={lcData.totalSolved}
                />
              ) : (
                <div className="chart-error">
                  <FiAlertCircle /> Unable to load LeetCode data
                </div>
              )}
            </div>

            {/* Competitive Programming Donut — CF + CC solved */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiCode /> Competitive Programming</h3>
              <p className="card-desc">Contest Platforms Distribution</p>
              {loading ? (
                <div className="skeleton-donut" />
              ) : (cfData || ccData) ? (
                <DonutChart
                  total={(cfData?.problemsSolved || 0) + (ccData?.problemsSolved || 0)}
                  items={[
                    { label: 'Codeforces', value: cfData?.problemsSolved || 0, color: '#06b6d4' },
                    { label: 'CodeChef',   value: ccData?.problemsSolved || 0, color: '#10b981' },
                  ]}
                />
              ) : (
                <div className="chart-error">
                  <FiAlertCircle /> Unable to load data
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="dashboard-col-right">

            {/* Contest Rating Chart */}
            <div className="chart-card glass-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="card-title"><FiTrendingUp /> Contest Rating History</h3>
                  <p className="card-desc">Progression over rated contests</p>
                </div>
                <div className="platform-tabs">
                  {['leetcode', 'codeforces', 'codechef'].map(p => (
                    <button
                      key={p}
                      className={`tab-btn ${ratingPlatform === p ? 'active' : ''}`}
                      onClick={() => setRatingPlatform(p)}
                    >
                      {p === 'leetcode' ? 'LeetCode' : p === 'codeforces' ? 'Codeforces' : 'CodeChef'}
                    </button>
                  ))}
                </div>
              </div>

              <RatingChart
                history={ratingHistory}
                platform={ratingPlatform.toUpperCase()}
                loading={loading}
              />
            </div>

            {/* DSA Topic Analysis */}
            {dsaTopics.length > 0 && (
              <div className="topic-card glass-card">
                <h3 className="card-title"><FiCode /> DSA Topic Analysis</h3>
                <p className="card-desc">Questions solved by algorithm & data structure category</p>
                <div className="topic-bars">
                  {dsaTopics.map((topic, idx) => {
                    const maxCount = Math.max(...dsaTopics.map(t => t.count), 1);
                    const pct = Math.round((topic.count / maxCount) * 100);
                    return (
                      <div key={idx} className="topic-bar-row">
                        <div className="topic-info">
                          <span className="topic-name">{topic.topic}</span>
                          <span className="topic-count mono">{topic.count}</span>
                        </div>
                        <div className="topic-track">
                          <div className="topic-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contest Ratings Summary Cards */}
            <div className="contest-ratings-grid grid-3">

              <div className="contest-rank-card glass-card">
                <span className="platform-label leetcode">LeetCode</span>
                {loading ? (
                  <div className="skeleton-val" />
                ) : lcData ? (
                  <>
                    <div className="rating-val mono">{Math.round(lcData.contestRating) || '—'}</div>
                    <div className="max-val">Contests: {lcData.contestsAttended}</div>
                    <div className="contest-count">Solved: {lcData.totalSolved}</div>
                  </>
                ) : (
                  <div className="contest-count" style={{ color: '#f87171' }}>Data unavailable</div>
                )}
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codeforces">Codeforces</span>
                {loading ? (
                  <div className="skeleton-val" />
                ) : cfData ? (
                  <>
                    <div className="rating-val mono">{cfData.rating || '—'}</div>
                    <div className="max-val">Max: {cfData.maxRating}</div>
                    <div className="contest-count">
                      {cfData.rank.charAt(0).toUpperCase() + cfData.rank.slice(1)}
                    </div>
                  </>
                ) : (
                  <div className="contest-count" style={{ color: '#f87171' }}>Data unavailable</div>
                )}
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codechef">CodeChef</span>
                {loading ? (
                  <div className="skeleton-val" />
                ) : ccData && !ccData.apiDown ? (
                  <>
                    <div className="rating-val mono">{ccData.rating || '—'}</div>
                    <div className="max-val">Max: {ccData.maxRating}</div>
                    <div className="contest-count">{ccData.stars}</div>
                  </>
                ) : ccData?.apiDown ? (
                  <div className="contest-count" style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                    API temporarily down
                  </div>
                ) : (
                  <div className="contest-count" style={{ color: '#f87171' }}>Data unavailable</div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}