import { NavLink } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiMail, FiArrowUp } from 'react-icons/fi';
import './Footer.css';

const NAV_LINKS = [
  { to: '/',             label: 'Home' },
  { to: '/about',        label: 'About' },
  { to: '/coding',       label: 'Coding' },
  { to: '/dev-stats',    label: 'Dev Stats' },
  { to: '/projects',     label: 'Projects' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact',      label: 'Contact' },
];

export default function Footer() {
  const { data } = usePortfolio();
  const profile = data?.profile;
  const name    = profile?.name   || 'Ujjwal Choubey';
  const social  = profile?.socialLinks || profile?.social || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="glow-divider" />

      <div className="footer-container container">
        {/* Column 1: Brand & Availability */}
        <div className="footer-col brand-col">
          <NavLink to="/" className="footer-logo mono">
            <span className="logo-bracket">&lt;</span>
            <span className="gradient-text">{name.split(' ')[0]}</span>
            <span className="logo-ext">.dev</span>
            <span className="logo-bracket">/&gt;</span>
          </NavLink>

          <p className="footer-tagline">
            Building high-performance applications & solving complex problems. One commit at a time. ⚡
          </p>

          <div className="availability-badge">
            <span className="pulse-green-dot" />
            <span>Available for new opportunities</span>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="footer-col nav-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-nav-list">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink to={link.to} className="footer-nav-link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Connect & Social Links */}
        <div className="footer-col connect-col">
          <h4 className="footer-col-title">Connect & Socials</h4>
          <p className="connect-desc">Feel free to reach out for collaborations or opportunities.</p>

          <div className="footer-socials">
            {social.github    && <a href={social.github} target="_blank" rel="noreferrer" title="GitHub"><FiGithub /></a>}
            {social.linkedin  && <a href={social.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><FiLinkedin /></a>}
            {social.twitter   && <a href={social.twitter} target="_blank" rel="noreferrer" title="Twitter"><FiTwitter /></a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" title="Instagram"><FiInstagram /></a>}
            {profile?.email   && <a href={`mailto:${profile.email}`} title="Email"><FiMail /></a>}
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
