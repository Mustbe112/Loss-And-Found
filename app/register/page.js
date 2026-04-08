'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm)
      return setError('Passwords do not match');

    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);
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

        /* Left panel */
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

        .left-content {
          z-index: 1;
        }
        .left-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 1.2rem;
        }
        .left-content h2 em {
          font-style: normal;
          color: #d4d4d4;
        }
        .left-content p {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 280px;
        }

        .features {
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .feature-check {
          width: 18px; height: 18px;
          flex-shrink: 0;
        }
        .feature-item span {
          color: #777;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
        }

        /* Right panel */
        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #fafafa;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
        }

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
          background: #fff5f5;
          border-left: 3px solid #cc3333;
          color: #cc3333;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .field {
          margin-bottom: 1.1rem;
        }
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
          transition: border-color 0.2s;
        }
        .field input:focus { border-color: #0d0d0d; }
        .field input::placeholder { color: #bbb; }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
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
          margin-top: 0.75rem;
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

        .terms {
          color: #aaa;
          font-size: 0.78rem;
          text-align: center;
          margin-top: 1rem;
          line-height: 1.5;
        }
        .terms a {
          color: #555;
          text-decoration: underline;
        }

        .form-footer {
          text-align: center;
          color: #888;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
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
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        {/* Left decorative panel */}
        <div className="left-panel">
          <div className="brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
            Lost &amp; Found
          </div>

          <div className="left-content">
            <h2>Join the<br/><em>community.</em></h2>
            <p>Report lost items, discover found ones, and help reunite belongings with their rightful owners.</p>
          </div>

          <div className="features">
            {[
              'Post lost or found items instantly',
              'Get notified on matching items',
              'Connect directly with finders',
            ].map((text, i) => (
              <div key={i} className="feature-item">
                <svg className="feature-check" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="1.5"/>
                  <path d="M8.5 12L11 14.5L15.5 10" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="right-panel">
          <div className="form-card">
            <h1>Create account</h1>
            <p className="sub">Join the Lost &amp; Found community</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label>Confirm</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="spinner"></span>Creating account</> : 'Create Account'}
              </button>
            </form>

            <p className="terms">
              By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <p className="form-footer">
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}