'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/AdminNavbar';

const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ─── Status Badge ─────────────────────────────────────────────────────────────
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
  };
  const s = map[status] || { bg: '#f5f3ef', color: '#aaa' };
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em',
      padding: '3px 10px', borderRadius: '20px',
      background: s.bg, color: s.color,
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {status?.replace('_', ' ') || '—'}
    </span>
  );
}

// ─── Shared: Item Info Form ───────────────────────────────────────────────────
function ItemInfoForm({ form, setForm }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div style={twoCol}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Item Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Black Wallet" style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
            <option value="">Select category</option>
            {['Electronics', 'Clothing', 'Accessories', 'Documents', 'Keys', 'Bag', 'Wallet', 'Phone', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={twoCol}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Location Found *</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Building A, Floor 2" style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Date Found</label>
          <input type="date" value={form.date_occurred} onChange={e => set('date_occurred', e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Color, brand, condition, any details..." rows={3} style={{ ...inputStyle, resize: 'vertical', borderRadius: '14px' }} />
      </div>
    </>
  );
}

// ─── Have It — Create New Item ────────────────────────────────────────────────
function CreatePostedForm({ userId, userName, authFetch, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', category: '', location: '', date_occurred: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.category || !form.location) return setError('Name, category and location are required.');
    setSaving(true);
    const res  = await authFetch('/api/admin/management/resolve', {
      method: 'POST',
      body: JSON.stringify({ action: 'checkin_new', user_id: userId, ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || 'Failed to save.');
    onSuccess(`Item saved and checked in to office for ${userName}.`);
  };

  return (
    <div style={subCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#1a1a18', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>New Found Item for {userName}</h3>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
      </div>
      {error && <div style={errorBox}>{error}</div>}
      <ItemInfoForm form={form} setForm={setForm} />
      <button onClick={handleSubmit} style={btnPrimary} disabled={saving}>
        {saving ? 'Saving...' : 'Save & Check In to Office'}
      </button>
    </div>
  );
}

// ─── Found Item Card ──────────────────────────────────────────────────────────
function FoundItemCard({ item, selected, onSelect, onCheckin }) {
  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: '14px', padding: '1rem', cursor: 'pointer',
        border: selected ? '1px solid #4a8050' : '1px solid #ede9e2',
        background: selected ? '#eef5ee' : '#fff',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#1a1a18', fontWeight: 500, fontSize: '0.92rem', margin: 0 }}>{item.name}</p>
          <p style={{ color: '#aaa', fontSize: '0.76rem', margin: '0.25rem 0' }}>
            {item.category} · {item.location} · {fmt(item.date_occurred)}
          </p>
          {item.description && (
            <p style={{ color: '#bbb', fontSize: '0.76rem', margin: '0.2rem 0 0' }}>
              {item.description.slice(0, 120)}{item.description.length > 120 ? '…' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
          <StatusBadge status={item.status} />
          {selected && item.status !== 'at_office' && item.status !== 'resolved' && (
            <button onClick={e => { e.stopPropagation(); onCheckin(item); }} style={btnPrimary}>
              Check In to Office
            </button>
          )}
          {selected && item.status === 'at_office' && (
            <span style={{ color: '#4a7a90', fontSize: '0.75rem' }}>Already at office</span>
          )}
          {selected && item.status === 'resolved' && (
            <span style={{ color: '#6060a0', fontSize: '0.75rem' }}>Already resolved</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── We Have It Flow (user has account) ──────────────────────────────────────
function HaveItFlow({ authFetch, onDone }) {
  const [searchQuery, setSearchQuery]   = useState('');
  const [results, setResults]           = useState([]);
  const [searching, setSearching]       = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreate, setShowCreate]     = useState(false);
  const [error, setError]               = useState('');
  const debounceRef = useRef(null);

  const search = async (val) => {
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    const res  = await authFetch(`/api/admin/management/search-user?q=${encodeURIComponent(val)}`);
    const data = await res.json();
    setResults(data.users || []);
    setSearching(false);
  };

  const handleInput = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleCheckin = async (item) => {
    setError('');
    const res  = await authFetch('/api/admin/management/resolve', {
      method: 'POST',
      body: JSON.stringify({ action: 'checkin_existing', item_id: item.id }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Failed.');
    onDone(`"${item.name}" has been checked in to the office registry.`);
  };

  if (showCreate && selectedUser) {
    return (
      <CreatePostedForm
        userId={selectedUser.id}
        userName={selectedUser.name}
        authFetch={authFetch}
        onSuccess={onDone}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div>
      {/* Step 1 */}
      <p style={stepLabel}>Step 1 — Find the user</p>
      <div style={fieldWrap}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            value={searchQuery}
            onChange={e => handleInput(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...inputStyle, paddingLeft: '2.4rem' }}
          />
          {searching && (
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: '0.75rem' }}>
              searching…
            </span>
          )}
        </div>
      </div>

      {/* User results */}
      {!selectedUser && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
          {results.map(u => (
            <div
              key={u.id}
              onClick={() => { setSelectedUser(u); setResults([]); setSearchQuery(u.name); }}
              style={userPickRow}
            >
              <div style={avatarSmStyle}>{u.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#1a1a18', fontWeight: 500, fontSize: '0.88rem', margin: 0 }}>{u.name}</p>
                <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0 }}>{u.email}</p>
              </div>
              <span style={{ color: '#bbb', fontSize: '0.75rem' }}>{u.found_items?.length || 0} found item(s)</span>
            </div>
          ))}
        </div>
      )}

      {/* Step 2 */}
      {selectedUser && (
        <>
          {/* Selected user chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f9f7f4', border: '1px solid #ede9e2', borderRadius: '14px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <div style={avatarSmStyle}>{selectedUser.name?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#1a1a18', fontWeight: 500, margin: 0, fontSize: '0.9rem' }}>{selectedUser.name}</p>
              <p style={{ color: '#aaa', fontSize: '0.76rem', margin: 0 }}>{selectedUser.email}</p>
            </div>
            <button onClick={() => { setSelectedUser(null); setSelectedItem(null); setSearchQuery(''); }} style={btnSecondary}>
              Change
            </button>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <p style={stepLabel}>Step 2 — Select the item being handed in</p>

          {selectedUser.found_items?.length === 0 ? (
            <div style={emptyBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '0.6rem' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p style={{ color: '#bbb', margin: 0, fontSize: '0.85rem' }}>This user has no found items posted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {selectedUser.found_items.map(item => (
                <FoundItemCard
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(item)}
                  onCheckin={handleCheckin}
                />
              ))}
            </div>
          )}

          {/* Not posted option */}
          <div style={{ padding: '1rem', background: '#faf9f6', border: '1px dashed #ddd8d0', borderRadius: '14px' }}>
            <p style={{ color: '#aaa', fontSize: '0.82rem', margin: '0 0 0.6rem' }}>
              The item isn't listed above? Create a new found item record for this user.
            </p>
            <button onClick={() => setShowCreate(true)} style={btnWarning}>
              Item Not Posted Yet — Create Record
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── No Account Flow ──────────────────────────────────────────────────────────
function NoAccountFlow({ authFetch, onDone }) {
  const [finder, setFinder] = useState({ name: '', email: '', phone: '' });
  const [form, setForm]     = useState({ name: '', category: '', location: '', date_occurred: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const setF = (k, v) => setFinder(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!finder.name) return setError('Finder name is required.');
    if (!form.name || !form.category || !form.location) return setError('Item name, category and location are required.');
    setSaving(true);
    const res  = await authFetch('/api/admin/management/resolve', {
      method: 'POST',
      body: JSON.stringify({ action: 'walkin_no_account', finder_name: finder.name, finder_email: finder.email, finder_phone: finder.phone, ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || 'Failed to save.');
    onDone(`Item "${form.name}" saved to registry from walk-in by ${finder.name}.`);
  };

  return (
    <div>
      <p style={stepLabel}>Step 1 — Finder's Information</p>
      <div style={{ ...subCard, marginBottom: '1.25rem' }}>
        <div style={twoCol}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Full Name *</label>
            <input value={finder.name} onChange={e => setF('name', e.target.value)} placeholder="Finder's full name" style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Email</label>
            <input value={finder.email} onChange={e => setF('email', e.target.value)} placeholder="finder@email.com" style={inputStyle} />
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Phone Number</label>
          <input value={finder.phone} onChange={e => setF('phone', e.target.value)} placeholder="e.g. 0812345678" style={inputStyle} />
        </div>
      </div>

      <p style={stepLabel}>Step 2 — Item Information</p>
      <div style={subCard}>
        {error && <div style={errorBox}>{error}</div>}
        <ItemInfoForm form={form} setForm={setForm} />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button onClick={handleSubmit} style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : 'Save to Item Registry'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function ManagementPage() {
  const { authFetch }               = useAuth();
  const [mode, setMode]             = useState(null); // 'have' | 'noaccount'
  const [successMsg, setSuccessMsg] = useState('');

  const handleDone = (msg) => { setSuccessMsg(msg); setMode(null); };

  if (successMsg) return (
    <div style={pageStyle}>
      <div style={successCard}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#eef5ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a8050" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <h2 style={{ color: '#1a1a18', textAlign: 'center', margin: '0 0 0.75rem', fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>Saved to Registry</h2>
        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.88rem', lineHeight: 1.6 }}>{successMsg}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setSuccessMsg('')} style={btnPrimary}>Handle Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={h1Style}>Walk-In Management</h1>
        <p style={{ color: '#bbb', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 300 }}>
          Someone found an item and brought it to the admin office
        </p>
      </div>

      {/* Mode selector */}
      {!mode && (
        <div style={modeGrid}>
          <button onClick={() => setMode('have')} style={modeCardStyle}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eef5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a8050" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: '0 0 0.5rem', fontFamily: "'Playfair Display', serif" }}>
              Has an Account
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
              The finder is a registered user. Search their account, select the found item they reported, and check it in to the office. If not posted yet, create it now.
            </p>
          </button>

          <button onClick={() => setMode('noaccount')} style={modeCardStyle}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#faf3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a07820" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: '0 0 0.5rem', fontFamily: "'Playfair Display', serif" }}>
              No Account
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
              The finder is not registered. Fill in their personal information and the item details manually. Item will be saved directly to the registry.
            </p>
          </button>
        </div>
      )}

      {/* Active flow */}
      {mode && (
        <div style={flowCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: 0, fontFamily: "'Playfair Display', serif" }}>
              {mode === 'have' ? 'Finder Has an Account' : 'Finder Has No Account'}
            </h2>
            <button onClick={() => setMode(null)} style={btnSecondary}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.3rem' }}><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
          </div>
          {mode === 'have'
            ? <HaveItFlow authFetch={authFetch} onDone={handleDone} />
            : <NoAccountFlow authFetch={authFetch} onDone={handleDone} />
          }
        </div>
      )}
    </div>
  );
}

export default function AdminManagementPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <ManagementPage />
    </ProtectedRoute>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pageStyle    = { maxWidth: '860px', margin: '0 auto', padding: '2.2rem 2.5rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f5f3ef' };
const h1Style      = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 400, color: '#1a1a18', letterSpacing: '-0.01em', margin: 0 };
const inputStyle   = { background: '#fff', border: '1px solid #e8e4de', color: '#1a1a18', padding: '0.6rem 1rem', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };
const fieldWrap    = { display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.9rem' };
const labelStyle   = { color: '#aaa', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' };
const twoCol       = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
const errorBox     = { background: '#fdf0ef', border: '1px solid #f0c8c8', color: '#a04040', padding: '0.65rem 0.9rem', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '1rem' };
const emptyBox     = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '14px', padding: '1.5rem', textAlign: 'center', marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const subCard      = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '16px', padding: '1.25rem' };
const flowCard     = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '20px', padding: '1.75rem' };
const successCard  = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', margin: '4rem auto' };
const userPickRow  = { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', border: '1px solid #ede9e2', borderRadius: '14px', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'border-color 0.15s' };
const avatarSmStyle = { width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5f3ef', fontWeight: 500, fontSize: '0.85rem', flexShrink: 0 };
const stepLabel    = { color: '#888', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: '0.25rem' };
const modeGrid     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' };
const modeCardStyle = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '20px', padding: '2rem 1.5rem', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'border-color 0.2s', fontFamily: "'DM Sans', sans-serif" };
const btnPrimary   = { background: '#1a1a18', color: '#f5f3ef', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" };
const btnSecondary = { background: 'transparent', color: '#888', border: '1px solid #ddd8d0', padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center' };
const btnWarning   = { background: 'transparent', color: '#a07820', border: '1px solid #e8d9a0', padding: '0.55rem 1.2rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };