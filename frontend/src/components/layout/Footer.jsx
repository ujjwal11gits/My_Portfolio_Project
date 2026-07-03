import { NavLink } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiMail, FiArrowUp, FiSend } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const { data } = usePortfolio();
  const profile = data?.profile;
  const name    = profile?.name   || 'Ujjwal Choubey';
  const social  = profile?.social || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="glow-divider" />

      <div className="footer-container container">
        {/* Left Side: Brand, Bio, Availability & Social Icons */}
        <div className="footer-left">
          <NavLink to="/" className="footer-logo mono">
            <span className="logo-bracket">&lt;</span>
            <span className="gradient-text">{name.split(' ')[0]}</span>
            <span className="logo-bracket">/&gt;</span>
          </NavLink>

          <p className="footer-tagline">
            Building things that matter.<br />One commit at a time. ⚡
          </p>

          <div className="availability-badge">
            <span className="pulse-green-dot" />
            <span>Available for new opportunities</span>
          </div>

          <div className="footer-socials">
            {social.github    && <a href={social.github} target="_blank" rel="noreferrer" title="GitHub"><FiGithub /></a>}
            {social.linkedin  && <a href={social.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><FiLinkedin /></a>}
            {social.twitter   && <a href={social.twitter} target="_blank" rel="noreferrer" title="Twitter"><FiTwitter /></a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" title="Instagram"><FiInstagram /></a>}
            {profile?.email   && <a href={`mailto:${profile.email}`} title="Email"><FiMail /></a>}
          </div>
        </div>

        {/* Right Side: Clean Let's Talk CTA Card */}
        <div className="footer-right">
          <div className="footer-cta-box glass-card">
            <h3>Let's build something together ✨</h3>
            <p>Have an exciting project, role, or collaboration in mind?</p>
            <NavLink to="/contact" className="btn btn-primary btn-sm footer-cta-btn">
              Get In Touch <FiSend size={14} />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} {name}. Crafted with ❤️ using MERN Stack.</p>
          <button className="back-to-top-btn" onClick={scrollToTop} title="Back to top">
            <span>Back to top</span>
            <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
