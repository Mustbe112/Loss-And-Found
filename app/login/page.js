'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);
    login(data.token, data.user);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🔍 Welcome Back</h1>
        <p style={subtitleStyle}>Login to your account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={footerStyle}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#e94560' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: '#0f0f1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const cardStyle = {
  background: '#1a1a2e',
  borderRadius: '12px',
  padding: '2.5rem',
  width: '100%',
  maxWidth: '420px',
  border: '1px solid #333',
};

const titleStyle = {
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#e94560',
  marginBottom: '0.5rem',
};

const subtitleStyle = {
  color: '#aaa',
  marginBottom: '2rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const labelStyle = {
  color: '#ccc',
  fontSize: '0.9rem',
};

const errorStyle = {
  background: '#ff000020',
  border: '1px solid #ff000060',
  color: '#ff6b6b',
  padding: '0.8rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  fontSize: '0.9rem',
};

const btnStyle = {
  background: '#e94560',
  color: '#fff',
  border: 'none',
  padding: '0.8rem',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 'bold',
  marginTop: '0.5rem',
};

const footerStyle = {
  textAlign: 'center',
  color: '#aaa',
  marginTop: '1.5rem',
  fontSize: '0.9rem',
};