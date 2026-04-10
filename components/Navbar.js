'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';

  // Close menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        fontFamily: "'DM Sans', -apple-system, sans-serif"
      }}>

        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#0d0d0d',
            textDecoration: 'none',
            letterSpacing: '-0.3px'
          }}
        >
          FIND<span style={{ fontWeight: 300 }}>BASE</span>
        </Link>

        {/* Desktop Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.6rem'
        }} className="desktop-menu">

          {user ? (
            <>
              <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
              <Link href="/items/lost" style={linkStyle}>Lost Items</Link>
              <Link href="/items/found" style={linkStyle}>Found Items</Link>
              <Link href="/claims" style={linkStyle}>Claims</Link>
              {user.role === 'admin' && (
                <Link href="/admin" style={linkStyle}>Admin</Link>
              )}
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#0d0d0d',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                {initials}
              </div>
              <button onClick={logout} style={logoutBtnStyle}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={linkStyle}>Login</Link>
              <Link href="/register" style={linkStyle}>Register</Link>
            </>
          )}
        </div>

        {/* Hamburger Button — mobile only */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="hamburger-btn"
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            width: 36,
            height: 36,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
          }}
        >
          <span style={{
            display: 'block',
            width: 22,
            height: 1.5,
            background: '#0d0d0d',
            borderRadius: 2,
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block',
            width: 22,
            height: 1.5,
            background: '#0d0d0d',
            borderRadius: 2,
            transition: 'opacity 0.2s ease',
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: 'block',
            width: 22,
            height: 1.5,
            background: '#0d0d0d',
            borderRadius: 2,
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className="mobile-drawer"
        style={{
          position: 'fixed',
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 2rem',
          gap: '0.25rem',
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {user ? (
          <>
            {/* User info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingBottom: '1.25rem',
              marginBottom: '0.5rem',
              borderBottom: '0.5px solid rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#0d0d0d',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0d0d0d' }}>
                {user.name || 'My Account'}
              </span>
            </div>

            <MobileLink href="/dashboard" onClick={closeMenu}>Dashboard</MobileLink>
            <MobileLink href="/items/lost" onClick={closeMenu}>Lost Items</MobileLink>
            <MobileLink href="/items/found" onClick={closeMenu}>Found Items</MobileLink>
            <MobileLink href="/claims" onClick={closeMenu}>Claims</MobileLink>
            {user.role === 'admin' && (
              <MobileLink href="/admin" onClick={closeMenu}>Admin</MobileLink>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <button
                onClick={() => { logout(); closeMenu(); }}
                style={{
                  ...logoutBtnStyle,
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <MobileLink href="/login" onClick={closeMenu}>Login</MobileLink>
            <MobileLink href="/register" onClick={closeMenu}>Register</MobileLink>
          </>
        )}
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            top: 60,
            background: 'rgba(0,0,0,0.15)',
            zIndex: 98,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function MobileLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        fontSize: 15,
        color: '#0d0d0d',
        textDecoration: 'none',
        fontWeight: 400,
        padding: '12px 0',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}
    >
      {children}
    </Link>
  );
}

const linkStyle = {
  fontSize: 13,
  color: '#888',
  textDecoration: 'none',
  fontWeight: 400,
};

const logoutBtnStyle = {
  border: '0.5px solid rgba(0,0,0,0.2)',
  padding: '6px 12px',
  borderRadius: 8,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
};