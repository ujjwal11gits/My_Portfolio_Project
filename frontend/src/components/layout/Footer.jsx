import { NavLink } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { FiGithub, FiLinkedin, FiInstagram, FiMail, FiArrowUp, FiCode } from 'react-icons/fi';
import './Footer.css';

const NAV_LINKS = [
  { to: '/',             label: 'Home' },
  { to: '/about',        label: 'About' },
  { to: '/projects',     label: 'Projects' },
  { to: '/coding',       label: 'Coding' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact',      label: 'Contact' },
];

export default function Footer() {
  const { data } = usePortfolio();
  const profile = data?.profile;
  const name    = profile?.name || 'Ujjwal Choubey';
  const social  = profile?.socialLinks || profile?.social || {};
  const email   = profile?.email || 'ujjwal11.work@gmail.com';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="glow-divider" />

      <div className="footer-container container">

        {/* Column 1: Brand */}
        <div className="footer-col brand-col">
          <NavLink to="/" className="footer-logo mono">
            <span className="logo-bracket">&lt;</span>
            <span className="gradient-text">{name.split(' ')[0]}</span>
            <span className="logo-ext">.dev</span>
            <span className="logo-bracket">/&gt;</span>
          </NavLink>

          <p className="footer-tagline">
            Building high-performance applications &amp; solving complex problems.
            One commit at a time. ⚡
          </p>

          <div className="availability-badge">
            <span className="pulse-green-dot" />
            <span>Available for new opportunities</span>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="footer-col nav-col">
          <h4 className="footer-col-title"><FiCode size={14} /> Navigation</h4>
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

        {/* Column 3: Socials */}
        <div className="footer-col connect-col">
          <h4 className="footer-col-title">Connect</h4>
          <p className="connect-desc">
            Feel free to reach out for collaborations, projects, or just a chat!
          </p>
          <div className="footer-socials">
            <a
              href={social.github || 'https://github.com/ujjwal11gits'}
              target="_blank" rel="noreferrer" title="GitHub"
            >
              <FiGithub />
              <span>GitHub</span>
            </a>
            <a
              href={social.linkedin || 'https://www.linkedin.com/in/ujjwalkumarchoubey'}
              target="_blank" rel="noreferrer" title="LinkedIn"
            >
              <FiLinkedin />
              <span>LinkedIn</span>
            </a>
            {(social.instagram) && (
              <a href={social.instagram} target="_blank" rel="noreferrer" title="Instagram">
                <FiInstagram />
                <span>Instagram</span>
              </a>
            )}
            <a href={`mailto:${email}`} title="Email">
              <FiMail />
              <span>Email</span>
            </a>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} {name}. Crafted with ❤️ using MERN Stack.</p>
          <button className="back-to-top-btn" onClick={scrollToTop}>
            <span>Back to top</span>
            <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
