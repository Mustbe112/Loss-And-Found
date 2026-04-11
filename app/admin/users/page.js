'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/AdminNavbar';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function StatusBadge({ status }) {
  const map = {
    active:       { bg: '#eef5ee', color: '#4a8050' },
    resolved:     { bg: '#f0eef8', color: '#6060a0' },
    pending:      { bg: '#faf3e0', color: '#a07820' },
    approved:     { bg: '#eef5ee', color: '#4a8050' },
    rejected:     { bg: '#fdf0ef', color: '#a04040' },
    open:         { bg: '#faf3e0', color: '#a07820' },
    under_review: { bg: '#eaf1f5', color: '#4a7a90' },
    at_office:    { bg: '#eaf1f5', color: '#4a7a90' },
    user:         { bg: '#f5f3ef', color: '#888' },
    admin:        { bg: '#1a1a18', color: '#f5f3ef' },
  };
  const s = map[status] || { bg: '#f5f3ef', color: '#aaa' };
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em',
      padding: '3px 10px', borderRadius: '20px',
      background: s.bg, color: s.color,
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{status?.replace('_', ' ') || '—'}</span>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSave }) {
  const [name, setName]         = useState(user.name);
  const [email, setEmail]       = useState(user.email);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) return setError('Name is required.');
    if (!email.trim()) return setError('Email is required.');
    setSaving(true);
    const payload = { name: name.trim(), email: email.trim() };
    if (password) payload.password = password;
    const err = await onSave(user.id, payload);
    setSaving(false);
    if (err) return setError(err);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Edit User</h2>
          <button onClick={onClose} style={closeBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ background: '#fdf0ef', border: '1px solid #f0c8c8', color: '#a04040', padding: '0.6rem 0.9rem', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={fieldWrap}>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Full name" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="email@example.com" type="email" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>New Password <span style={{ color: '#ccc', fontWeight: 300 }}>(leave blank to keep current)</span></label>
          <div style={{ position: 'relative' }}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
              placeholder="Enter new password..."
              type={showPw ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
            >
              {showPw
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSave} style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────
function UserDetail({ userId, authFetch, onClose }) {
  const [data, setData]       = useState(null);
  const [tab, setTab]         = useState('items');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, width: '520px', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div style={spinnerStyle} />
      </div>
    </div>
  );

  const { user, items = [], claimsAsClaimant = [], claimsAsRespondent = [], reports = [] } = data || {};

  const tabs = [
    { key: 'items',      label: `Items (${items.length})` },
    { key: 'claimant',   label: `Claims Made (${claimsAsClaimant.length})` },
    { key: 'respondent', label: `Claims Received (${claimsAsRespondent.length})` },
    { key: 'reports',    label: `Reports (${reports.length})` },
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, width: '620px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={avatarStyle}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: 0 }}>{user?.name}</h2>
              <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{user?.email}</p>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={user?.role} />
                <span style={{ color: '#bbb', fontSize: '0.72rem' }}>Joined {fmt(user?.created_at)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #f0ece6', marginBottom: '1rem' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              ...tabBtnStyle,
              ...(tab === t.key ? tabBtnActive : {}),
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {tab === 'items' && (
            items.length === 0 ? <Empty text="No items posted." /> :
            items.map(item => (
              <div key={item.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <p style={rowTitle}>{item.name}</p>
                  <p style={rowSub}>{item.type?.toUpperCase()} · {item.category} · {item.location}</p>
                  <p style={rowSub}>{fmt(item.created_at)}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))
          )}
          {tab === 'claimant' && (
            claimsAsClaimant.length === 0 ? <Empty text="No claims made." /> :
            claimsAsClaimant.map(c => (
              <div key={c.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <p style={rowTitle}>Claimed: {c.found_item_name}</p>
                  <p style={rowSub}>Lost item: {c.lost_item_name}</p>
                  <p style={rowSub}>{fmt(c.created_at)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))
          )}
          {tab === 'respondent' && (
            claimsAsRespondent.length === 0 ? <Empty text="No claims received." /> :
            claimsAsRespondent.map(c => (
              <div key={c.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <p style={rowTitle}>Found: {c.found_item_name}</p>
                  <p style={rowSub}>Claimed by someone for: {c.lost_item_name}</p>
                  <p style={rowSub}>{fmt(c.created_at)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))
          )}
          {tab === 'reports' && (
            reports.length === 0 ? <Empty text="No reports filed." /> :
            reports.map(r => (
              <div key={r.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <p style={rowTitle}>{r.reason?.slice(0, 80)}{r.reason?.length > 80 ? '...' : ''}</p>
                  {r.admin_notes && <p style={{ ...rowSub, color: '#6b8fa0' }}>Admin note: {r.admin_notes}</p>}
                  <p style={rowSub}>{fmt(r.created_at)}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <p style={{ color: '#bbb', fontSize: '0.85rem', padding: '1rem 0' }}>{text}</p>;
}

// ─── User Row ─────────────────────────────────────────────────────────────────
function UserRow({ user, onView, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={userRowStyle}>
      <div style={avatarSmStyle}>{user.name?.[0]?.toUpperCase() || '?'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#1a1a18', fontWeight: 500, fontSize: '0.88rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
        <p style={{ color: '#aaa', fontSize: '0.76rem', margin: '0.15rem 0 0' }}>{user.email}</p>
      </div>
      <StatusBadge status={user.role} />
      <span style={{ color: '#bbb', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{fmt(user.created_at)}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onView(user.id)} style={iconBtnView}>View</button>
        <button onClick={() => onEdit(user)} style={iconBtnEdit}>Edit</button>
        {confirmDelete
          ? <>
              <button onClick={() => onDelete(user.id)} style={iconBtnDanger}>Sure?</button>
              <button onClick={() => setConfirmDelete(false)} style={iconBtnNeutral}>No</button>
            </>
          : <button onClick={() => setConfirmDelete(true)} style={iconBtnDanger}>Delete</button>
        }
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function UsersPage() {
  const { authFetch } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [viewId, setViewId]     = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [error, setError]       = useState('');

  const fetchUsers = useCallback(async (email = '') => {
    setLoading(true);
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await authFetch(`/api/admin/users${qs}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = e => { e.preventDefault(); fetchUsers(search); };

  const handleEdit = async (id, updates) => {
    const res = await authFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    if (res.ok) { fetchUsers(search); return null; }
    const d = await res.json();
    return d.error || 'Update failed';
  };

  const handleDelete = async (id) => {
    const res = await authFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) { setUsers(u => u.filter(x => x.id !== id)); }
    else { const d = await res.json(); setError(d.error || 'Delete failed'); }
  };

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={h1Style}>Users</h1>
            <p style={{ color: '#bbb', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 300 }}>
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              style={{ ...inputStyle, paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>
          <button type="submit" style={btnPrimary}>Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); fetchUsers(); }} style={btnSecondary}>Clear</button>
          )}
        </form>

        {error && (
          <div style={{ background: '#fdf0ef', border: '1px solid #f0c8c8', color: '#a04040', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {/* Table header */}
        <div style={tableHeader}>
          <span style={{ width: '40px' }} />
          <span style={{ flex: 1, color: '#bbb', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name / Email</span>
          <span style={{ color: '#bbb', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Role</span>
          <span style={{ color: '#bbb', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Joined</span>
          <span style={{ color: '#bbb', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actions</span>
        </div>

        {/* Users list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={spinnerStyle} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#bbb' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <p style={{ fontSize: '0.85rem' }}>No users found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map(u => (
              <UserRow key={u.id} user={u} onView={setViewId} onEdit={setEditUser} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Modals */}
        {viewId && <UserDetail userId={viewId} authFetch={authFetch} onClose={() => setViewId(null)} />}
        {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleEdit} />}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <UsersPage />
    </ProtectedRoute>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pageStyle    = { width: '100%', minHeight: '100vh', background: '#f5f3ef', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };
const innerStyle   = { maxWidth: '1400px', margin: '0 auto', padding: '2.2rem 2.5rem' };
const h1Style      = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 400, color: '#1a1a18', letterSpacing: '-0.01em', margin: 0 };
const inputStyle   = { background: '#fff', border: '1px solid #e8e4de', color: '#1a1a18', padding: '0.6rem 1rem', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', fontFamily: "'DM Sans', sans-serif", width: '100%', boxSizing: 'border-box' };
const btnPrimary   = { background: '#1a1a18', color: '#f5f3ef', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" };
const btnSecondary = { background: 'transparent', color: '#888', border: '1px solid #ddd8d0', padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" };
const tableHeader  = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.2rem', marginBottom: '0.4rem' };
const userRowStyle = { display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', border: '1px solid #ede9e2', borderRadius: '16px', padding: '0.9rem 1.2rem', transition: 'border-color 0.15s' };
const avatarStyle  = { width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f3ef', fontWeight: 500, fontSize: '1.1rem', flexShrink: 0 };
const avatarSmStyle = { width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f3ef', fontWeight: 500, fontSize: '0.85rem', flexShrink: 0 };
const iconBtnView    = { background: '#eaf1f5', color: '#4a7a90', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };
const iconBtnEdit    = { background: '#faf3e0', color: '#a07820', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };
const iconBtnDanger  = { background: '#fdf0ef', color: '#a04040', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };
const iconBtnNeutral = { background: '#f5f3ef', color: '#888',    border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(26,26,24,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' };
const modalStyle   = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '20px', padding: '1.75rem', width: '480px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" };
const closeBtnStyle = { background: '#f5f3ef', border: 'none', color: '#888', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const fieldWrap    = { display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' };
const labelStyle   = { color: '#aaa', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' };
const tabBtnStyle  = { background: 'transparent', border: 'none', color: '#bbb', fontSize: '0.76rem', padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '2px solid transparent', fontWeight: 400, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s' };
const tabBtnActive = { color: '#1a1a18', borderBottom: '2px solid #1a1a18', fontWeight: 500 };
const rowStyle     = { display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f5f2ee' };
const rowTitle     = { color: '#1a1a18', fontSize: '0.85rem', margin: 0, fontWeight: 500 };
const rowSub       = { color: '#bbb', fontSize: '0.73rem', margin: '0.2rem 0 0' };
const spinnerStyle = { width: '28px', height: '28px', border: '2px solid #e8e4de', borderTop: '2px solid #1a1a18', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };