'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '0 2rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}>
        🔍 Lost & Found
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link href="/items/lost/new" style={linkStyle}>Report Lost</Link>
            <Link href="/items/found/new" style={linkStyle}>Report Found</Link>
            {user.role === 'admin' && (
              <Link href="/admin" style={linkStyle}>Admin</Link>
            )}
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Hi, {user.name}</span>
            <button onClick={logout} style={btnStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Login</Link>
            <Link href="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '0.95rem',
};

const btnStyle = {
  background: '#e94560',
  color: '#fff',
  border: 'none',
  padding: '0.4rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
};