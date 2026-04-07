'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// ── Styles ──────────────────────────────────────────
const pageStyle = { maxWidth: '1100px', margin: '0 auto', padding: '2rem' };
const headerStyle = { marginBottom: '2rem' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' };
const subtitleStyle = { color: '#aaa', marginTop: '0.3rem' };
const mutedStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.3rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const statCardStyle = { background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #333' };
const quickLinksStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const quickLinkCard = (color) => ({ background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: `1px solid ${color}40`, textDecoration: 'none', display: 'block' });
const quickLinkIcon = { fontSize: '2rem', display: 'block', marginBottom: '0.8rem' };
const quickLinkTitle = { color: '#fff', fontWeight: '600', fontSize: '1rem', marginBottom: '0.3rem' };
const quickLinkDesc = { color: '#aaa', fontSize: '0.85rem' };
const sectionStyle = { background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: '1px solid #333', marginBottom: '1.5rem' };
const sectionHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const sectionTitleStyle = { fontSize: '1rem', fontWeight: '600', color: '#fff' };
const viewAllStyle = { color: '#e94560', fontSize: '0.85rem', textDecoration: 'none' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '0.8rem' };
const reportRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f0f1a', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap', gap: '0.8rem' };
const reportInfoStyle = { flex: 1 };
const reportReasonStyle = { color: '#fff', fontSize: '0.9rem', marginBottom: '0.3rem' };
const reportActionsStyle = { display: 'flex', gap: '0.8rem', alignItems: 'center' };
const btnReview = { background: '#ff980020', color: '#ff9800', border: '1px solid #ff9800', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' };
const btnResolve = { background: '#4caf5020', color: '#4caf50', border: '1px solid #4caf50', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' };
const itemsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' };
const itemCardStyle = { background: '#0f0f1a', borderRadius: '8px', border: '1px solid #2a2a3e', overflow: 'hidden' };
const imgStyle = { width: '100%', height: '140px', objectFit: 'cover' };
const itemBodyStyle = { padding: '1rem' };
const itemTopStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' };
const itemNameStyle = { color: '#fff', fontWeight: '600', fontSize: '0.95rem' };
// ────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [reports, setReports] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [reportsRes, itemsRes] = await Promise.all([
      authFetch('/api/admin/reports'),
      authFetch('/api/admin/items'),
    ]);
    const [reportsData, itemsData] = await Promise.all([
      reportsRes.json(),
      itemsRes.json(),
    ]);
    setReports(reportsData.reports || []);
    setItems(itemsData.items || []);
    setLoading(false);
  };

  const openReports = reports.filter(r => r.status === 'open').length;
  const underReview = reports.filter(r => r.status === 'under_review').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const activeItems = items.filter(i => i.status === 'active').length;

  return (
    <ProtectedRoute adminOnly>
      <Navbar />
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>🛡️ Admin Dashboard</h1>
            <p style={subtitleStyle}>Manage reports and monitor system activity</p>
          </div>
        </div>

        {/* Stats */}
        <div style={statsGrid}>
          <StatCard label="Open Reports" value={openReports} icon="🚨" color="#e94560" />
          <StatCard label="Under Review" value={underReview} icon="🔍" color="#ff9800" />
          <StatCard label="Resolved" value={resolved} icon="✅" color="#4caf50" />
          <StatCard label="Active Items" value={activeItems} icon="📦" color="#2196f3" />
        </div>

        {/* Quick Links */}
        <div style={quickLinksStyle}>
          <Link href="/admin/reports" style={quickLinkCard('#e94560')}>
            <span style={quickLinkIcon}>🚨</span>
            <p style={quickLinkTitle}>All Reports</p>
            <p style={quickLinkDesc}>Review flagged cases and disputes</p>
          </Link>
          <Link href="/admin/items" style={quickLinkCard('#2196f3')}>
            <span style={quickLinkIcon}>📦</span>
            <p style={quickLinkTitle}>All Items</p>
            <p style={quickLinkDesc}>View all lost and found items</p>
          </Link>
        </div>

        {/* Recent Reports */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>🚨 Recent Reports</h2>
            <Link href="/admin/reports" style={viewAllStyle}>View all →</Link>
          </div>

          {loading ? (
            <p style={mutedStyle}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={mutedStyle}>No reports yet</p>
          ) : (
            <div style={listStyle}>
              {reports.slice(0, 5).map(report => (
                <ReportRow key={report.id} report={report} onUpdate={fetchData} authFetch={authFetch} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Items */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>📦 Recent Items</h2>
            <Link href="/admin/items" style={viewAllStyle}>View all →</Link>
          </div>

          {loading ? (
            <p style={mutedStyle}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={mutedStyle}>No items yet</p>
          ) : (
            <div style={itemsGridStyle}>
              {items.slice(0, 6).map(item => (
                <div key={item.id} style={itemCardStyle}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} style={imgStyle} />
                  )}
                  <div style={itemBodyStyle}>
                    <div style={itemTopStyle}>
                      <p style={itemNameStyle}>{item.name}</p>
                      <TypeBadge type={item.type} />
                    </div>
                    <p style={mutedStyle}>🏷️ {item.category} · 📍 {item.location}</p>
                    <p style={mutedStyle}>👤 {item.user_name}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}

function ReportRow({ report, onUpdate, authFetch }) {
  const updateStatus = async (status) => {
    await authFetch(`/api/admin/reports/${report.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    onUpdate();
  };

  return (
    <div style={reportRowStyle}>
      <div style={reportInfoStyle}>
        <p style={reportReasonStyle}>{report.reason}</p>
        <p style={mutedStyle}>
          👤 {report.reporter_name} · {new Date(report.created_at).toLocaleDateString()}
        </p>
      </div>
      <div style={reportActionsStyle}>
        <StatusBadge status={report.status} />
        {report.status === 'open' && (
          <button onClick={() => updateStatus('under_review')} style={btnReview}>
            Review
          </button>
        )}
        {report.status === 'under_review' && (
          <button onClick={() => updateStatus('resolved')} style={btnResolve}>
            Resolve
          </button>
        )}
      </div>
    </div>
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

function StatusBadge({ status }) {
  const colors = {
    open: '#e94560', under_review: '#ff9800', resolved: '#4caf50',
    active: '#4caf50', matched: '#ff9800', claimed: '#2196f3',
    closed: '#666', pending: '#ff9800',
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

function TypeBadge({ type }) {
  return (
    <span style={{
      background: type === 'lost' ? '#e9456020' : '#4caf5020',
      color: type === 'lost' ? '#e94560' : '#4caf50',
      border: `1px solid ${type === 'lost' ? '#e94560' : '#4caf50'}`,
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
    }}>
      {type}
    </span>
  );
}

