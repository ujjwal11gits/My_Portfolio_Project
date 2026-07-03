import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiDownload, FiArrowRight, FiCode, FiAward, FiFileText, FiTrendingUp, FiLayers } from 'react-icons/fi';
import { usePortfolio } from '../context/PortfolioContext';
import { handleOpenResume } from '../utils/resumeHelper';
import './Home.css';

/* ── Typewriter Hook (Glitch-Free State Machine) ────────────── */
function useTypewriter(words, speed = 90, deleteSpeed = 40, pause = 1800) {
  const [text, setText]           = useState('');
  const [wordIdx, setWordIdx]     = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[wordIdx % words.length];

    let timer;
    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, speed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pause);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length - 1));
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIdx, words, speed, deleteSpeed, pause]);

  return text;
}

/* ── Particle Canvas ────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(167,139,250,'];
    for (let i = 0; i < 80; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2,
        color,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist/120)})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, delay }) {
  return (
    <motion.div
      className="hero-stat-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="hero-stat-icon"><Icon size={20} /></div>
      <div className="hero-stat-value mono">{value}</div>
      <div className="hero-stat-label">{label}</div>
    </motion.div>
  );
}

const ICON_MAP = { code: FiCode, trophy: FiAward, certificate: FiFileText, rocket: FiTrendingUp };

/* ── HOME PAGE ──────────────────────────────────────────────── */
export default function Home() {
  const { data, loading } = usePortfolio();
  const profile    = data?.profile;
  const taglines   = profile?.taglines   || ['Full Stack Developer', 'Competitive Programmer', 'Problem Solver'];
  const quickStats = profile?.quickStats || [];
  const typedText  = useTypewriter(taglines);

  return (
    <div className="home page">
      <ParticleCanvas />

      {/* Glow Orbs */}
      <div className="orb orb-violet" style={{ width: 500, height: 500, top: '-10%', left: '-10%' }} />
      <div className="orb orb-cyan"   style={{ width: 400, height: 400, bottom: '10%', right: '-5%' }} />

      {/* ── Hero Content ── */}
      <div className="hero-content container">
        <div className="hero-left">
          {/* Greeting */}
          <motion.div
            className="hero-greeting"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="wave">👋</span> Hey there, I'm
          </motion.div>

          {/* Name */}
          <motion.h1
            className="hero-name"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <span className="gradient-text">{profile?.name || 'Ujjwal Choubey'}</span>
          </motion.h1>

          {/* Typewriter */}
          <motion.div
            className="hero-typewriter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="typewriter-prefix">I am a </span>
            <span className="typewriter-text">{typedText}</span>
            <span className="typewriter-cursor">|</span>
          </motion.div>

          {/* Bio */}
          <motion.p
            className="hero-bio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {profile?.bio || 'Passionate developer and competitive programmer who loves turning complex problems into elegant solutions.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link to="/projects" className="btn btn-primary">
              View My Work <FiArrowRight />
            </Link>
            <button
              onClick={e => handleOpenResume(e, profile?.resumeUrl)}
              className="btn btn-outline"
            >
              <FiDownload /> Download Resume
            </button>
          </motion.div>
        </div>

        {/* ── Profile Photo ── */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="profile-ring-outer">
            <div className="profile-ring-inner">
              <img
                src={profile?.photoUrl && profile.photoUrl !== '' ? profile.photoUrl : '/assets/images/profile.png'}
                alt={profile?.name || 'Ujjwal Choubey'}
                className="profile-photo"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=Ujjwal+Choubey&background=8b5cf6&color=fff&size=400';
                }}
              />
            </div>
          </div>

          {/* Floating badges */}
          <div className="floating-badge badge-tl glass-card">
            <span>🏆</span>
            <div>
              <div className="badge-val mono">75+</div>
              <div className="badge-lbl">Contests</div>
            </div>
          </div>
          <div className="floating-badge badge-tr glass-card">
            <span>🚀</span>
            <div>
              <div className="badge-val mono">20+</div>
              <div className="badge-lbl">Projects</div>
            </div>
          </div>
          <div className="floating-badge badge-bl glass-card">
            <span>💡</span>
            <div>
              <div className="badge-val mono">1500+</div>
              <div className="badge-lbl">Solved</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Stats Bar ── */}
      <motion.div
        className="hero-stats container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <StatCard icon={FiCode} value="1500+" label="Problems Solved" delay={0.8} />
        <StatCard icon={FiAward} value="75+" label="Contests Attended" delay={0.9} />
        <StatCard icon={FiTrendingUp} value="1750+" label="LeetCode Max" delay={1.0} />
        <StatCard icon={FiLayers} value="20+" label="Projects Built" delay={1.1} />
      </motion.div>

      {/* ── Featured Call-To-Action Section ── */}
      <motion.section
        className="home-cta-section container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="home-cta-card glass-card">
          <div className="cta-content">
            <span className="section-tag">🤝 Let's Connect</span>
            <h2 className="cta-title">Let's Build Something <span className="gradient-text">Amazing Together</span> 🚀</h2>
            <p className="cta-desc">
              Have an exciting project, full-time engineering role, or freelance collaboration in mind?
              Let's connect and turn high-impact ideas into reality.
            </p>
            <div className="cta-btn-single">
              <Link to="/contact" className="btn btn-primary">
                Get In Touch <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
