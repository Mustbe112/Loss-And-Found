import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '3rem', color: '#e94560', marginBottom: '1rem' }}>
        🔍 Lost & Found
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '500px', marginBottom: '2rem' }}>
        AI-powered lost and found system for your campus or community.
        Report lost items, find matches, and reunite with your belongings.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/register" style={{
          background: '#e94560',
          color: '#fff',
          padding: '0.8rem 2rem',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}>
          Get Started
        </Link>
        <Link href="/login" style={{
          background: 'transparent',
          color: '#fff',
          padding: '0.8rem 2rem',
          borderRadius: '6px',
          textDecoration: 'none',
          border: '1px solid #444',
        }}>
          Login
        </Link>
      </div>
    </main>
  );
}