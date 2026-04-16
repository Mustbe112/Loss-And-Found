'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'email' | 'password' | 'general'
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (serverError, status) => {
    if (!serverError) return { type: 'general', message: 'Something went wrong. Please try again.' };

    const msg = serverError.toLowerCase();

    if (msg.includes('not found') || msg.includes('no user') || msg.includes('email')) {
      return { type: 'email', message: "We couldn't find an account with that email address." };
    }
    if (msg.includes('password') || msg.includes('incorrect') || msg.includes('invalid') || msg.includes('wrong')) {
      return { type: 'password', message: 'Incorrect password. Please try again.' };
    }
    if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('attempts')) {
      return { type: 'general', message: 'Too many failed attempts. Please wait a moment before trying again.' };
    }
    if (status === 401) {
      return { type: 'password', message: 'Your email or password is incorrect.' };
    }
    if (status === 404) {
      return { type: 'email', message: "We couldn't find an account with that email address." };
    }

    return { type: 'general', message: 'Something went wrong. Please try again.' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorType('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const { type, message } = getErrorMessage(data.error, res.status);
      setErrorType(type);
      setError(message);
      return;
    }

    login(data.token, data.user);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        .left-panel {
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }
        .left-panel::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .left-panel::after {
          content: '';
          position: absolute;
          bottom: 60px; left: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          z-index: 1;
        }
        .brand-star { width: 18px; height: 18px; }

        .left-content { z-index: 1; }
        .left-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 1.2rem;
        }
        .left-content h2 em { font-style: normal; color: #d4d4d4; }
        .left-content p {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 280px;
        }

        .left-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 1;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #444; }
        .dot.active { background: #fff; }
        .left-footer-text {
          color: #555;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          margin-left: 0.5rem;
        }

        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #fafafa;
        }

        .form-card { width: 100%; max-width: 400px; }

        .form-card h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #0d0d0d;
          margin-bottom: 0.4rem;
        }
        .form-card .sub {
          color: #888;
          font-size: 0.88rem;
          margin-bottom: 2.5rem;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          background: #fff8f8;
          border: 1px solid #fcd0d0;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          margin-bottom: 1.5rem;
          animation: shake 0.4s ease;
        }
        .error-icon {
          flex-shrink: 0;
          margin-top: 1px;
          color: #c0392b;
        }
        .error-text { flex: 1; }
        .error-title {
          font-size: 0.82rem;
          font-weight: 500;
          color: #c0392b;
          margin-bottom: 2px;
        }
        .error-desc {
          font-size: 0.8rem;
          color: #a94040;
          line-height: 1.5;
        }

        @keyframes shake {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-5px); }
          40%  { transform: translateX(5px); }
          60%  { transform: translateX(-3px); }
          80%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }

        .field { margin-bottom: 1.3rem; }
        .field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 0.5rem;
        }
        .field input {
          width: 100%;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          color: #0d0d0d;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field input:focus { border-color: #0d0d0d; }
        .field input::placeholder { color: #bbb; }
        .field input.input-error {
          border-color: #e57373;
          background: #fffafa;
        }
        .field input.input-error:focus {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.08);
        }

        .submit-btn {
          width: 100%;
          background: #0d0d0d;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.85rem;
          font-size: 0.85rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s, opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .submit-btn:hover { background: #222; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-footer {
          text-align: center;
          color: #888;
          margin-top: 1.8rem;
          font-size: 0.85rem;
        }
        .form-footer a {
          color: #0d0d0d;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #0d0d0d;
          padding-bottom: 1px;
        }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { background: #fff; padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="page">
        <div className="left-panel">
          <div className="brand">
            <svg className="brand-star" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
            Lost &amp; Found
          </div>
          <div className="left-content">
            <h2>Find what<br/><em>matters most.</em></h2>
            <p>A trusted platform connecting people with their lost belongings — fast, simple, and community-driven.</p>
          </div>
          <div className="left-footer">
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <span className="left-footer-text">Trusted by thousands</span>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-card">
            <h1>Welcome back</h1>
            <p className="sub">Sign in to your account</p>

            {error && (
              <div className="error-box" key={error}>
                <svg className="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="1.5"/>
                  <path d="M12 7v5.5M12 16.5v.5" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="error-text">
                  <div className="error-title">
                    {errorType === 'email' && 'Account not found'}
                    {errorType === 'password' && 'Incorrect password'}
                    {errorType === 'general' && 'Sign in failed'}
                  </div>
                  <div className="error-desc">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); setErrorType(''); }}
                  className={errorType === 'email' ? 'input-error' : ''}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); setErrorType(''); }}
                  className={errorType === 'password' ? 'input-error' : ''}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="spinner"></span>Signing in</> : 'Sign In'}
              </button>
            </form>

            <p className="form-footer">
              No account yet?{' '}
              <Link href="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}