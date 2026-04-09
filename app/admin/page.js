'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';
const categoryIcon = (c = '') =>
  ({ Phone: '📱', Wallet: '👜', Keys: '🔑', Bag: '🎒', Electronics: '💻' }[c] ?? '📦');

// ─── DeliverModal ─────────────────────────────────────────────────────────────
function DeliverModal({ item, onSuccess, onClose, authFetch }) {
  const [form, setForm] = useState({ full_name: '', id_number: '', phone: '', email: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.full_name.trim() || !form.id_number.trim() || !form.phone.trim()) {
      setError('Full name, ID number and phone are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/items/${item.found_item.id}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ claim_id: item.claim_id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delivery failed');
      setDelivered(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalBox}>
        {delivered ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 0.75rem' }}>✅</p>
            <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.4rem' }}>Successfully Delivered!</p>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>The item has been marked as delivered.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>📬 Deliver Item</h2>
                <p style={{ color: '#888', fontSize: '0.82rem', margin: 0 }}>
                  Fill in recipient info before handing over <strong style={{ color: '#fff' }}>{item.found_item.name}</strong>.
                </p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ModalField label="Full Name *"   name="full_name" placeholder="e.g. John Doe"                       value={form.full_name} onChange={handleChange} />
              <ModalField label="ID Number *"   name="id_number" placeholder="National ID / Student ID / Passport" value={form.id_number} onChange={handleChange} />
              <ModalField label="Phone *"       name="phone"     type="tel" placeholder="e.g. 0812345678"          value={form.phone}     onChange={handleChange} />
              <ModalField label="Email"         name="email"     type="email" placeholder="optional"               value={form.email}     onChange={handleChange} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={modalLabel}>Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Any additional notes…"
                  value={form.notes}
                  onChange={handleChange}
                  style={{ ...modalInput, resize: 'none' }}
                />
              </div>
            </div>

            {error && (
              <p style={{ marginTop: '0.75rem', background: '#3a1a1a', border: '1px solid #e94560', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#e94560', fontSize: '0.82rem' }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={onClose} disabled={loading} style={modalBtnCancel}>Cancel</button>
              <button onClick={handleSubmit} disabled={loading} style={modalBtnConfirm}>
                {loading ? 'Saving…' : '✅ Confirm Delivery'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ModalField({ label, name, type = 'text', placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={modalLabel}>{label}</label>
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} style={modalInput} />
    </div>
  );
}

// ─── Shared item card ────────────────────────────────────────────────────────
function ItemCard({ foundItem, lostItem, claimant, respondent, attempts, date, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={cardWrap}>
      <div style={cardRow}>
        <img
          src={foundItem.image_url || '/placeholder.png'}
          alt={foundItem.name}
          style={thumbStyle}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span>🔒</span>
            <strong style={{ color: '#fff', fontSize: '1rem' }}>{foundItem.name}</strong>
          </div>
          <div style={{ color: '#aaa', fontSize: '0.82rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>📍 Found at: {foundItem.location}</span>
            <span>{categoryIcon(foundItem.category)} {foundItem.category}</span>
            {attempts != null && <span>· Claimant failed {attempts} attempts</span>}
            {date && <span>· {fmt(date)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {children}
          <button onClick={() => setOpen(o => !o)} style={detailsBtn}>
            {open ? '▲' : '▼'} Details
          </button>
        </div>
      </div>

      {open && (
        <div style={detailsPanel}>
          <div style={detailsGrid}>
            <div>
              <p style={detailHead}>📦 Found Item</p>
              {foundItem.description && <p style={detailTxt}>{foundItem.description}</p>}
              <p style={detailTxt}>📍 {foundItem.location} · {fmt(foundItem.date)}</p>
            </div>
            {lostItem && (
              <div>
                <p style={detailHead}>🔍 Lost Item (claimant&apos;s)</p>
                <p style={detailTxt}><strong>{lostItem.name}</strong></p>
                {lostItem.description && <p style={detailTxt}>{lostItem.description}</p>}
                <p style={detailTxt}>📍 {lostItem.location} · {fmt(lostItem.date)}</p>
              </div>
            )}
            <div>
              <p style={detailHead}>👤 Claimant (lost person)</p>
              <p style={detailTxt}>{claimant?.name} · {claimant?.email}</p>
            </div>
            <div>
              <p style={detailHead}>🙋 Respondent (finder)</p>
              <p style={detailTxt}>{respondent?.name} · {respondent?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hand-In Section ─────────────────────────────────────────────────────────
function HandInSection({ items, onAction, actionLoading }) {
  return (
    <section style={sectionWrap}>
      <div style={sectionHeader}>
        <div>
          <h2 style={sectionTitle}>🤝 Hand In</h2>
          <p style={sectionSub}>
            The finder has been asked to drop these items off at the admin office.
            Confirm once they physically hand it in.
          </p>
        </div>
        {items.length > 0 && <span style={badgeBlue}>{items.length} pending</span>}
      </div>

      {items.length === 0
        ? <p style={emptyTxt}>No items awaiting hand-in.</p>
        : items.map(entry => (
          <ItemCard
            key={entry.found_item.id}
            foundItem={entry.found_item}
            lostItem={entry.lost_item}
            claimant={entry.claimant}
            respondent={entry.respondent}
            attempts={entry.attempts}
            date={entry.created_at}
          >
            <button
              style={btnConfirm}
              disabled={actionLoading === entry.found_item.id}
              onClick={() => onAction(entry.found_item.id, entry.claim_id, 'confirm')}
            >
              {actionLoading === entry.found_item.id ? '…' : '✅ Handed In'}
            </button>
            <button
              style={btnReject}
              disabled={actionLoading === entry.found_item.id}
              onClick={() => onAction(entry.found_item.id, entry.claim_id, 'reject')}
            >
              ❌ Not Yet
            </button>
          </ItemCard>
        ))
      }
    </section>
  );
}

// ─── Admin Office Section ────────────────────────────────────────────────────
function AdminOfficeSection({ items, onUndo, onDeliver, actionLoading }) {
  return (
    <section style={sectionWrap}>
      <div style={sectionHeader}>
        <div>
          <h2 style={sectionTitle}>📦 Items at Admin Office</h2>
          <p style={sectionSub}>
            Hand-in confirmed. Click Deliver when the claimant comes to pick up their item.
          </p>
        </div>
        {items.length > 0 && <span style={badgeRed}>{items.length} pending</span>}
      </div>

      {items.length === 0
        ? <p style={emptyTxt}>No items currently at the admin office.</p>
        : items.map(entry => (
          <ItemCard
            key={entry.vq_id}
            foundItem={entry.found_item}
            lostItem={entry.lost_item}
            claimant={entry.claimant}
            respondent={entry.respondent}
            attempts={entry.attempts}
            date={entry.confirmed_at}
          >
            <span style={badgeFailedInline}>Verification Failed</span>
            <button
              style={btnUndo}
              disabled={actionLoading === entry.found_item.id}
              onClick={() => onUndo(entry.found_item.id, entry.claim_id)}
            >
              ↩ Undo
            </button>
            {/* NEW: Deliver button */}
            <button
              style={btnDeliver}
              disabled={actionLoading === entry.found_item.id}
              onClick={() => onDeliver(entry)}
            >
              📬 Deliver
            </button>
          </ItemCard>
        ))
      }
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { authFetch, user } = useAuth();
  const [pendingHandover, setPendingHandover] = useState([]);
  const [lockedClaims, setLockedClaims]       = useState([]);
  const [reports, setReports]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [actionLoading, setActionLoading]     = useState(null);
  const [deliverTarget, setDeliverTarget]     = useState(null); // entry to deliver

  const fetchData = async () => {
    try {
      const [lockedRes, reportsRes] = await Promise.all([
        authFetch('/api/admin/locked-claims'),
        authFetch('/api/admin/reports'),
      ]);
      const lockedData  = await lockedRes.json();
      const reportsData = await reportsRes.json();
      setPendingHandover(lockedData.pendingHandover ?? []);
      setLockedClaims(lockedData.lockedClaims       ?? []);
      setReports(reportsData.reports                ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleHandInAction = async (itemId, claimId, action) => {
    setActionLoading(itemId);
    try {
      const res = await authFetch(`/api/admin/items/${itemId}/handin`, {
        method: 'PATCH',
        body: JSON.stringify({ action, claim_id: claimId }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error ?? 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliverySuccess = async () => {
    setDeliverTarget(null);
    await fetchData(); // refresh list — delivered item will disappear
  };

  if (loading) return (
    <ProtectedRoute adminOnly>
      <Navbar />
      <div style={pageStyle}>
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: '4rem' }}>Loading…</p>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute adminOnly>
      <Navbar />
      <div style={pageStyle}>

        {/* Stats */}
        <div style={statsRow}>
          <StatCard label="Pending Hand-In"  value={pendingHandover.length} color="#f0a500" />
          <StatCard label="At Admin Office"  value={lockedClaims.length}    color="#e94560" />
          <StatCard label="Open Reports"
            value={reports.filter(r => r.status === 'open').length}
            color="#4fc3f7"
          />
        </div>

        {/* 🤝 Hand In */}
        <HandInSection
          items={pendingHandover}
          onAction={handleHandInAction}
          actionLoading={actionLoading}
        />

        {/* 📦 Admin Office */}
        <AdminOfficeSection
          items={lockedClaims}
          onUndo={(itemId, claimId) => handleHandInAction(itemId, claimId, 'reject')}
          onDeliver={(entry) => setDeliverTarget(entry)}
          actionLoading={actionLoading}
        />

        {/* Recent Reports */}
        <section style={sectionWrap}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>🚨 Recent Reports</h2>
            <Link href="/admin/reports" style={viewAllLink}>View all →</Link>
          </div>
          {reports.length === 0
            ? <p style={emptyTxt}>No reports yet.</p>
            : reports.slice(0, 5).map(r => (
              <div key={r.id} style={reportRow}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', margin: 0 }}>{r.reason}</p>
                  <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
                    👤 {r.reporter?.name} · {r.reporter?.email} · {fmt(r.created_at)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          }
        </section>

      </div>

      {/* Deliver Modal — mounted outside sections so it overlays everything */}
      {deliverTarget && (
        <DeliverModal
          item={deliverTarget}
          authFetch={authFetch}
          onSuccess={handleDeliverySuccess}
          onClose={() => setDeliverTarget(null)}
        />
      )}

    </ProtectedRoute>
  );
}

// ─── Small components ────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...statCard, borderTop: `3px solid ${color}` }}>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
      <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open:         { bg: '#333',    color: '#fff',    label: 'open' },
    under_review: { bg: '#f0a500', color: '#000',    label: 'under review' },
    resolved:     { bg: '#1a472a', color: '#4caf50', label: 'resolved' },
  };
  const s = map[status] ?? map.open;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', border: `1px solid ${s.color}` }}>
      {s.label}
    </span>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const pageStyle     = { maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' };
const statsRow      = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' };
const statCard      = { background: '#1a1a2e', borderRadius: '10px', padding: '1.25rem 1.5rem', border: '1px solid #2a2a40' };

const sectionWrap   = { background: '#1a1a2e', borderRadius: '12px', padding: '1.75rem', border: '1px solid #2a2a40', marginBottom: '1.5rem' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' };
const sectionTitle  = { fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.25rem' };
const sectionSub    = { color: '#888', fontSize: '0.82rem', margin: 0 };
const emptyTxt      = { color: '#555', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0', margin: 0 };

const cardWrap      = { background: '#12122a', borderRadius: '10px', border: '1px solid #2e2e4a', marginBottom: '0.85rem', overflow: 'hidden' };
const cardRow       = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', flexWrap: 'wrap' };
const thumbStyle    = { width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#2a2a40' };
const detailsBtn    = { background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const detailsPanel  = { borderTop: '1px solid #2e2e4a', padding: '1rem 1.25rem', background: '#0f0f25' };
const detailsGrid   = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' };
const detailHead    = { color: '#e94560', fontSize: '0.78rem', fontWeight: 'bold', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem' };
const detailTxt     = { color: '#bbb', fontSize: '0.85rem', margin: '0 0 0.25rem' };

const badgeBlue         = { background: '#1a3a5c', color: '#4fc3f7', borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', border: '1px solid #4fc3f7', whiteSpace: 'nowrap', alignSelf: 'flex-start' };
const badgeRed          = { background: '#3a1a1a', color: '#e94560', borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', border: '1px solid #e94560', whiteSpace: 'nowrap', alignSelf: 'flex-start' };
const badgeFailedInline = { background: '#3a1a1a', color: '#e94560', borderRadius: '20px', padding: '0.25rem 0.85rem', fontSize: '0.8rem', border: '1px solid #e94560', whiteSpace: 'nowrap' };

const btnConfirm    = { background: '#1a472a', color: '#4caf50', border: '1px solid #4caf50', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' };
const btnReject     = { background: '#3a1a1a', color: '#e94560', border: '1px solid #e94560', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' };
const btnUndo       = { background: 'transparent', color: '#aaa', border: '1px solid #555', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const btnDeliver    = { background: '#1a3a2a', color: '#4fc3f7', border: '1px solid #4fc3f7', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' };

const reportRow     = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid #1e1e35' };
const viewAllLink   = { color: '#e94560', fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' };

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modalBackdrop  = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' };
const modalBox       = { background: '#1e2235', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '440px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' };
const modalLabel     = { color: '#888', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' };
const modalInput     = { background: '#141726', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' };
const modalBtnCancel  = { flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#aaa', cursor: 'pointer' };
const modalBtnConfirm = { flex: 1, background: '#e94560', border: 'none', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', cursor: 'pointer' };