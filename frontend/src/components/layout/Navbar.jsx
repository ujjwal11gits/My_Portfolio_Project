import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',             label: 'Home' },
  { to: '/about',        label: 'About' },
  { to: '/coding',       label: 'Coding' },
  { to: '/dev-stats',    label: 'Dev Stats' },
  { to: '/projects',     label: 'Projects' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact',      label: 'Contact' },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const { data } = usePortfolio();
  const location = useLocation();
  const name = data?.profile?.name || 'Ujjwal Choubey';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">

        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-name gradient-text">
            {name.split(' ')[0]}
          </span>
          <span className="logo-bracket">/&gt;</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA + Hamburger */}
        <div className="navbar-actions">
          <a
            href={data?.profile?.resumeUrl || '#'}
            target="_blank" rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            Resume
          </a>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        <a
          href={data?.profile?.resumeUrl || '#'}
          className="btn btn-primary"
          style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
        >
          Download Resume
        </a>
      </div>
    </header>
  );
}
