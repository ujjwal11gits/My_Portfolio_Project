import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getLeetCode, getCodeforces, getCodeChef, getGFG, clearCache,
} from '../utils/api';
import DonutChart from '../components/ui/DonutChart';
import RatingChart from '../components/ui/RatingChart';
import {
  FiRefreshCw, FiExternalLink, FiAward, FiCheckCircle,
  FiTrendingUp, FiCode, FiActivity, FiZap, FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Coding.css';

const LS_KEY = 'coding_last_synced';

function timeAgo(isoStr) {
  if (!isoStr) return null;
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day(s) ago`;
}

export default function Coding() {
  const { data: portfolioData } = usePortfolio();
  const profile = portfolioData?.profile || {};

  const usernames = {
    leetcode:   profile.codingProfiles?.leetcode      || 'bytewiz__ujjwal',
    codeforces: profile.codingProfiles?.codeforces    || 'bytewiz_ujjwal',
    codechef:   profile.codingProfiles?.codechef      || 'byte_wizard11',
    gfg:        profile.codingProfiles?.geeksforgeeks || 'bytewiz_ujjwal',
    github:     profile.codingProfiles?.github        || 'ujjwal11gits',
  };

  const [lcData,  setLcData]  = useState(null);
  const [cfData,  setCfData]  = useState(null);
  const [ccData,  setCcData]  = useState(null);
  const [gfgData, setGfgData] = useState(null);

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem(LS_KEY) || null);
  const [ratingPlatform, setRatingPlatform] = useState('leetcode');

  const hasFetched = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const [lcRes, cfRes, ccRes, gfgRes] = await Promise.allSettled([
        getLeetCode(usernames.leetcode),
        getCodeforces(usernames.codeforces),
        getCodeChef(usernames.codechef),
        getGFG(usernames.gfg),
      ]);

      if (lcRes.status  === 'fulfilled' && lcRes.value.data?.success)  setLcData(lcRes.value.data.data);
      if (cfRes.status  === 'fulfilled' && cfRes.value.data?.success)  setCfData(cfRes.value.data.data);
      if (ccRes.status  === 'fulfilled' && ccRes.value.data?.success)  setCcData(ccRes.value.data.data);
      if (gfgRes.status === 'fulfilled' && gfgRes.value.data?.success) setGfgData(gfgRes.value.data.data);

    } catch (err) {
      console.error('[Coding] fetchStats error:', err);
    }

    const now = new Date().toISOString();
    localStorage.setItem(LS_KEY, now);
    setLastSynced(now);
  }, [usernames.leetcode, usernames.codeforces, usernames.codechef, usernames.gfg]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Clearing cache & fetching fresh data...', { id: 'refresh' });
    try {
      await Promise.allSettled([
        clearCache('leetcode',   usernames.leetcode),
        clearCache('codeforces', usernames.codeforces),
        clearCache('codechef',   usernames.codechef),
        clearCache('gfg',        usernames.gfg),
      ]);
      await fetchStats();
      toast.success('All stats refreshed!', { id: 'refresh' });
    } catch (e) {
      toast.error('Partial refresh — check console', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  // ── Aggregates (Real Data Only) ──
  const lcSolved    = lcData?.totalSolved    || 0;
  const cfSolved    = cfData?.problemsSolved || 0;
  const ccSolved    = ccData?.problemsSolved || 0;
  const gfgSolved   = gfgData?.totalSolved   || 0;

  // Total questions across ALL 4 platforms
  const totalSolved = lcSolved + cfSolved + ccSolved + gfgSolved;

  // Total contests across LC, CF, CC
  const lcContests    = lcData?.contestsAttended || 0;
  const cfContests    = cfData?.contestsCount    || 0;
  const ccContests    = ccData?.contestsCount    || 0;
  const totalContests = lcContests + cfContests + ccContests;

  // All-time max rating across platforms
  const lcMaxRating = lcData?.ratingHistory?.length
    ? Math.max(...lcData.ratingHistory.map(h => h.rating))
    : Math.round(lcData?.contestRating || 0);
  const cfMaxRating = cfData?.maxRating || 0;
  const ccMaxRating = ccData?.maxRating || 0;
  const allTimeMaxRating = Math.max(lcMaxRating, cfMaxRating, ccMaxRating);

  const ratingHistory =
    ratingPlatform === 'leetcode'   ? (lcData?.ratingHistory  || []) :
    ratingPlatform === 'codeforces' ? (cfData?.ratingHistory  || []) :
                                       (ccData?.ratingHistory  || []);

  const dsaTopics = profile.dsaTopics || [];

  // 1. DSA Breakdown Items (LeetCode + GFG)
  const dsaTotal = lcSolved + gfgSolved;
  const dsaItems = [
    { label: 'LeetCode', value: lcSolved, color: '#f59e0b' },
    { label: 'GFG',      value: gfgSolved, color: '#22c55e' },
  ].filter(i => i.value > 0);

  // 2. Competitive Programming Breakdown Items (Codeforces + CodeChef)
  const cpTotal = cfSolved + ccSolved;
  const cpItems = [
    { label: 'Codeforces', value: cfSolved, color: '#06b6d4' },
    { label: 'CodeChef',   value: ccSolved, color: '#a855f7' },
  ].filter(i => i.value > 0);

  return (
    <div className="coding-page page">

      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '10%', left: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, top: '60%', right: '-5%', opacity: 0.4 }} />

      <div className="container">

        {/* ── HEADER ── */}
        <div className="coding-header glass-card">
          <div className="user-profile-header">
            <div className="user-avatar-wrap">
              <img
                src={profile.photoUrl || '/assets/images/profile.png'}
                alt={profile.name}
                className="user-avatar"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'UC')}&background=8b5cf6&color=fff`; }}
              />
              <span className="online-badge" />
            </div>
            <div>
              <div className="user-title-row">
                <h2>{profile.name || 'Ujjwal Choubey'}</h2>
                <span className="user-handle">@{usernames.leetcode}</span>
              </div>
              <p className="user-subtitle">Competitive Programmer & Full Stack Developer</p>
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
              <h3 className="summary-val mono">{loading ? '—' : totalSolved || '—'}</h3>
              <span className="summary-sub">LC + GFG + CF + CC</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag cyan"><FiAward /></div>
            <div>
              <span className="summary-label">Total Contests</span>
              <h3 className="summary-val mono">{loading ? '—' : totalContests || '—'}</h3>
              <span className="summary-sub">Rated competitions</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag gold"><FiTrendingUp /></div>
            <div>
              <span className="summary-label">All-Time Max Rating</span>
              <h3 className="summary-val mono">
                {loading ? '—' : allTimeMaxRating || '—'}
              </h3>
              <span className="summary-sub">
                {lcMaxRating === allTimeMaxRating ? 'Peak Rating (LeetCode)' : ccMaxRating === allTimeMaxRating ? 'Peak Rating (CodeChef)' : 'Peak Rating'}
              </span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag green"><FiZap /></div>
            <div>
              <span className="summary-label">Codeforces Rank</span>
              <h3 className="summary-val mono">
                {loading ? '—' : cfData?.rank ? cfData.rank.charAt(0).toUpperCase() + cfData.rank.slice(1) : '—'}
              </h3>
              <span className="summary-sub">Rating: {cfData?.rating || (loading ? '…' : '—')}</span>
            </div>
          </div>

        </div>

        {/* ── MAIN DASHBOARD GRID ── */}
        <div className="coding-dashboard-grid">

          {/* LEFT COLUMN */}
          <div className="dashboard-col-left">

            {/* Platform Profiles — Clean & Elegant */}
            <div className="platform-list-card glass-card">
              <h3 className="card-title"><FiCheckCircle /> Platform Profiles</h3>
              <div className="platform-items">

                <a href={`https://leetcode.com/u/${usernames.leetcode}`} target="_blank" rel="noreferrer" className="platform-row">
                  <div className="platform-brand">
                    <span className="platform-dot leetcode" />
                    <strong>LeetCode</strong>
                  </div>
                  <span className="platform-handle mono">@{usernames.leetcode} <FiExternalLink /></span>
                </a>

                <a href={`https://codeforces.com/profile/${usernames.codeforces}`} target="_blank" rel="noreferrer" className="platform-row">
                  <div className="platform-brand">
                    <span className="platform-dot codeforces" />
                    <strong>Codeforces</strong>
                  </div>
                  <span className="platform-handle mono">@{usernames.codeforces} <FiExternalLink /></span>
                </a>

                <a href={`https://www.codechef.com/users/${usernames.codechef}`} target="_blank" rel="noreferrer" className="platform-row">
                  <div className="platform-brand">
                    <span className="platform-dot codechef" />
                    <strong>CodeChef</strong>
                  </div>
                  <span className="platform-handle mono">@{usernames.codechef} <FiExternalLink /></span>
                </a>

                <a href={`https://www.geeksforgeeks.org/user/${usernames.gfg}`} target="_blank" rel="noreferrer" className="platform-row">
                  <div className="platform-brand">
                    <span className="platform-dot gfg" />
                    <strong>GeeksForGeeks</strong>
                  </div>
                  <span className="platform-handle mono">@{usernames.gfg} <FiExternalLink /></span>
                </a>

              </div>
            </div>

            {/* 1. DSA BREAKDOWN SECTION (LeetCode + GFG) */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiActivity /> DSA Breakdown</h3>
              <p className="card-desc">LeetCode & GeeksForGeeks Questions</p>
              {loading ? (
                <div className="skeleton-donut" />
              ) : dsaItems.length > 0 ? (
                <>
                  <DonutChart
                    total={dsaTotal}
                    items={dsaItems}
                  />

                  {/* Difficulty Breakdown (Easy / Medium / Hard) */}
                  {lcData && (
                    <div className="difficulty-pills">
                      <div className="diff-pill easy">
                        <span className="diff-dot" /> Easy: <strong>{lcData.easySolved || 0}</strong>
                      </div>
                      <div className="diff-pill medium">
                        <span className="diff-dot" /> Med: <strong>{lcData.mediumSolved || 0}</strong>
                      </div>
                      <div className="diff-pill hard">
                        <span className="diff-dot" /> Hard: <strong>{lcData.hardSolved || 0}</strong>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="chart-error">No data available</div>
              )}
            </div>

            {/* 2. COMPETITIVE PROGRAMMING BREAKDOWN SECTION (Codeforces + CodeChef) */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiCode /> Competitive Programming</h3>
              <p className="card-desc">Codeforces & CodeChef Questions</p>
              {loading ? (
                <div className="skeleton-donut" />
              ) : cpItems.length > 0 ? (
                <DonutChart
                  total={cpTotal}
                  items={cpItems}
                />
              ) : (
                <div className="chart-error">No data available</div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
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

            {/* Contest Ratings Summary Grid */}
            <div className="contest-ratings-grid grid-3">

              <div className="contest-rank-card glass-card">
                <span className="platform-label leetcode">LeetCode</span>
                {loading ? <div className="skeleton-val" /> : lcData ? (
                  <>
                    <div className="rating-val mono">{Math.round(lcData.contestRating) || '—'}</div>
                    <div className="max-val">Max: {lcMaxRating}</div>
                    <div className="contest-count">Contests: {lcData.contestsAttended}</div>
                  </>
                ) : (
                  <div className="contest-count" style={{ color: '#f87171', fontSize: '0.78rem' }}>Unavailable</div>
                )}
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codeforces">Codeforces</span>
                {loading ? <div className="skeleton-val" /> : cfData ? (
                  <>
                    <div className="rating-val mono">{cfData.rating || '—'}</div>
                    <div className="max-val">Max: {cfData.maxRating}</div>
                    <div className="contest-count">{cfData.rank.charAt(0).toUpperCase() + cfData.rank.slice(1)}</div>
                  </>
                ) : (
                  <div className="contest-count" style={{ color: '#f87171', fontSize: '0.78rem' }}>Unavailable</div>
                )}
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codechef">CodeChef</span>
                {loading ? <div className="skeleton-val" /> : ccData && !ccData.apiDown ? (
                  <>
                    <div className="rating-val mono">{ccData.rating || '—'}</div>
                    <div className="max-val">Max: {ccData.maxRating}</div>
                    <div className="contest-count">{ccData.stars || '—'}</div>
                  </>
                ) : (
                  <div className="contest-count" style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                    {loading ? '…' : 'Fetching…'}
                  </div>
                )}
              </div>

            </div>

            {/* GFG & Practice Summary Card */}
            {(gfgData && !gfgData.apiDown) && (
              <div className="gfg-stats-card glass-card">
                <h3 className="card-title" style={{ color: '#22c55e' }}>
                  <span style={{ marginRight: 8 }}>🟢</span> GeeksForGeeks Activity
                </h3>
                <div className="gfg-stats-row">
                  <div className="gfg-stat">
                    <span className="gfg-stat-val mono">{gfgData.totalSolved}</span>
                    <span className="gfg-stat-label">Total Solved</span>
                  </div>
                  <div className="gfg-stat">
                    <span className="gfg-stat-val mono">{gfgData.codingScore}</span>
                    <span className="gfg-stat-label">Coding Score</span>
                  </div>
                  <div className="gfg-stat">
                    <span className="gfg-stat-val mono">{gfgData.streak}d</span>
                    <span className="gfg-stat-label">Longest Streak</span>
                  </div>
                </div>
              </div>
            )}

            {/* DSA Topic Analysis (from DB) */}
            {dsaTopics.length > 0 && (
              <div className="topic-card glass-card">
                <h3 className="card-title"><FiCode /> DSA Topic Breakdown</h3>
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

          </div>
        </div>

      </div>
    </div>
  );
}