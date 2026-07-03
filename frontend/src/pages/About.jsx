import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  FiMapPin, FiBook, FiCalendar, FiAward, FiCode,
  FiGithub, FiLinkedin, FiTwitter, FiMail,
} from 'react-icons/fi';
import './About.css';

/* ── Scroll reveal hook (runs after data loading) ──────────────── */
function useReveal(loading) {
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    els.forEach(el => obs.observe(el));

    // Fallback timer to ensure headers are ALWAYS visible even if observer delays
    const timer = setTimeout(() => {
      els.forEach(el => el.classList.add('visible'));
    }, 150);

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [loading]);
}

/* ── Animated Counter ───────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const num = parseInt(target);
        const step = Math.ceil(num / 40);
        let cur = 0;
        const timer = setInterval(() => {
          cur = Math.min(cur + step, num);
          setCount(cur);
          if (cur >= num) clearInterval(timer);
        }, 30);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref} className="counter-val mono">{count}{suffix}</span>;
}

/* ── Skill Bar ──────────────────────────────────────────────── */
function SkillBar({ name, level, delay }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setAnimate(true), delay); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="skill-bar-item">
      <div className="skill-bar-header">
        <span className="skill-name">{name}</span>
        <span className="skill-level mono">{level}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ width: animate ? `${level}%` : '0%' }}
        />
      </div>
    </div>
  );
}

/* ── Timeline Card ──────────────────────────────────────────── */
function TimelineCard({ item, idx }) {
  return (
    <motion.div
      className="timeline-item"
      initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: idx * 0.1 }}
    >
      <div className="timeline-dot">
        <span>{item.icon || '🎓'}</span>
      </div>
      <div className="timeline-card glass-card">
        <div className="timeline-card-header">
          <div>
            <span className="timeline-type">{item.type}</span>
            <h3 className="timeline-institution">{item.institution}</h3>
            <p className="timeline-degree">{item.degree}</p>
          </div>
          <div className="timeline-meta">
            <div className="timeline-duration">
              <FiCalendar size={13} /> {item.duration}
            </div>
            {item.grade && (
              <div className="timeline-grade">
                <FiAward size={13} /> {item.grade}
              </div>
            )}
          </div>
        </div>
        {item.highlights?.length > 0 && (
          <div className="timeline-highlights">
            {item.highlights.map((h, i) => (
              <span key={i} className="tech-badge">{h}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── ABOUT PAGE ─────────────────────────────────────────────── */
export default function About() {
  const { data, loading } = usePortfolio();
  useReveal(loading);

  const profile        = data?.profile        || {};
  const education      = data?.education      || [];
  const extracurriculars = data?.extracurriculars || [];

  const skills = profile.skills || {};
  const social = profile.socialLinks || profile.social || {};

  const quickCounters = [
    { label: 'Years Coding',    value: '3',   suffix: '+' },
    { label: 'Problems Solved', value: '1500', suffix: '+' },
    { label: 'Projects Built',  value: '20',   suffix: '+' },
    { label: 'Certifications',  value: '10',   suffix: '+' },
  ];

  const defaultSkills = {
    languages:  [{ name: 'C', level: 88 }, { name: 'C++', level: 95 }, { name: 'Python', level: 85 }, { name: 'JavaScript', level: 90 }],
    frameworks: [{ name: 'ReactJS', level: 90 }, { name: 'NodeJS', level: 88 }, { name: 'ExpressJS', level: 85 }, { name: 'Tailwind CSS', level: 88 }],
    databases:  [{ name: 'MongoDB', level: 88 }, { name: 'MySQL', level: 85 }, { name: 'Optimized SQL Queries', level: 85 }],
    tools:      [{ name: 'VSCode', level: 92 }, { name: 'Git and GitHub', level: 90 }, { name: 'Jupyter Notebooks', level: 82 }, { name: 'MySQL Workbench', level: 84 }],
    coursework: [{ name: 'DSA', level: 95 }, { name: 'Object Oriented Programming', level: 90 }, { name: 'Operating Systems', level: 88 }, { name: 'DBMS', level: 88 }],
  };

  const activeSkills = {
    languages:  skills.languages?.length  ? skills.languages  : defaultSkills.languages,
    frameworks: skills.frameworks?.length ? skills.frameworks : defaultSkills.frameworks,
    databases:  skills.databases?.length  ? skills.databases  : defaultSkills.databases,
    tools:      skills.tools?.length      ? skills.tools      : defaultSkills.tools,
    coursework: skills.coursework?.length ? skills.coursework : defaultSkills.coursework,
  };

  const skillCategories = [
    { title: 'Languages',                icon: '💻', items: activeSkills.languages },
    { title: 'Frameworks & Libraries',   icon: '🧩', items: activeSkills.frameworks },
    { title: 'Databases & Cloud',        icon: '🗄️', items: activeSkills.databases },
    { title: 'Tools & Version Control',  icon: '🔧', items: activeSkills.tools },
    { title: 'Core Coursework',          icon: '📚', items: activeSkills.coursework },
  ];

  if (loading) return (
    <div className="page loading-container">
      <div className="spinner" />
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="about-page page">

      {/* ── Orbs ── */}
      <div className="orb orb-violet" style={{ width: 400, height: 400, top: '5%', right: '-10%', opacity: 0.6 }} />
      <div className="orb orb-cyan"   style={{ width: 300, height: 300, top: '50%', left: '-8%',  opacity: 0.5 }} />

      {/* ══════════════════════════════════════════
          SECTION 1 — BIO
      ══════════════════════════════════════════ */}
      <section className="section about-bio-section">
        <div className="container">
          <div className="about-bio-grid">

            {/* Photo */}
            <motion.div
              className="about-photo-wrap reveal-left"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="about-photo-frame">
                <img
                  src={profile.photoUrl || '/assets/images/profile.png'}
                  alt={profile.name || 'Ujjwal Choubey'}
                  className="about-photo"
                  onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Ujjwal+Choubey&background=8b5cf6&color=fff&size=300'; }}
                />
                <div className="about-photo-glow" />
              </div>

              {/* Social links under photo */}
              <div className="about-socials">
                {social.github    && <a href={social.github}   target="_blank" rel="noreferrer" className="about-social-link"><FiGithub /></a>}
                {social.linkedin  && <a href={social.linkedin} target="_blank" rel="noreferrer" className="about-social-link"><FiLinkedin /></a>}
                {social.twitter   && <a href={social.twitter}  target="_blank" rel="noreferrer" className="about-social-link"><FiTwitter /></a>}
                {profile.email    && <a href={`mailto:${profile.email}`} className="about-social-link"><FiMail /></a>}
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="about-text reveal-right"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-tag"><FiCode size={14} /> About Me</div>
              <h2>Crafting Code,<br /><span className="gradient-text">One Problem at a Time</span></h2>
              <p className="about-bio-text">{profile.bio || 'Final Year B.Tech CSE student at National Institute of Technology Patna with a strong foundation in Data Structures, Algorithms, Full-Stack Web Development, and AI.'}</p>

              {/* Info pills */}
              <div className="about-info-pills">
                {profile.location  && <div className="info-pill"><FiMapPin size={14}/> {profile.location}</div>}
                {profile.institute && <div className="info-pill"><FiBook size={14}/> {profile.institute}</div>}
                {profile.year      && <div className="info-pill"><FiCalendar size={14}/> {profile.year}</div>}
              </div>

              {/* Quick counters */}
              <div className="about-counters">
                {quickCounters.map((c, i) => (
                  <div key={i} className="about-counter-card glass-card">
                    <Counter target={c.value} suffix={c.suffix} />
                    <span className="counter-label">{c.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ══════════════════════════════════════════
          SECTION 2 — INTERESTS & PASSIONS
      ══════════════════════════════════════════ */}
      <section className="section interests-section">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">✨ What I Love</div>
            <h2>Interests & <span className="gradient-text">Passions</span></h2>
            <p>Core areas of interest, domain specializations, and creative pursuits</p>
          </div>
          <div className="interests-cloud reveal visible">
            {(profile.interests?.length > 0 ? profile.interests : [
              'Competitive Programming 🧠', 'Web Development 🕸️', 'Machine Learning 🤖',
              'Data Structures & Algorithms 💻', 'Open Source 🌐', 'Problem Solving 🔍', 'System Design 🏗️'
            ]).map((interest, i) => (
              <motion.span
                key={i}
                className="interest-pill"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.06, y: -2 }}
              >
                {interest}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ══════════════════════════════════════════
          SECTION 3 — SKILLS & TECHNOLOGIES
      ══════════════════════════════════════════ */}
      <section className="section skills-section">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">🛠️ Technical Skills</div>
            <h2>Skills & <span className="gradient-text">Technologies</span></h2>
            <p>The core programming languages, frameworks, databases, and tools I work with every day</p>
          </div>

          <div className="skills-grid">
            {skillCategories.map((cat, ci) => (
              <motion.div
                key={ci}
                className="skill-category glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1, duration: 0.4 }}
              >
                <div className="skill-category-header">
                  <span className="skill-cat-icon">{cat.icon}</span>
                  <h3 className="skill-cat-title">{cat.title}</h3>
                </div>
                <div className="skill-bars">
                  {cat.items.map((s, si) => (
                    <SkillBar key={si} name={s.name} level={s.level} delay={si * 60} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Soft Skills */}
          {skills.softSkills?.length > 0 && (
            <motion.div
              className="soft-skills-wrap reveal visible"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="soft-skills-title">Soft Skills & Core Competencies</h3>
              <div className="soft-skills-cloud">
                {skills.softSkills.map((s, i) => (
                  <span key={i} className="soft-skill-pill">{s}</span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="glow-divider" />

      {/* ══════════════════════════════════════════
          SECTION 3 — EDUCATION TIMELINE
      ══════════════════════════════════════════ */}
      <section className="section education-section">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">🎓 Academic Journey</div>
            <h2>Education <span className="gradient-text">Timeline</span></h2>
            <p>My academic background from NIT Patna to High School</p>
          </div>

          {education.length > 0 ? (
            <div className="timeline">
              <div className="timeline-line" />
              {education.map((item, i) => (
                <TimelineCard key={item._id || i} item={item} idx={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <span>🎓</span>
              <p>Education details coming soon — update via MongoDB or the Admin Panel</p>
            </div>
          )}
        </div>
      </section>

      <div className="glow-divider" />

      {/* ══════════════════════════════════════════
          SECTION 4 — POSITIONS OF RESPONSIBILITY
      ══════════════════════════════════════════ */}
      <section className="section extras-section">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">🌟 Leadership & Community</div>
            <h2>Positions of <span className="gradient-text">Responsibility</span></h2>
            <p>Key leadership roles, event organization, and mentoring initiatives at NIT Patna</p>
          </div>

          {extracurriculars.length > 0 ? (
            <div className="extras-grid">
              {extracurriculars.map((item, i) => (
                <motion.div
                  key={item._id || i}
                  className="extra-card glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="extra-icon">{item.icon || '🌟'}</div>
                  <h3 className="extra-title">{item.title}</h3>
                  {item.organization && (
                    <p className="extra-org">{item.organization}</p>
                  )}
                  {item.description && (
                    <p className="extra-desc">{item.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <span>🌟</span>
              <p>Extra-curricular activities coming soon — update via MongoDB</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}