'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .page-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .page-inner {
        padding: 1.5rem 1rem;
      }
      .items-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

/* ─────────────── SVG ICONS ─────────────── */
function IconPlus({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}

export default function MyFoundItemsPage() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await authFetch('/api/items?type=found');
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
        <div className="page-inner">
          
          {/* Header */}
          <div className="page-header">
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                color: '#aaa', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Found Items
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 700,
                letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15,
              }}>
                My Found Items
              </h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
                Items you have reported as found
              </p>
            </div>
            <Link href="/items/found/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#0d0d0d', color: '#fff', border: 'none',
              padding: '0.55rem 1.1rem', borderRadius: 8,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>
              <IconPlus size={13} /> Report Found
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb', fontSize: 14 }}>
              Loading your items...
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="items-grid">
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

function ItemCard({ item, onDelete }) {
  const isResolved = item.status?.toLowerCase() === 'resolved' || item.status?.toLowerCase() === 'closed';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '0.5px solid rgba(0,0,0,0.08)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {item.image_url && (
        <img 
          src={item.image_url} 
          alt={item.name} 
          style={{ 
            width: '100%', 
            height: 200, 
            objectFit: 'cover',
            borderBottom: '0.5px solid rgba(0,0,0,0.06)'
          }} 
        />
      )}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '0.75rem',
          gap: 8
        }}>
          <h3 style={{ 
            color: '#0d0d0d', 
            fontWeight: 600, 
            fontSize: 15,
            letterSpacing: '-0.2px',
            lineHeight: 1.3
          }}>
            {item.name}
          </h3>
          <StatusBadge status={item.status} />
        </div>
        
        <div style={{ marginBottom: '0.85rem' }}>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
            <span style={{ color: '#aaa' }}>Category:</span> {item.category}
          </p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
            <span style={{ color: '#aaa' }}>Location:</span> {item.location}
          </p>
          <p style={{ fontSize: 13, color: '#888' }}>
            <span style={{ color: '#aaa' }}>Date:</span> {new Date(item.date_occurred).toLocaleDateString()}
          </p>
        </div>
        
        {item.description && (
          <p style={{ 
            fontSize: 13, 
            color: '#999', 
            marginBottom: '1rem',
            lineHeight: 1.5,
            fontStyle: 'italic'
          }}>
            {item.description}
          </p>
        )}
        
        <div style={{ paddingTop: '0.75rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
          {isResolved ? (
            <span style={{
              display: 'inline-block',
              background: '#e6f4ea',
              color: '#1e7e34',
              padding: '0.4rem 0.85rem',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: '0.5px solid #b7e1cd'
            }}>
              ✓ Case Resolved
            </span>
          ) : (
            <button 
              onClick={() => onDelete(item.id)} 
              style={{
                background: 'transparent',
                color: '#d32f2f',
                border: '0.5px solid rgba(211, 47, 47, 0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
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

function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase();
  const config = {
    active: { bg: '#e8f0fe', color: '#1565c0', border: '#bbdefb' },
    matched: { bg: '#fff3e0', color: '#e65100', border: '#ffe0b2' },
    claimed: { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc' },
    resolved: { bg: '#e6f4ea', color: '#1e7e34', border: '#b7e1cd' },
    closed: { bg: '#f5f4f0', color: '#666', border: '#ddd' },
  };
  const c = config[normalizedStatus] || config.closed;
  
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      border: `0.5px solid ${c.border}`,
      padding: '0.25rem 0.65rem',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap'
    }}>
      {normalizedStatus}
    </span>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: '#fff',
      borderRadius: 12,
      border: '0.5px solid rgba(0,0,0,0.08)'
    }}>
      <div style={{ 
        fontSize: '3.5rem', 
        marginBottom: '1rem',
        opacity: 0.4
      }}>
        📦
      </div>
      <p style={{ 
        color: '#aaa', 
        marginBottom: '1.5rem',
        fontSize: 14
      }}>
        You haven't reported any found items yet
      </p>
      <Link 
        href="/items/found/new" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#0d0d0d',
          color: '#fff',
          padding: '0.55rem 1.1rem',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 500
        }}
      >
        <IconPlus size={13} /> Report a Found Item
      </Link>
    </div>
  );
}