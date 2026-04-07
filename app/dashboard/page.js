'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function DashboardPage() {
  const { authFetch, user } = useAuth();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [lostRes, foundRes, notifRes, claimsRes] = await Promise.all([
        authFetch('/api/items?type=lost'),
        authFetch('/api/items?type=found'),
        authFetch('/api/notifications'),
        authFetch('/api/claims'),
      ]);

      const [lost, found, notif, claimsData] = await Promise.all([
        lostRes.json(),
        foundRes.json(),
        notifRes.json(),
        claimsRes.json(),
      ]);

      setLostItems(lost.items || []);
      setFoundItems(found.items || []);
      setNotifications(notif.notifications || []);
      setClaims(claimsData.claims || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Welcome back, {user?.name} 👋</h1>
            <p style={subtitleStyle}>Here's your Lost & Found activity</p>
          </div>
          <div style={actionBtnsStyle}>
            <Link href="/items/lost/new" style={btnPrimary}>+ Report Lost</Link>
            <Link href="/items/found/new" style={btnSecondary}>+ Report Found</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={statsGrid}>
          <StatCard label="Lost Items" value={lostItems.length} icon="📦" color="#e94560" />
          <StatCard label="Found Items" value={foundItems.length} icon="✅" color="#4caf50" />
          <StatCard label="Notifications" value={unreadCount} icon="🔔" color="#ff9800" />
          <StatCard label="Active Claims" value={claims.filter(c => c.status !== 'confirmed' && c.status !== 'rejected').length} icon="📋" color="#2196f3" />
        </div>

        {loading ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>Loading...</p>
        ) : (
          <div style={sectionsGrid}>

            {/* Lost Items */}
            <Section title="📦 My Lost Items" link="/items/lost" >
              {lostItems.length === 0 ? (
                <EmptyState text="No lost items reported" />
              ) : (
                lostItems.slice(0, 3).map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              )}
            </Section>

            {/* Found Items */}
            <Section title="✅ My Found Items" link="/items/found">
              {foundItems.length === 0 ? (
                <EmptyState text="No found items reported" />
              ) : (
                foundItems.slice(0, 3).map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              )}
            </Section>

            {/* Notifications */}
            <Section title="🔔 Notifications" link="/notifications">
              {notifications.length === 0 ? (
                <EmptyState text="No notifications yet" />
              ) : (
                notifications.slice(0, 4).map(n => (
                  <div key={n.id} style={{
                    ...notifItemStyle,
                    background: n.is_read ? '#1a1a2e' : '#1e1e3a',
                    borderLeft: n.is_read ? '3px solid #333' : '3px solid #e94560',
                  }}>
                    <p style={{ color: '#fff', fontSize: '0.9rem' }}>{n.message}</p>
                    <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </Section>

            {/* Claims */}
            <Section title="📋 My Claims" link="/claims">
              {claims.length === 0 ? (
                <EmptyState text="No claims yet" />
              ) : (
                claims.slice(0, 3).map(claim => (
                  <div key={claim.id} style={claimCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#fff', fontSize: '0.9rem' }}>{claim.lost_item_name}</p>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                      Found: {claim.found_item_name}
                    </p>
                  </div>
                ))
              )}
            </Section>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...statCardStyle, borderTop: `3px solid ${color}` }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</p>
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{label}</p>
      </div>
    </div>
  );
}

function Section({ title, link, children }) {
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <Link href={link} style={{ color: '#e94560', fontSize: '0.85rem', textDecoration: 'none' }}>
          View all →
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {children}
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div style={itemCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#fff', fontWeight: '500' }}>{item.name}</p>
        <StatusBadge status={item.status} />
      </div>
      <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.3rem' }}>
        📍 {item.location} · 🏷️ {item.category}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active: '#4caf50',
    matched: '#ff9800',
    claimed: '#2196f3',
    resolved: '#9c27b0',
    closed: '#666',
    pending: '#ff9800',
    verifying: '#2196f3',
    confirmed: '#4caf50',
    rejected: '#e94560',
    disputed: '#f44336',
  };

  return (
    <span style={{
      background: `${colors[status] || '#666'}20`,
      color: colors[status] || '#666',
      border: `1px solid ${colors[status] || '#666'}`,
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500',
    }}>
      {status}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
      {text}
    </p>
  );
}

const pageStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const titleStyle = {
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#fff',
};

const subtitleStyle = {
  color: '#aaa',
  marginTop: '0.3rem',
};

const actionBtnsStyle = {
  display: 'flex',
  gap: '1rem',
};

const btnPrimary = {
  background: '#e94560',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '0.9rem',
};

const btnSecondary = {
  background: 'transparent',
  color: '#fff',
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '0.9rem',
  border: '1px solid #444',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem',
};

const statCardStyle = {
  background: '#1a1a2e',
  borderRadius: '10px',
  padding: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  border: '1px solid #333',
};

const sectionsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.5rem',
};

const sectionStyle = {
  background: '#1a1a2e',
  borderRadius: '10px',
  padding: '1.5rem',
  border: '1px solid #333',
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  color: '#fff',
};

const itemCardStyle = {
  background: '#0f0f1a',
  borderRadius: '8px',
  padding: '0.8rem 1rem',
  border: '1px solid #2a2a3e',
};

const notifItemStyle = {
  borderRadius: '8px',
  padding: '0.8rem 1rem',
};

const claimCardStyle = {
  background: '#0f0f1a',
  borderRadius: '8px',
  padding: '0.8rem 1rem',
  border: '1px solid #2a2a3e',
};