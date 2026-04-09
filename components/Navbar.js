'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {

  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'ME';

  return (

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
        FIND<span style={{ fontWeight:300 }}>BASE</span>
      </Link>


      {/* Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.6rem'
      }}>

        {user ? (
          <>

            <Link href="/dashboard" style={linkStyle}>Dashboard</Link>

            <Link href="/items/lost" style={linkStyle}>Lost Items</Link>

            <Link href="/items/found" style={linkStyle}>Found Items</Link>

            <Link href="/claims" style={linkStyle}>Claims</Link>

            {user.role === 'admin' && (
              <Link href="/admin" style={linkStyle}>Admin</Link>
            )}

            {/* Avatar */}
            <div style={{
              width:34,
              height:34,
              borderRadius:'50%',
              background:'#0d0d0d',
              color:'#fff',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:12,
              fontWeight:600,
              letterSpacing:'0.05em'
            }}>
              {initials}
            </div>

            <button
              onClick={logout}
              style={{
                border:'0.5px solid rgba(0,0,0,0.2)',
                padding:'6px 12px',
                borderRadius:8,
                background:'transparent',
                cursor:'pointer',
                fontSize:13
              }}
            >
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

    </nav>

  );
}

const linkStyle = {
  fontSize: 13,
  color: '#888',
  textDecoration: 'none',
  fontWeight: 400
};