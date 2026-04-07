'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function MyLostItemsPage() {
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
      <Navbar />
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>✅ My Found Items</h1>
            <p style={subtitleStyle}>Items you have reported as found</p>
          </div>
          <Link href="/items/found/new" style={btnPrimary}>+ Report New</Link>
        </div>

        {loading ? (
          <p style={mutedStyle}>Loading...</p>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📦"
            text="You haven't reported any found items yet"
            link="/items/found/new"
            linkText="Report a Found Item"
          />
        ) : (
          <div style={gridStyle}>
            {items.map(item => (
              <ItemCard key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ItemCard({ item, onDelete }) {
  const isResolved = item.status === 'resolved' || item.status === 'closed';

  return (
    <div style={cardStyle}>
      {item.image_url && (
        <img src={item.image_url} alt={item.name} style={imgStyle} />
      )}
      <div style={cardBodyStyle}>
        <div style={cardTopStyle}>
          <h3 style={itemNameStyle}>{item.name}</h3>
          <StatusBadge status={item.status} />
        </div>
        <p style={metaStyle}>🏷️ {item.category}</p>
        <p style={metaStyle}>📍 {item.location}</p>
        <p style={metaStyle}>📅 {new Date(item.date_occurred).toLocaleDateString()}</p>
        {item.description && (
          <p style={descStyle}>{item.description}</p>
        )}
        <div style={cardActionsStyle}>
          {isResolved ? (
            <span style={resolvedTagStyle}>✅ Case Resolved</span>
          ) : (
            <button onClick={() => onDelete(item.id)} style={btnDelete}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active: '#4caf50', matched: '#ff9800',
    claimed: '#2196f3', resolved: '#9c27b0', closed: '#666',
  };
  return (
    <span style={{
      background: `${colors[status] || '#666'}20`,
      color: colors[status] || '#666',
      border: `1px solid ${colors[status] || '#666'}`,
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
    }}>
      {status}
    </span>
  );
}

function EmptyState({ icon, text, link, linkText }) {
  return (
    <div style={emptyStyle}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <p style={{ color: '#aaa', margin: '1rem 0' }}>{text}</p>
      <Link href={link} style={btnPrimary}>{linkText}</Link>
    </div>
  );
}

const pageStyle = { maxWidth: '1100px', margin: '0 auto', padding: '2rem' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' };
const subtitleStyle = { color: '#aaa', marginTop: '0.3rem' };
const mutedStyle = { color: '#aaa', textAlign: 'center' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' };
const cardStyle = { background: '#1a1a2e', borderRadius: '10px', border: '1px solid #333', overflow: 'hidden' };
const imgStyle = { width: '100%', height: '180px', objectFit: 'cover' };
const cardBodyStyle = { padding: '1.2rem' };
const cardTopStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' };
const itemNameStyle = { color: '#fff', fontWeight: '600', fontSize: '1rem' };
const metaStyle = { color: '#aaa', fontSize: '0.85rem', marginTop: '0.3rem' };
const descStyle = { color: '#888', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' };
const cardActionsStyle = { display: 'flex', gap: '0.5rem', marginTop: '1rem' };
const resolvedTagStyle = { background: '#4caf5020', color: '#4caf50', border: '1px solid #4caf5070', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' };
const btnPrimary = { background: '#e94560', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', border: 'none' };
const btnDelete = { background: '#ff000020', color: '#ff6b6b', border: '1px solid #ff000060', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' };
const emptyStyle = { textAlign: 'center', padding: '4rem 2rem', background: '#1a1a2e', borderRadius: '12px', border: '1px solid #333' };