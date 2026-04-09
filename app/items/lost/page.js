'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

/* ---------- GLOBAL STYLE ---------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    body { font-family: 'DM Sans', -apple-system, sans-serif; background:#f5f4f0; }
    .page { min-height: calc(100vh - 60px); }
    .inner { max-width:1160px; margin:0 auto; padding:2rem 1.5rem; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
  `}</style>
);

/* ---------- STATUS BADGE ---------- */
function Badge({ status }) {
  // ✅ FIX 1: normalize to lowercase so "Active", "ACTIVE", "active" all match
  const normalized = (status || '').toLowerCase();

  const badgeMap = {
    active:   { bg: '#e6f4ea', color: '#1a6b3c' },
    matched:  { bg: '#fef9e6', color: '#92600a' },
    claimed:  { bg: '#e8f0fe', color: '#1a47a0' },
    resolved: { bg: '#f0ebfe', color: '#5b21b6' },
    // ✅ FIX 2: closed fallback now uses a visible dark style instead of near-white
    closed:   { bg: '#e5e7eb', color: '#374151' },
  };

  // ✅ FIX 3: if status is missing/unknown, default to showing "active" styling
  const s = badgeMap[normalized] || badgeMap['active'];
  const label = normalized || 'active';

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 10,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 20,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/* ---------- ITEM CARD ---------- */
function ItemCard({ item, onDelete }) {
  const isResolved = item.status === 'resolved' || item.status === 'closed';

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.09)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          style={{ width: '100%', height: 180, objectFit: 'cover' }}
        />
      )}

      <div style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0d0d0d', margin: 0 }}>
            {item.name}
          </h3>
          {/* ✅ Badge always renders — even if status is null it shows "active" */}
          <Badge status={item.status} />
        </div>

        <p style={{ fontSize: 12, color: '#888', margin: '4px 0' }}>🏷 {item.category}</p>
        <p style={{ fontSize: 12, color: '#888', margin: '4px 0' }}>📍 {item.location}</p>
        <p style={{ fontSize: 12, color: '#888', margin: '4px 0' }}>
          📅 {item.date_occurred ? new Date(item.date_occurred).toLocaleDateString() : '—'}
        </p>

        {item.description && (
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{item.description}</p>
        )}

        <div style={{ marginTop: 12 }}>
          {isResolved ? (
            <span style={{
              background: '#e6f4ea', color: '#1a6b3c',
              fontSize: 12, padding: '4px 10px', borderRadius: 8,
            }}>
              Case Resolved
            </span>
          ) : (
            <button
              onClick={() => onDelete(item.id)}
              style={{
                border: '0.5px solid rgba(0,0,0,0.2)',
                padding: '6px 12px',
                borderRadius: 8,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- EMPTY ---------- */
function EmptyState({ text, link, linkText }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem', background: '#fff',
      borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.09)',
    }}>
      <p style={{ color: '#aaa', marginBottom: 12 }}>{text}</p>
      <Link href={link} style={{
        background: '#0d0d0d', color: '#fff', padding: '8px 14px',
        borderRadius: 8, textDecoration: 'none', fontSize: 13,
      }}>
        {linkText}
      </Link>
    </div>
  );
}

/* ---------- MAIN PAGE ---------- */
export default function MyLostItemsPage() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await authFetch('/api/items?type=lost');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    const res = await authFetch(`/api/items/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter(i => i.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete item');
    }
  };

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />
      <div className="page">
        <div className="inner">

          <div className="header">
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase' }}>
                Lost Items
              </div>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#0d0d0d' }}>My Lost Items</h1>
              <p style={{ fontSize: 14, color: '#888' }}>Items you have reported as lost</p>
            </div>

            <Link href="/items/lost/new" style={{
              background: '#0d0d0d', color: '#fff', padding: '8px 16px',
              borderRadius: 8, textDecoration: 'none', fontSize: 13,
            }}>
              + Report Lost
            </Link>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>Loading...</p>
          ) : items.length === 0 ? (
            <EmptyState text="No lost items reported yet" link="/items/lost/new" linkText="Report Lost Item" />
          ) : (
            <div className="grid">
              {items.map(item => (
                <ItemCard key={item.id} item={item} onDelete={deleteItem} />
              ))}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}