import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getLeetCode, getCodeforces, getCodeChef, getGitHub, clearCache
} from '../utils/api';
import DonutChart from '../components/ui/DonutChart';
import RatingChart from '../components/ui/RatingChart';
import {
  FiRefreshCw, FiExternalLink, FiAward, FiCheckCircle,
  FiTrendingUp, FiCode, FiActivity, FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Coding.css';

export default function Coding() {
  const { data: portfolioData } = usePortfolio();
  const profile = portfolioData?.profile || {};
  const usernames = profile.codingProfiles || {
    leetcode: 'bytewiz_ujjwal',
    codeforces: 'bytewiz_ujjwal',
    codechef: 'bytewiz_ujjwal',
    gfg: 'bytewiz_ujjwal',
    github: 'bytewiz_ujjwal',
  };

  const [lcData, setLcData] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [ccData, setCcData] = useState(null);
  const [ghData, setGhData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingPlatform, setRatingPlatform] = useState('leetcode');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [lcRes, cfRes, ccRes, ghRes] = await Promise.allSettled([
        getLeetCode(usernames.leetcode),
        getCodeforces(usernames.codeforces),
        getCodeChef(usernames.codechef),
        getGitHub(usernames.github),
      ]);

      if (lcRes.status === 'fulfilled') setLcData(lcRes.value.data.data);
      if (cfRes.status === 'fulfilled') setCfData(cfRes.value.data.data);
      if (ccRes.status === 'fulfilled') setCcData(ccRes.value.data.data);
      if (ghRes.status === 'fulfilled') setGhData(ghRes.value.data.data);
    } catch (err) {
      console.error('Failed fetching coding stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [portfolioData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Clearing cache & fetching fresh stats...', { id: 'refresh' });
    try {
      await Promise.allSettled([
        clearCache('leetcode', usernames.leetcode),
        clearCache('codeforces', usernames.codeforces),
        clearCache('codechef', usernames.codechef),
        clearCache('github', usernames.github),
      ]);
      await fetchStats();
      toast.success('Stats updated with live data!', { id: 'refresh' });
    } catch (e) {
      toast.error('Failed to update live stats', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  // Calculated aggregates
  const lcSolved = lcData?.totalSolved || 0;
  const cfSolved = cfData?.problemsSolved || 0;
  const ccSolved = ccData?.problemsSolved || 0;
  const totalSolved = Math.max(1500, lcSolved + cfSolved + ccSolved);

  const lcContests = lcData?.contestsAttended || 0;
  const cfContests = cfData?.contestsCount || 0;
  const ccContests = ccData?.contestsCount || 0;
  const totalContests = Math.max(75, lcContests + cfContests + ccContests);

  const dsaTopics = profile.dsaTopics || [];

  return (
    <div className="coding-page page">

      {/* Background Orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '10%', left: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 350, height: 350, top: '60%', right: '-5%', opacity: 0.4 }} />

      <div className="container">

        {/* Header Bar */}
        <div className="coding-header glass-card">
          <div className="user-profile-header">
            <div className="user-avatar-wrap">
              <img
                src={profile.photoUrl || '/assets/images/profile.png'}
                alt={profile.name}
                className="user-avatar"
                onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Ujjwal+Choubey&background=8b5cf6&color=fff'; }}
              />
              <span className="online-badge" />
            </div>
            <div>
              <div className="user-title-row">
                <h2>{profile.name || 'Ujjwal Choubey'}</h2>
                <span className="user-handle">@{usernames.leetcode}</span>
              </div>
              <p className="user-subtitle">Competitive Programmer & Full Stack Developer</p>
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

        {/* ── TOP STATS ROW ── */}
        <div className="coding-stats-summary grid-4">
          <div className="summary-card glass-card">
            <div className="card-icon-tag violet"><FiCode /></div>
            <div>
              <span className="summary-label">Total Solved</span>
              <h3 className="summary-val mono">{totalSolved}</h3>
              <span className="summary-sub">Across all platforms</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag cyan"><FiAward /></div>
            <div>
              <span className="summary-label">Total Contests</span>
              <h3 className="summary-val mono">{totalContests}</h3>
              <span className="summary-sub">Rated competitions</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag gold"><FiTrendingUp /></div>
            <div>
              <span className="summary-label">LeetCode Max</span>
              <h3 className="summary-val mono">{lcData?.contestRating ? Math.round(lcData.contestRating) : '1704'}</h3>
              <span className="summary-sub">Top {lcData?.topPercentage ? `${lcData.topPercentage}%` : '8%'}</span>
            </div>
          </div>

          <div className="summary-card glass-card">
            <div className="card-icon-tag green"><FiZap /></div>
            <div>
              <span className="summary-label">Codeforces Title</span>
              <h3 className="summary-val mono">{cfData?.rank ? cfData.rank.toUpperCase() : 'PUPIL'}</h3>
              <span className="summary-sub">Rating: {cfData?.rating || '1218'}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN DASHBOARD GRID (Codolio-Inspired) ── */}
        <div className="coding-dashboard-grid">

          {/* Left Column: Platform Status & DSA Breakdown */}
          <div className="dashboard-col-left">

            {/* Platform Profiles Status Card */}
            <div className="platform-list-card glass-card">
              <h3 className="card-title"><FiCheckCircle /> Platform Profiles</h3>
              <div className="platform-items">
                <a href={`https://leetcode.com/${usernames.leetcode}`} target="_blank" rel="noreferrer" className="platform-row">
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

            {/* LeetCode DSA Difficulty Donut Card */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiActivity /> DSA Breakdown</h3>
              <p className="card-desc">LeetCode Problem Distribution</p>
              <DonutChart
                easy={lcData?.easySolved || 285}
                medium={lcData?.mediumSolved || 751}
                hard={lcData?.hardSolved || 48}
                total={lcData?.totalSolved || 1084}
              />
            </div>

            {/* Competitive Programming Donut Card */}
            <div className="donut-card glass-card">
              <h3 className="card-title"><FiCode /> Competitive Programming</h3>
              <p className="card-desc">Contest Platforms Distribution</p>
              <DonutChart
                total={429}
                items={[
                  { label: 'Codechef', value: 88, color: '#10b981' },
                  { label: 'Codeforces', value: 341, color: '#f59e0b' },
                ]}
              />
            </div>

          </div>

          {/* Right Column: Rating Graph, Topic Breakdown & Contest Ranks */}
          <div className="dashboard-col-right">

            {/* Contest Rating Chart */}
            <div className="chart-card glass-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="card-title"><FiTrendingUp /> Contest Rating History</h3>
                  <p className="card-desc">Progression over time</p>
                </div>
                <div className="platform-tabs">
                  <button
                    className={`tab-btn ${ratingPlatform === 'leetcode' ? 'active' : ''}`}
                    onClick={() => setRatingPlatform('leetcode')}
                  >
                    LeetCode
                  </button>
                  <button
                    className={`tab-btn ${ratingPlatform === 'codeforces' ? 'active' : ''}`}
                    onClick={() => setRatingPlatform('codeforces')}
                  >
                    Codeforces
                  </button>
                  <button
                    className={`tab-btn ${ratingPlatform === 'codechef' ? 'active' : ''}`}
                    onClick={() => setRatingPlatform('codechef')}
                  >
                    CodeChef
                  </button>
                </div>
              </div>

              <RatingChart
                history={
                  ratingPlatform === 'leetcode'
                    ? lcData?.ratingHistory || []
                    : ratingPlatform === 'codeforces'
                    ? cfData?.ratingHistory || []
                    : ccData?.ratingHistory || []
                }
                platform={ratingPlatform.toUpperCase()}
              />
            </div>

            {/* DSA Topic Analysis (Codolio Bar Chart) */}
            <div className="topic-card glass-card">
              <h3 className="card-title"><FiCode /> DSA Topic Analysis</h3>
              <p className="card-desc">Questions solved by algorithm & data structure category</p>
              <div className="topic-bars">
                {dsaTopics.map((topic, idx) => {
                  const maxCount = Math.max(...dsaTopics.map(t => t.count), 400);
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

            {/* Contest Ratings Summary Cards Grid */}
            <div className="contest-ratings-grid grid-3">
              <div className="contest-rank-card glass-card">
                <span className="platform-label leetcode">LeetCode</span>
                <div className="rating-val mono">{lcData?.contestRating ? Math.round(lcData.contestRating) : '1704'}</div>
                <div className="max-val">Max: {lcData?.contestRating ? Math.round(lcData.contestRating) : '1735'}</div>
                <div className="contest-count">Contests: {lcData?.contestsAttended || 41}</div>
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codeforces">Codeforces</span>
                <div className="rating-val mono">{cfData?.rating || '1218'}</div>
                <div className="max-val">Max: {cfData?.maxRating || '1218'}</div>
                <div className="contest-count">Rank: {cfData?.rank || 'Pupil'}</div>
              </div>

              <div className="contest-rank-card glass-card">
                <span className="platform-label codechef">CodeChef</span>
                <div className="rating-val mono">{ccData?.rating || '1520'}</div>
                <div className="max-val">Max: {ccData?.maxRating || '1520'}</div>
                <div className="contest-count">Stars: {(ccData?.stars && ccData.stars !== 'N/A') ? ccData.stars : '2-Star (2★)'}</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}