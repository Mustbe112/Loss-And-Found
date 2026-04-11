'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .db-page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .db-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* PAGE HEADER */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    /* PROFILE LAYOUT */
    .profile-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1rem;
      align-items: start;
    }

    /* CARD */
    .card {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.09);
      border-radius: 14px;
      padding: 1.4rem;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #0d0d0d;
      padding-bottom: 0.9rem;
      margin-bottom: 1rem;
      border-bottom: 0.5px solid rgba(0,0,0,0.07);
    }
    .card-title svg { color: #888; }

    /* FORM */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 1rem;
    }
    .form-label {
      font-size: 12px;
      font-weight: 500;
      color: #888;
      letter-spacing: 0.02em;
    }
    .form-input {
      width: 100%;
      padding: 9px 12px;
      border: 0.5px solid rgba(0,0,0,0.18);
      border-radius: 8px;
      font-size: 13px;
      font-family: 'DM Sans', -apple-system, sans-serif;
      color: #0d0d0d;
      background: #fafafa;
      outline: none;
      transition: border-color 0.15s;
    }
    .form-input:focus {
      border-color: rgba(0,0,0,0.4);
      background: #fff;
    }
    .form-input:disabled {
      background: #f5f4f0;
      color: #aaa;
      cursor: not-allowed;
    }

    /* BUTTONS */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'DM Sans', -apple-system, sans-serif;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
      border: none;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-solid   { background: #0d0d0d; color: #fff; }
    .btn-outline { background: transparent; color: #0d0d0d; border: 0.5px solid rgba(0,0,0,0.2); }
    .btn-danger  { background: transparent; color: #b91c1c; border: 0.5px solid rgba(185,28,28,0.3); }
    .btn-danger:hover { background: #fdecea; }
    .btn-full    { width: 100%; }

    /* ALERT */
    .alert {
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 1rem;
    }
    .alert-success { background: #e6f4ea; color: #1a6b3c; border: 0.5px solid #b7dfc4; }
    .alert-error   { background: #fdecea; color: #b91c1c; border: 0.5px solid #f5c6c6; }

    /* MODAL OVERLAY */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-box {
      background: #fff;
      border-radius: 14px;
      padding: 1.75rem;
      max-width: 400px;
      width: 100%;
      border: 0.5px solid rgba(0,0,0,0.09);
    }
    .modal-title {
      font-size: 15px;
      font-weight: 700;
      color: #0d0d0d;
      margin-bottom: 0.5rem;
    }
    .modal-desc {
      font-size: 13px;
      color: #888;
      margin-bottom: 1.4rem;
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    /* ── MOBILE ── */
    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .db-inner { padding: 1.25rem 1rem; }
      .page-header { margin-bottom: 1.25rem; }
      .page-header h1 { font-size: 1.4rem !important; }
      .modal-actions { flex-direction: column-reverse; }
      .modal-actions .btn { width: 100%; }
    }
  `}</style>
);

/* ─────────────── ICONS ─────────────── */
function IconUser({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="3" />
      <path d="M2 13.5c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5" />
    </svg>
  );
}
function IconLock({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5h6V4M6 7v5M10 7v5M3 4l.8 9.5a1 1 0 0 0 1 .5h6.4a1 1 0 0 0 1-.5L13 4" />
    </svg>
  );
}
function IconShield({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 4.5v4C3 11.5 5.5 14 8 15c2.5-1 5-3.5 5-6.5v-4L8 2z" />
      <path d="M5.5 8l1.8 1.8L10.5 6" />
    </svg>
  );
}

/* ─────────────── PROFILE SIDEBAR ─────────────── */
function ProfileSidebar({ user }) {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      {/* Avatar */}
      <div style={{
        width: 72, height: 72,
        borderRadius: '50%',
        background: '#0d0d0d',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: '0.05em',
        margin: '0 auto 1rem',
      }}>
        {initials}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: '#0d0d0d', marginBottom: 4 }}>
        {user?.name || '—'}
      </div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 1 }}>{user?.email || '—'}</div>

      {/* Role badge */}
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          background: user?.role === 'admin' ? '#e8f0fe' : '#f0ebfe',
          color: user?.role === 'admin' ? '#1a47a0' : '#5b21b6',
          textTransform: 'capitalize',
        }}>
          {user?.role || 'user'}
        </span>
      </div>

      <div style={{
        padding: '1rem 0',
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
        fontSize: 12,
        color: '#aaa',
      }}>
        Member since {joinDate}
      </div>
    </div>
  );
}

/* ─────────────── CHANGE PASSWORD SECTION ─────────────── */
function ChangePasswordCard({ authFetch }) {
  const [form, setForm]       = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus]   = useState(null); // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setStatus(null);

    if (!form.current || !form.next || !form.confirm) {
      return setStatus({ type: 'error', msg: 'Please fill in all fields.' });
    }
    if (form.next.length < 8) {
      return setStatus({ type: 'error', msg: 'New password must be at least 8 characters.' });
    }
    if (form.next !== form.confirm) {
      return setStatus({ type: 'error', msg: 'New passwords do not match.' });
    }

    setLoading(true);
    try {
      const res  = await authFetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setStatus({ type: 'success', msg: 'Password updated successfully.' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <IconLock size={15} />
        Change Password
      </div>

      {status && (
        <div className={`alert alert-${status.type}`}>{status.msg}</div>
      )}

      <div className="form-group">
        <label className="form-label">Current Password</label>
        <input
          className="form-input"
          type="password"
          name="current"
          value={form.current}
          onChange={handleChange}
          placeholder="Enter current password"
          autoComplete="current-password"
        />
      </div>
      <div className="form-group">
        <label className="form-label">New Password</label>
        <input
          className="form-input"
          type="password"
          name="next"
          value={form.next}
          onChange={handleChange}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label">Confirm New Password</label>
        <input
          className="form-input"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          placeholder="Repeat new password"
          autoComplete="new-password"
        />
      </div>

      <button
        className="btn btn-solid"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Updating…' : 'Update Password'}
      </button>
    </div>
  );
}

/* ─────────────── ACCOUNT INFO CARD ─────────────── */
function AccountInfoCard({ user }) {
  return (
    <div className="card">
      <div className="card-title">
        <IconUser size={15} />
        Account Information
      </div>

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className="form-input" value={user?.name || ''} disabled readOnly />
      </div>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className="form-input" value={user?.email || ''} disabled readOnly />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Role</label>
        <input
          className="form-input"
          value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
          disabled
          readOnly
        />
      </div>
    </div>
  );
}

/* ─────────────── DANGER ZONE CARD ─────────────── */
function DangerZoneCard({ authFetch, logout }) {
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleDelete = async () => {
    if (confirm.trim().toLowerCase() !== 'delete my account') {
      return setError('Please type the confirmation phrase exactly.');
    }
    setLoading(true);
    setError('');
    try {
      const res  = await authFetch('/api/user/delete', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account.');
      logout();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card" style={{ border: '0.5px solid rgba(185,28,28,0.2)' }}>
        <div className="card-title" style={{ color: '#b91c1c' }}>
          <IconShield size={15} style={{ color: '#b91c1c' }} />
          <span style={{ color: '#b91c1c' }}>Danger Zone</span>
        </div>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.55, marginBottom: '1.1rem' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => { setShowModal(true); setConfirm(''); setError(''); }}
        >
          <IconTrash size={13} />
          Delete Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <div className="modal-title">Delete Account</div>
            <p className="modal-desc">
              This will permanently delete your account, items, and claims.
              Type <strong>delete my account</strong> below to confirm.
            </p>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <input
                className="form-input"
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="delete my account"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{
                  background: '#b91c1c', color: '#fff',
                  opacity: confirm.trim().toLowerCase() !== 'delete my account' ? 0.4 : 1,
                }}
                onClick={handleDelete}
                disabled={loading || confirm.trim().toLowerCase() !== 'delete my account'}
              >
                {loading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function ProfilePage() {
  const { user, authFetch, logout } = useAuth();

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />

      <div className="db-page">
        <div className="db-inner">

          {/* Header */}
          <div className="page-header">
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                color: '#aaa', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Account
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 700,
                letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15,
              }}>
                My Profile
              </h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
                Manage your account settings and security
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="profile-grid">

            {/* Left — sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ProfileSidebar user={user} />
            </div>

            {/* Right — cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AccountInfoCard user={user} />
              <ChangePasswordCard authFetch={authFetch} />
              <DangerZoneCard authFetch={authFetch} logout={logout} />
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}