'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Management',
    href: '/admin/management',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    label: 'Item Registry',
    href: '/admin/registry',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Brand */}
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <span style={brandStyle}>Findbase</span>
        </Link>

        {/* Nav Links */}
        <div style={linksStyle}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ ...navItemStyle, ...(active ? navItemActiveStyle : {}) }}>
                  <span style={{ color: active ? '#1a1a18' : '#aaa', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: active ? 500 : 400,
                    color: active ? '#1a1a18' : '#aaa',
                    letterSpacing: '0.02em',
                  }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={adminBadgeStyle}>Admin</div>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: '64px' }} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const navStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0,
  zIndex: 1000,
  height: '64px',
  background: '#fff',
  borderBottom: '1px solid #e8e4de',
  borderRadius: '0 0 20px 20px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 2rem',
  gap: '2rem',
};

const brandStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontSize: '13px',
  letterSpacing: '0.18em',
  color: '#1a1a18',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const linksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  flex: 1,
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '6px 14px',
  borderRadius: '30px',
  cursor: 'pointer',
  transition: 'background 0.15s',
};

const navItemActiveStyle = {
  background: '#f5f3ef',
};

const adminBadgeStyle = {
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  color: '#888',
  background: '#f5f3ef',
  padding: '4px 12px',
  borderRadius: '20px',
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'transparent',
  border: '1px solid #ddd8d0',
  color: '#888',
  padding: '6px 14px',
  borderRadius: '30px',
  fontSize: '0.78rem',
  fontWeight: 400,
  cursor: 'pointer',
  letterSpacing: '0.02em',
  transition: 'all 0.15s',
};