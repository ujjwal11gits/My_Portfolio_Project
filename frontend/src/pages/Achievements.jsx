import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { FiAward, FiExternalLink, FiCalendar, FiCheckCircle, FiStar } from 'react-icons/fi';
import './Achievements.css';

export default function Achievements() {
  const { data: portfolioData, loading } = usePortfolio();

  const rawAchievements = portfolioData?.achievements || [];

  // Default fallback data if empty in DB
  const defaultCerts = [
    { name: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta', date: '2024', link: '#', type: 'certification' },
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', link: '#', type: 'certification' },
    { name: 'Problem Solving (Advanced) Certificate', issuer: 'HackerRank', date: '2023', link: '#', type: 'certification' },
    { name: 'Algorithmic Toolbox & Data Structures', issuer: 'UC San Diego / Coursera', date: '2023', link: '#', type: 'certification' },
  ];

  const defaultHackathons = [
    { name: 'Smart India Hackathon (SIH)', position: 'Finalist / Top 10', date: '2024', description: 'Built an AI-driven automated portal for municipal governance issues.', type: 'hackathon' },
    { name: 'Inter-College Coding Contest', position: '1st Rank 🏆', date: '2023', description: 'Secured Rank 1 out of 250+ participants in speed DSA problem solving.', type: 'hackathon' },
    { name: 'Hacktoberfest Open Source Winner', position: 'Top Contributor', date: '2023', description: 'Successfully merged 6+ Pull Requests in prominent open-source repositories.', type: 'hackathon' },
  ];

  const certifications = rawAchievements.filter(a => a.type === 'certification').length > 0
    ? rawAchievements.filter(a => a.type === 'certification')
    : defaultCerts;

  const hackathons = rawAchievements.filter(a => a.type === 'hackathon' || a.type === 'award').length > 0
    ? rawAchievements.filter(a => a.type === 'hackathon' || a.type === 'award')
    : defaultHackathons;

  if (loading) return (
    <div className="page loading-container">
      <div className="spinner" />
      <p>Loading achievements...</p>
    </div>
  );

  return (
    <div className="achievements-page page">

      {/* Orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '10%', right: '-5%', opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 350, height: 350, top: '60%', left: '-5%', opacity: 0.4 }} />

      <div className="container">

        <div className="section-header">
          <div className="section-tag">🏆 Honors & Recognition</div>
          <h2>Achievements & <span className="gradient-text">Certifications</span></h2>
          <p>Verified certifications, contest ranks, and hackathon achievements</p>
        </div>

        {/* ── CERTIFICATIONS SECTION ── */}
        <div className="achievements-section-wrap">
          <h3 className="sub-section-title"><FiCheckCircle /> Verified Certifications</h3>

          <div className="certs-grid grid-2">
            {certifications.map((cert, idx) => (
              <motion.div
                key={idx}
                className="cert-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="cert-badge-icon">
                  <FiAward />
                </div>

                <div className="cert-info">
                  <h4 className="cert-name">{cert.name}</h4>
                  <span className="cert-issuer">{cert.issuer}</span>
                  <div className="cert-meta">
                    <span className="cert-date"><FiCalendar size={12} /> {cert.date}</span>
                    {cert.link && cert.link !== '#' && (
                      <a href={cert.link} target="_blank" rel="noreferrer" className="verify-link">
                        Verify <FiExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── HACKATHONS & COMPETITIONS SECTION ── */}
        <div className="achievements-section-wrap" style={{ marginTop: 64 }}>
          <h3 className="sub-section-title"><FiAward /> Hackathons & Competitions</h3>

          <div className="hackathons-grid grid-3">
            {hackathons.map((hack, idx) => (
              <motion.div
                key={idx}
                className="hack-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="hack-card-top">
                  <span className="position-tag"><FiStar /> {hack.position || hack.type}</span>
                  <span className="hack-date mono">{hack.date}</span>
                </div>

                <h4 className="hack-title">{hack.name}</h4>
                <p className="hack-desc">{hack.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}