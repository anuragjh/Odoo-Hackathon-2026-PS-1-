import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  LayoutGrid,
  Boxes,
  FolderTree,
  CalendarDays,
  Wrench,
  FileCheck,
  BarChart3,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Building2,
  Bell,
  ChevronDown,
} from 'lucide-react';

/* ── Navigation Structure (mirrors blueprint) ────────────────── */
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard',    path: '/dashboard',              icon: LayoutGrid },
    ],
  },
  {
    label: 'Asset Management',
    items: [
      { name: 'Assets',             path: '/dashboard/assets',        icon: Boxes },
      { name: 'Allocation & Transfer', path: '/dashboard/allocations', icon: FolderTree },
      { name: 'Resource Booking',   path: '/dashboard/bookings',      icon: CalendarDays },
      { name: 'Maintenance',        path: '/dashboard/maintenance',   icon: Wrench },
    ],
  },
  {
    label: 'Reporting',
    items: [
      { name: 'Audit',       path: '/dashboard/audits',    icon: FileCheck },
      { name: 'Reports',     path: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Organisation Setup', path: '/dashboard/organization', icon: Building2 },
      { name: 'Team',               path: '/dashboard/team',         icon: Users },
      { name: 'Settings',           path: '/dashboard/settings',     icon: SettingsIcon },
      { name: 'Help',               path: '/dashboard/help',         icon: HelpCircle },
    ],
  },
];

/* ── Helper: get initials ─────────────────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notificationCount } = useContext(AppContext);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => navigate('/');

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside className="af-sidebar">
        {/* Logo */}
        <div className="af-sidebar-logo">
          <div className="af-sidebar-logo-mark">
            <Boxes size={16} color="#fff" />
          </div>
          <span className="af-sidebar-logo-text">
            Asset<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="af-sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: '0.25rem' }}>
              <div className="af-sidebar-section-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`af-nav-item${active ? ' active' : ''}`}
                  >
                    <Icon size={15} />
                    <span>{item.name}</span>
                    {item.name === 'Notifications' && notificationCount > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: 'var(--danger)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          borderRadius: '999px',
                          padding: '1px 6px',
                          lineHeight: '1.5',
                        }}
                      >
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — User + Logout */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '0.75rem 0.5rem',
          }}
        >
          {/* User row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.625rem',
              borderRadius: 'var(--radius)',
              marginBottom: '2px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--accent-bg)',
                border: '1.5px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              {getInitials(currentUser?.name)}
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '0.6375rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {currentUser?.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="af-nav-item"
            style={{ color: 'var(--text-muted)', width: '100%' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-base)',
          minWidth: 0,
        }}
      >
        {/* Top Header */}
        <header className="af-header">
          {/* Left — breadcrumb / page indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                padding: '3px 10px',
                borderRadius: '999px',
              }}
            >
              AssetFlow ERP
            </span>
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                aria-label="Notifications"
              >
                <Bell size={15} />
                {notificationCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--danger)',
                      color: '#fff',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: 'var(--border-default)' }} />

            {/* User Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--accent-bg)',
                  border: '1.5px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: 'var(--accent)',
                }}
              >
                {getInitials(currentUser?.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser?.name?.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
