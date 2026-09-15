import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import LogoMark from './LogoMark';

/**
 * items: [{ to: '/candidate', label: 'My Resume', icon: 'resume', end: true }, ...]
 * `end` should be true for the index route so it doesn't stay highlighted on child routes.
 *
 * Renders as a fixed sidebar on desktop, and a slide-in drawer (triggered by a
 * mobile top bar with a hamburger button) on small screens.
 */
export default function Sidebar({ roleTag, roleLabel, items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer automatically whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navItems = items.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="ic"><Icon name={item.icon} size={16} /></span> {item.label}
    </NavLink>
  ));

  const footer = (
    <div className="sidebar-footer">
      <div className="sidebar-user">
        <div className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
        <div>
          <div className="name">{user?.full_name}</div>
          <div className="role">{roleLabel}</div>
        </div>
      </div>
      <button className="logout-link" onClick={handleLogout}>
        <Icon name="logout" size={12} style={{ marginRight: 5 }} /> Log out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — only visible under the responsive breakpoint */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={20} />
        </button>
        <div className="brand" style={{ fontSize: 16 }}><LogoMark size={22} /> Hire<span className="dot">Mind</span></div>
      </div>

      {/* Backdrop for the mobile drawer */}
      <div
        className={`sidebar-backdrop${mobileOpen ? ' show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <Icon name="x" size={18} />
        </button>
        <div className="brand"><LogoMark /> Hire<span className="dot">Mind</span></div>
        <div className="role-tag">{roleTag}</div>
        {navItems}
        {footer}
      </div>
    </>
  );
}
