'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/AdminNavbar';

const fmt     = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:       { bg: '#eef5ee', color: '#4a8050' },
    resolved:     { bg: '#f0eef8', color: '#6060a0' },
    pending:      { bg: '#faf3e0', color: '#a07820' },
    at_office:    { bg: '#eaf1f5', color: '#4a7a90' },
    under_review: { bg: '#eaf1f5', color: '#4a7a90' },
    rejected:     { bg: '#fdf0ef', color: '#a04040' },
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

// ─── Delivery Modal ───────────────────────────────────────────────────────────
function DeliveryModal({ item, authFetch, onClose, onDelivered }) {
  const [email, setEmail]               = useState('');
  const [looking, setLooking]           = useState(false);
  const [userFound, setUserFound]       = useState(null);
  const [claimId, setClaimId]           = useState(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [form, setForm]                 = useState({ full_name: '', id_number: '', phone: '', notes: '' });
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const debounceRef                     = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEmailChange = (val) => {
    setEmail(val);
    setUserFound(null);
    setClaimId(null);
    setEmailChecked(false);
    setForm(f => ({ ...f, full_name: '' }));
    clearTimeout(debounceRef.current);
    if (!val.trim()) return;
    debounceRef.current = setTimeout(() => lookupEmail(val.trim()), 500);
  };

  const lookupEmail = async (val) => {
    setLooking(true);
    try {
      const res  = await authFetch(`/api/admin/registry/${item.id}/deliver?email=${encodeURIComponent(val)}`);
      const data = await res.json();
      setUserFound(data.user || null);
      setClaimId(data.claim_id || null);
      if (data.user) setForm(f => ({ ...f, full_name: data.user.name }));
    } catch (e) {
      console.error(e);
    } finally {
      setLooking(false);
      setEmailChecked(true);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim())   return setError('Email is required.');
    if (!form.full_name) return setError('Full name is required.');
    if (!form.id_number) return setError('ID / Student number is required.');
    if (!form.phone)     return setError('Phone number is required.');
    setSaving(true);
    const res  = await authFetch(`/api/admin/registry/${item.id}/deliver`, {
      method: 'POST',
      body: JSON.stringify({
        full_name: form.full_name,
        id_number: form.id_number,
        phone:     form.phone,
        email,
        notes:     form.notes,
        claim_id:  claimId || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || 'Failed to save delivery.');
    onDelivered(item.name);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#1a1a18', fontSize: '1rem', fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Deliver Item</h2>
            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0.3rem 0 0' }}>
              Delivering: <span style={{ color: '#1a1a18', fontWeight: 500 }}>{item.name}</span>
            </p>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Item summary */}
        <div style={{ background: '#f9f7f4', border: '1px solid #ede9e2', borderRadius: '14px', padding: '0.9rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
            {item.category} · {item.location}
            {item.submitted_by && <> · Submitted by <span style={{ color: '#1a1a18', fontWeight: 500 }}>{item.submitted_by.name}</span></>}
          </p>
          {item.description && (
            <p style={{ color: '#bbb', fontSize: '0.76rem', margin: '0.3rem 0 0' }}>
              {item.description.slice(0, 120)}{item.description.length > 120 ? '…' : ''}
            </p>
          )}
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {/* Step 1 */}
        <p style={stepLabel}>Step 1 — Enter Recipient's Email</p>
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <input
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            placeholder="recipient@email.com"
            type="email"
            style={inputStyle}
          />
          {looking && (
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: '0.73rem' }}>
              checking…
            </span>
          )}
        </div>

        {/* Email result feedback */}
        {emailChecked && email && !looking && (
          userFound ? (
            <div style={{ background: '#eef5ee', border: '1px solid #c8dfc8', borderRadius: '12px', padding: '0.65rem 0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: '1px solid #c8dfc8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a8050" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p style={{ color: '#4a8050', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>User found: {userFound.name}</p>
                <p style={{ color: '#888', fontSize: '0.73rem', margin: '0.15rem 0 0' }}>
                  {claimId ? 'Linked to an existing claim for this item.' : 'No claim found — delivery will be logged without claim link.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ background: '#faf3e0', border: '1px solid #e8d9a0', borderRadius: '12px', padding: '0.65rem 0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: '1px solid #e8d9a0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a07820" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p style={{ color: '#a07820', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>No account found with this email</p>
                <p style={{ color: '#888', fontSize: '0.73rem', margin: '0.15rem 0 0' }}>Fill in the details manually below. claim_id will be null.</p>
              </div>
            </div>
          )
        )}

        {/* Step 2 */}
        <p style={stepLabel}>Step 2 — Personal Information</p>
        <div style={twoCol}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Full Name *</label>
            <input
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Recipient's full name"
              style={{ ...inputStyle, background: userFound ? '#eef5ee' : '#fff' }}
            />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>ID / Student Number *</label>
            <input value={form.id_number} onChange={e => set('id_number', e.target.value)} placeholder="e.g. 6512345678" style={inputStyle} />
          </div>
        </div>
        <div style={twoCol}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Phone Number *</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 0812345678" style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Claim ID</label>
            <input
              value={claimId || ''}
              readOnly
              placeholder="Auto-linked if found"
              style={{ ...inputStyle, color: claimId ? '#4a8050' : '#ccc', cursor: 'default', background: '#f9f7f4' }}
            />
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." rows={2} style={{ ...inputStyle, resize: 'vertical', borderRadius: '14px' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={handleSubmit} style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm Delivery & Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Item Card ────────────────────────────────────────────────────────
function PendingCard({ item, onDeliver }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={itemCard}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={imgBox}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
            : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            )
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div>
              <p style={{ color: '#1a1a18', fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>{item.name}</p>
              <p style={{ color: '#aaa', fontSize: '0.76rem', margin: '0.2rem 0' }}>
                {item.category} · {item.location} · Found {fmt(item.date_occurred)}
              </p>
              {item.submitted_by
                ? <p style={{ color: '#bbb', fontSize: '0.73rem', margin: 0 }}>
                    Submitted by <span style={{ color: '#888' }}>{item.submitted_by.name}</span> ({item.submitted_by.email})
                  </p>
                : <p style={{ color: '#bbb', fontSize: '0.73rem', margin: 0 }}>Walk-in submission</p>
              }
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
              <StatusBadge status={item.status} />
              <span style={{ color: '#ccc', fontSize: '0.7rem' }}>Checked in {fmt(item.created_at)}</span>
            </div>
          </div>
          {item.description && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#bbb', fontSize: '0.76rem', margin: 0 }}>
                {expanded ? item.description : `${item.description.slice(0, 100)}${item.description.length > 100 ? '…' : ''}`}
                {item.description.length > 100 && (
                  <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.73rem', cursor: 'pointer', marginLeft: '0.3rem', textDecoration: 'underline' }}>
                    {expanded ? 'less' : 'more'}
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid #f0ece6', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => onDeliver(item)} style={btnPrimary}>
          Give to Owner
        </button>
      </div>
    </div>
  );
}

// ─── History Record Card ──────────────────────────────────────────────────────
function HistoryCard({ record }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ ...itemCard, borderColor: '#d8edd8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <p style={{ color: '#1a1a18', fontWeight: 500, fontSize: '0.92rem', margin: 0 }}>{record.item.name}</p>
            <StatusBadge status={record.item.status} />
          </div>
          <p style={{ color: '#aaa', fontSize: '0.76rem', margin: '0 0 0.4rem' }}>
            {record.item.category} · {record.item.location}
          </p>
          <p style={{ color: '#4a8050', fontSize: '0.76rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Delivered {fmtTime(record.delivered_at)}
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={expanded ? { ...iconBtnView, background: '#1a1a18', color: '#f5f3ef' } : iconBtnView}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0ece6' }}>
          <p style={detailSectionLabel}>Recipient</p>
          <div style={detailGrid}>
            <DetailRow label="Name"  value={record.recipient.full_name} />
            <DetailRow label="ID"    value={record.recipient.id_number} />
            <DetailRow label="Phone" value={record.recipient.phone} />
            <DetailRow label="Email" value={record.recipient.email || '—'} />
          </div>
          {record.recipient.notes && (
            <p style={{ color: '#aaa', fontSize: '0.78rem', marginTop: '0.5rem' }}>Note: {record.recipient.notes}</p>
          )}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: '#bbb', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Claim ID:</span>
            <span style={{ color: record.recipient.claim_id ? '#4a8050' : '#ccc', fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {record.recipient.claim_id || 'None (walk-in)'}
            </span>
          </div>
          {record.submitted_by && (
            <>
              <p style={{ ...detailSectionLabel, marginTop: '0.75rem' }}>Originally Submitted By</p>
              <p style={{ color: '#888', fontSize: '0.78rem', margin: 0 }}>
                {record.submitted_by.name} · {record.submitted_by.email}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p style={{ color: '#bbb', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.15rem' }}>{label}</p>
      <p style={{ color: '#1a1a18', fontSize: '0.82rem', margin: 0 }}>{value}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function RegistryPage() {
  const { authFetch }                 = useAuth();
  const [tab, setTab]                 = useState('pending');
  const [items, setItems]             = useState([]);
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deliverItem, setDeliverItem] = useState(null);
  const [successMsg, setSuccessMsg]   = useState('');

  const load = useCallback(async (t) => {
    setLoading(true);
    const res  = await authFetch(`/api/admin/registry?tab=${t}`);
    const data = await res.json();
    if (t === 'pending') setItems(data.items || []);
    else setRecords(data.records || []);
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleDelivered = (itemName) => {
    setDeliverItem(null);
    setSuccessMsg(`"${itemName}" has been delivered and marked as resolved.`);
    load('pending');
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={h1Style}>Item Registry</h1>
          <p style={{ color: '#bbb', fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 300 }}>
            Items currently held at the admin office
          </p>
        </div>

        {/* Tab switcher — pill style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#edeae4', borderRadius: '30px', padding: '0.25rem' }}>
          {[
            {
              key: 'pending',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
              label: 'At Office',
            },
            {
              key: 'history',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
              label: 'History',
            },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '30px', border: 'none',
                fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
                background: tab === t.key ? '#1a1a18' : 'transparent',
                color: tab === t.key ? '#f5f3ef' : '#888',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{ background: '#eef5ee', border: '1px solid #c8dfc8', color: '#4a8050', padding: '0.85rem 1.1rem', borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#4a8050', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={spinnerStyle} />
        </div>
      ) : tab === 'pending' ? (
        items.length === 0 ? (
          <div style={emptyBox}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <p style={{ color: '#bbb', margin: 0, fontSize: '0.85rem' }}>No items at the office right now.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#bbb', fontSize: '0.78rem', marginBottom: '1rem', fontWeight: 300 }}>
              {items.length} item{items.length !== 1 ? 's' : ''} waiting to be claimed
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map(item => <PendingCard key={item.id} item={item} onDeliver={setDeliverItem} />)}
            </div>
          </>
        )
      ) : (
        records.length === 0 ? (
          <div style={emptyBox}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ color: '#bbb', margin: 0, fontSize: '0.85rem' }}>No delivery history yet.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#bbb', fontSize: '0.78rem', marginBottom: '1rem', fontWeight: 300 }}>
              {records.length} item{records.length !== 1 ? 's' : ''} delivered total
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {records.map(r => <HistoryCard key={r.delivery_id} record={r} />)}
            </div>
          </>
        )
      )}

      {deliverItem && (
        <DeliveryModal
          item={deliverItem}
          authFetch={authFetch}
          onClose={() => setDeliverItem(null)}
          onDelivered={handleDelivered}
        />
      )}
    </div>
  );
}

export default function AdminRegistryPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <RegistryPage />
    </ProtectedRoute>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pageStyle          = { maxWidth: '900px', margin: '0 auto', padding: '2.2rem 2.5rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f5f3ef' };
const h1Style            = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 400, color: '#1a1a18', letterSpacing: '-0.01em', margin: 0 };
const inputStyle         = { background: '#fff', border: '1px solid #e8e4de', color: '#1a1a18', padding: '0.6rem 1rem', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };
const fieldWrap          = { display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.9rem' };
const labelStyle         = { color: '#aaa', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' };
const twoCol             = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
const errorBox           = { background: '#fdf0ef', border: '1px solid #f0c8c8', color: '#a04040', padding: '0.65rem 0.9rem', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '1rem' };
const emptyBox           = { textAlign: 'center', padding: '4rem', color: '#bbb', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const itemCard           = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '16px', padding: '1.2rem' };
const imgBox             = { width: '72px', height: '72px', borderRadius: '12px', background: '#f9f7f4', border: '1px solid #ede9e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' };
const overlayStyle       = { position: 'fixed', inset: 0, background: 'rgba(26,26,24,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' };
const modalStyle         = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '20px', padding: '1.75rem', width: '540px', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" };
const closeBtnStyle      = { background: '#f5f3ef', border: 'none', color: '#888', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const stepLabel          = { color: '#888', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' };
const detailSectionLabel = { color: '#bbb', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem' };
const detailGrid         = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
const spinnerStyle       = { width: '28px', height: '28px', border: '2px solid #e8e4de', borderTop: '2px solid #1a1a18', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };
const btnPrimary         = { background: '#1a1a18', color: '#f5f3ef', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" };
const btnSecondary       = { background: 'transparent', color: '#888', border: '1px solid #ddd8d0', padding: '0.6rem 1.2rem', borderRadius: '30px', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" };
const iconBtnView        = { background: '#eaf1f5', color: '#4a7a90', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" };