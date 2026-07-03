import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { upvoteProject } from '../utils/api';
import {
  FiGithub, FiExternalLink, FiFolder, FiStar, FiFilter,
  FiThumbsUp, FiShare2, FiCheckCircle, FiCode, FiX,
  FiLayers, FiCpu, FiZap, FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Projects.css';

const CATEGORIES = ['All', 'Web Dev', 'ML/AI', 'DSA', 'App', 'CLI'];

// Technology brand colors & dots
const TECH_COLORS = {
  JavaScript:         '#f1e05a',
  ReactJS:            '#61dafb',
  React:              '#61dafb',
  'Node.js':          '#68a063',
  ExpressJS:          '#828282',
  MongoDB:            '#47a248',
  'C++':              '#f34b7d',
  Python:             '#3572A5',
  HTML:               '#e34c26',
  CSS:                '#563d7c',
  TailwindCSS:        '#38bdf8',
  TypeScript:         '#3178c6',
  'Jupyter Notebook': '#da5b0a',
};

// Feature Badge Icon Selector
function getFeatureIcon(index) {
  const icons = [<FiCheckCircle />, <FiZap />, <FiLayers />, <FiCpu />, <FiShield />];
  return icons[index % icons.length];
}

export default function Projects() {
  const { data: portfolioData, loading } = usePortfolio();
  const projects = portfolioData?.projects || [];

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [upvoted, setUpvoted] = useState({});

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const featuredProject = projects.find(p => p.featured) || projects[0];

  const handleUpvote = async (e, projId) => {
    e.stopPropagation();
    if (upvoted[projId]) return toast.success('Already upvoted!');

    try {
      await upvoteProject(projId);
      setUpvoted({ ...upvoted, [projId]: true });
      if (selectedProject && selectedProject._id === projId) {
        setSelectedProject({ ...selectedProject, upvotes: (selectedProject.upvotes || 1) + 1 });
      }
      toast.success('Project upvoted! 👍');
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const handleShare = (e, project) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: project.title, url: project.live || project.github });
    } else {
      navigator.clipboard.writeText(project.live || project.github);
      toast.success('Project link copied to clipboard!');
    }
  };

  const handleOpenLive = (e, project) => {
    e.stopPropagation();
    if (project?.live && project.live !== '#' && project.live.trim() !== '') {
      window.open(project.live, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Not Live yet 🚀');
    }
  };

  const handleOpenRepo = (e, project) => {
    e.stopPropagation();
    if (project?.github && project.github !== '#' && project.github.trim() !== '') {
      window.open(project.github, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No Repo linked yet 📁');
    }
  };

  if (loading) return (
    <div className="page loading-container">
      <div className="spinner" />
      <p>Loading projects...</p>
    </div>
  );

  return (
    <div className="projects-page page">

      {/* Orbs */}
      <div className="orb orb-violet" style={{ width: 500, height: 500, top: '5%', left: '-10%', opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 400, height: 400, top: '60%', right: '-8%', opacity: 0.4 }} />

      <div className="container">

        <div className="section-header">
          <div className="section-tag">🚀 Portfolio</div>
          <h2>Featured <span className="gradient-text">Projects</span></h2>
          <p>Explore my recent work across Web Development, AI/ML, and Competitive Programming</p>
        </div>

        {/* ── SPOTLIGHT FEATURED PROJECT ── */}
        {featuredProject && (
          <motion.div
            className="featured-spotlight glass-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setSelectedProject(featuredProject)}
          >
            <div className="spotlight-content">
              <span className="featured-badge"><FiStar /> Featured Spotlight</span>
              <h3 className="spotlight-title">{featuredProject.title}</h3>
              <p className="spotlight-desc">{featuredProject.tagline || featuredProject.description}</p>

              {/* Tech Stack Chips */}
              <div className="spotlight-tech-stack">
                {featuredProject.tech?.map((t, i) => (
                  <span key={i} className="tech-badge">
                    <span className="tech-dot" style={{ backgroundColor: TECH_COLORS[t] || '#8b5cf6' }} />
                    {t}
                  </span>
                ))}
              </div>

              <div className="spotlight-actions">
                <button
                  className={`spotlight-btn live-btn ${(!featuredProject.live || featuredProject.live === '#') ? 'disabled' : ''}`}
                  onClick={e => handleOpenLive(e, featuredProject)}
                >
                  {featuredProject.live && featuredProject.live !== '#' ? (
                    <>Visit App <FiExternalLink size={13} /></>
                  ) : (
                    'Not Live'
                  )}
                </button>

                <button
                  className="spotlight-btn github-btn mono"
                  onClick={e => handleOpenRepo(e, featuredProject)}
                >
                  <FiGithub size={14} /> GitHub
                </button>

                <button className="spotlight-btn details-btn" onClick={() => setSelectedProject(featuredProject)}>
                  Details ↗
                </button>
              </div>
            </div>

            <div className="spotlight-preview">
              <img
                src={featuredProject.image || 'https://picsum.photos/600/400?random=1'}
                alt={featuredProject.title}
                className="spotlight-img"
                onError={e => { e.target.src = 'https://picsum.photos/600/400?random=1'; }}
              />
              <div className="spotlight-img-overlay" />
            </div>
          </motion.div>
        )}

        {/* ── CATEGORY FILTER TABS ── */}
        <div className="category-filter-wrap">
          <span className="filter-label"><FiFilter /> Filter:</span>
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── CODOLIO-STYLE PROJECTS GRID (CLEAN ORIGINAL CARD LAYOUT) ── */}
        <motion.div className="projects-grid grid-3" layout>
          <AnimatePresence>
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project._id || idx}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="codolio-project-card glass-card"
                onClick={() => setSelectedProject(project)}
              >
                {/* Image Banner */}
                <div className="codolio-img-wrap">
                  <img
                    src={project.image || `https://picsum.photos/400/250?random=${idx + 2}`}
                    alt={project.title}
                    className="codolio-img"
                    onError={e => { e.target.src = `https://picsum.photos/400/250?random=${idx + 2}`; }}
                  />
                  <div className="project-category-tag">{project.category}</div>
                </div>

                {/* Card Body */}
                <div className="codolio-card-body">
                  <div className="codolio-title-row">
                    <h3 className="codolio-title">{project.title}</h3>
                  </div>

                  <p className="codolio-desc">{project.tagline || project.description}</p>

                  {/* Tech Stack Colored Brand Dots */}
                  <div className="codolio-lang-dots">
                    {project.tech?.slice(0, 4).map((t, i) => (
                      <span key={i} className="codolio-lang-item">
                        <span className="lang-dot" style={{ backgroundColor: TECH_COLORS[t] || '#8b5cf6' }} />
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="card-action-bar">
                    <button
                      className={`live-demo-btn btn-sm ${(!project.live || project.live === '#') ? 'not-live' : ''}`}
                      onClick={e => handleOpenLive(e, project)}
                    >
                      {project.live && project.live !== '#' ? (
                        <>Visit App <FiExternalLink size={12} /></>
                      ) : (
                        'Not Live'
                      )}
                    </button>

                    <button
                      className="codolio-repo-pill mono"
                      onClick={e => handleOpenRepo(e, project)}
                    >
                      <FiGithub size={12} /> {project.repoName ? 'Repo' : 'Source'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="empty-projects glass-card">
            <FiFolder className="empty-icon" />
            <p>No projects found in this category.</p>
          </div>
        )}

      </div>

      {/* ═════════════════════════════════════════════════════════
          CODOLIO-STYLE PROJECT DETAIL MODAL WITH FULL SCROLLING
      ═════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <motion.div
              className="codolio-modal-card glass-card"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={() => setSelectedProject(null)}>
                <FiX />
              </button>

              <div className="codolio-modal-grid">

                {/* Left Content Column */}
                <div className="modal-col-left">

                  {/* Header Row */}
                  <div className="modal-header-row">
                    <div className="modal-logo-wrap">
                      {selectedProject.logo ? (
                        <img src={selectedProject.logo} alt="logo" className="project-logo-img" />
                      ) : (
                        <div className="project-logo-fallback mono">
                          {selectedProject.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="modal-title-wrap">
                      <h2 className="modal-project-title">{selectedProject.title}</h2>
                      <p className="modal-project-tagline">{selectedProject.tagline || selectedProject.description}</p>
                    </div>

                    <button
                      className={`btn btn-primary btn-sm modal-visit-btn ${(!selectedProject.live || selectedProject.live === '#') ? 'btn-disabled' : ''}`}
                      onClick={e => handleOpenLive(e, selectedProject)}
                    >
                      {selectedProject.live && selectedProject.live !== '#' ? (
                        <>Visit App <FiExternalLink size={13} /></>
                      ) : (
                        'Not Live'
                      )}
                    </button>
                  </div>

                  {/* Cover Image Banner */}
                  {selectedProject.image && (
                    <div className="modal-banner-wrap">
                      <img src={selectedProject.image} alt={selectedProject.title} className="modal-banner-img" />
                    </div>
                  )}

                  {/* Actions Row (Upvote + Share + Repo Pill) */}
                  <div className="modal-actions-row">
                    <button
                      className={`upvote-btn ${upvoted[selectedProject._id] ? 'active' : ''}`}
                      onClick={e => handleUpvote(e, selectedProject._id)}
                    >
                      <FiThumbsUp /> Upvoted <strong>{selectedProject.upvotes || 1}</strong>
                    </button>

                    <button className="share-btn" onClick={e => handleShare(e, selectedProject)}>
                      <FiShare2 /> Share
                    </button>

                    <button
                      className="modal-repo-pill mono"
                      onClick={e => handleOpenRepo(e, selectedProject)}
                    >
                      <FiGithub /> {selectedProject.repoName || 'Source Code'}
                    </button>
                  </div>

                  {/* Tech Stack Languages Row */}
                  <div className="modal-languages-section">
                    <span className="lang-label"><FiCode size={14} /> Languages & Tech Stack:</span>
                    <div className="modal-lang-list">
                      {selectedProject.tech?.map((t, i) => (
                        <span key={i} className="modal-lang-chip">
                          <span className="lang-dot" style={{ backgroundColor: TECH_COLORS[t] || '#8b5cf6' }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KEY FEATURES BULLET BADGES (System Architecture & Highlights) */}
                  {selectedProject.features?.length > 0 && (
                    <div className="modal-features-section">
                      <h4 className="features-section-title">
                        <FiLayers style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Key Features & Architecture Highlights:
                      </h4>
                      <div className="modal-features-badges-grid">
                        {selectedProject.features.map((feat, i) => (
                          <div key={i} className="feature-bullet-badge modal-badge">
                            <span className="feature-icon">{getFeatureIcon(i)}</span>
                            <span className="feature-text">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Description Text */}
                  <div className="modal-description-section">
                    <p className="full-desc-text">{selectedProject.description}</p>
                  </div>

                </div>

                {/* Right Sidebar Column: Project Completeness Gauge */}
                <div className="modal-col-right">
                  <div className="completeness-box">
                    <h4 className="completeness-title">Project Completeness</h4>

                    {/* Gauge Meter Graphic */}
                    <div className="completeness-gauge">
                      <svg viewBox="0 0 100 50" className="gauge-svg">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeDasharray="126" strokeDashoffset="0" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="gauge-text">
                        <span className="gauge-pct mono">100%</span>
                        <span className="gauge-lbl">COMPLETE</span>
                      </div>
                    </div>

                    {/* Checklist */}
                    <ul className="completeness-checklist">
                      <li><FiCheckCircle className="check-icon" /> Project name</li>
                      <li><FiCheckCircle className="check-icon" /> Live App URL</li>
                      <li><FiCheckCircle className="check-icon" /> Tagline</li>
                      <li><FiCheckCircle className="check-icon" /> Category</li>
                      <li><FiCheckCircle className="check-icon" /> Tech Stack</li>
                      <li><FiCheckCircle className="check-icon" /> Architecture Highlights</li>
                      <li><FiCheckCircle className="check-icon" /> Logo</li>
                      <li><FiCheckCircle className="check-icon" /> Banner preview</li>
                    </ul>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}