'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';

function StatCard({ label, value, sub, pillLabel, pillStyle }) {
  return (
    <div style={cardBase}>
      <p style={statLabelStyle}>{label}</p>
      <p style={statValueStyle}>{value ?? '—'}</p>
      <p style={statSubStyle}>{sub}</p>
      {pillLabel && <span style={{ ...pillBase, ...pillStyle }}>{pillLabel}</span>}
    </div>
  );
}

function ClaimBar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ color: '#888', fontSize: '0.82rem' }}>{label}</span>
        <span style={{ color: '#1a1a18', fontSize: '0.82rem', fontWeight: 500 }}>
          {count} <span style={{ color: '#ccc', fontWeight: 300 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: '5px', background: '#f0ece6', borderRadius: '10px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '10px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function ActivityRow({ type, text, time, status }) {
  const dotColors = { report: '#c07070', claim: '#6b8fa0', item: '#7a9e7e' };
  const badgeStyles = {
    open:     { background: '#f0f7f1', color: '#5a8a5e' },
    pending:  { background: '#faf5e8', color: '#a07a20' },
    approved: { background: '#f0f7f1', color: '#5a8a5e' },
    rejected: { background: '#fdf0ef', color: '#a04040' },
    resolved: { background: '#f0eef8', color: '#6060a0' },
  };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid #f5f2ee' }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dotColors[type] || '#ccc', marginTop: '5px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: '#555', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{text}</p>
        <p style={{ color: '#ccc', fontSize: '0.72rem', marginTop: '2px' }}>{time}</p>
      </div>
      {status && (
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px', flexShrink: 0, marginTop: '2px', ...(badgeStyles[status] || {}) }}>{status}</span>
      )}
    </div>
  );
}

function Dashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const itemsRes  = await authFetch('/api/admin/items');
        const itemsData = await itemsRes.json();
        const items = itemsData.items || [];
        const lostItems  = items.filter(i => i.type === 'lost');
        const foundItems = items.filter(i => i.type === 'found');

        const rptRes  = await authFetch('/api/admin/reports');
        const rptData = await rptRes.json();
        const reports = rptData.reports || [];

        const claimRes  = await authFetch('/api/admin/locked-claims');
        const claimData = await claimRes.json();
        const allClaims = [...(claimData.pendingHandover || []), ...(claimData.lockedClaims || [])];

        const claimStatuses = { pending: 0, approved: 0, rejected: 0 };
        allClaims.forEach(c => {
          if (c.claim_status === 'pending') claimStatuses.pending++;
          else if (c.claim_status === 'approved') claimStatuses.approved++;
          else if (c.claim_status === 'rejected') claimStatuses.rejected++;
        });

        setStats({
          lostCount: lostItems.length,
          foundCount: foundItems.length,
          totalClaims: allClaims.length,
          claimStatuses,
          openReports: reports.filter(r => r.status === 'open').length,
          resolvedReports: reports.filter(r => r.status === 'resolved').length,
        });

        const acts = [
          ...reports.slice(0, 5).map(r => ({
            type: 'report',
            text: `${r.reporter?.name || 'User'} reported: "${r.reason?.slice(0, 50)}..."`,
            time: new Date(r.created_at).toLocaleString(),
            status: r.status,
          })),
          ...allClaims.slice(0, 5).map(c => ({
            type: 'claim',
            text: `Claim on "${c.found_item?.name || 'item'}" by ${c.claimant?.name || 'user'}`,
            time: new Date(c.created_at).toLocaleString(),
            status: c.claim_status,
          })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

        setActivity(acts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={spinnerStyle} />
    </div>
  );

  const total = stats?.totalClaims || 0;

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={h1Style}>Dashboard</h1>
            <p style={dateStyle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              &nbsp;·&nbsp;System overview
            </p>
          </div>
          <Link href="/admin/management" style={actionBtnStyle}>+ Accept Walk-In</Link>
        </div>

        <div style={gridStyle}>
          <StatCard label="Lost Items"   value={stats?.lostCount}   sub="Reported by users"      pillLabel="Active"    pillStyle={{ background: '#1a1a18', color: '#f5f3ef' }} />
          <StatCard label="Found Items"  value={stats?.foundCount}  sub="Submitted to system"    pillLabel="In system" pillStyle={{ background: '#eaf1f5', color: '#4a7a90' }} />
          <StatCard label="Total Claims" value={total}              sub={`${stats?.claimStatuses?.pending || 0} pending review`} pillLabel={`${stats?.claimStatuses?.pending || 0} pending`} pillStyle={{ background: '#faf3e0', color: '#a07820' }} />
          <StatCard label="Open Reports" value={stats?.openReports} sub={`${stats?.resolvedReports || 0} resolved`} pillLabel={`${stats?.resolvedReports || 0} resolved`} pillStyle={{ background: '#eef5ee', color: '#4a8050' }} />
        </div>

        <div style={lowerGrid}>
          <div style={sectionCard}>
            <div style={sectionHead}>
              <h2 style={sectionTitle}>Claims Breakdown</h2>
            </div>
            <ClaimBar label="Pending"  count={stats?.claimStatuses?.pending  || 0} total={total} color="#c09a40" />
            <ClaimBar label="Approved" count={stats?.claimStatuses?.approved || 0} total={total} color="#7a9e7e" />
            <ClaimBar label="Rejected" count={stats?.claimStatuses?.rejected || 0} total={total} color="#c07070" />
            <div style={quickLinks}>
              <Link href="/admin/management" style={miniLinkStyle}>Hand-in Queue</Link>
              <Link href="/admin/registry"   style={miniLinkStyle}>Item Registry</Link>
            </div>
          </div>

          <div style={sectionCard}>
            <div style={sectionHead}>
              <h2 style={sectionTitle}>Recent Activity</h2>
              <Link href="/admin/users" style={sectionLinkStyle}>View users</Link>
            </div>
            {activity.length === 0
              ? <p style={{ color: '#bbb', fontSize: '0.85rem' }}>No recent activity.</p>
              : activity.map((a, i) => <ActivityRow key={i} {...a} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <Dashboard />
    </ProtectedRoute>
  );
}

const pageStyle  = { width: '100%', minHeight: '100vh', background: '#f5f3ef', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };
const innerStyle = { maxWidth: '1400px', margin: '0 auto', padding: '2.2rem 2.5rem' };
const h1Style    = { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 400, color: '#1a1a18', letterSpacing: '-0.01em', lineHeight: 1.1 };
const dateStyle  = { fontSize: '0.75rem', color: '#bbb', marginTop: '6px', fontWeight: 300, letterSpacing: '0.04em' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' };
const actionBtnStyle = { background: '#1a1a18', color: '#f5f3ef', border: 'none', padding: '11px 22px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none' };
const gridStyle  = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };
const cardBase   = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '18px', padding: '1.6rem 1.5rem' };
const statLabelStyle = { fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', fontWeight: 500, marginBottom: '1rem' };
const statValueStyle = { fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, color: '#1a1a18', lineHeight: 1, marginBottom: '0.4rem' };
const statSubStyle   = { fontSize: '0.7rem', color: '#bbb', fontWeight: 300 };
const pillBase       = { display: 'inline-block', marginTop: '1rem', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '20px' };
const lowerGrid  = { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.2rem' };
const sectionCard = { background: '#fff', border: '1px solid #ede9e2', borderRadius: '18px', padding: '1.6rem' };
const sectionHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', paddingBottom: '1rem', borderBottom: '1px solid #f0ece6' };
const sectionTitle = { fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', fontWeight: 500, margin: 0 };
const sectionLinkStyle = { fontSize: '0.72rem', color: '#1a1a18', textDecoration: 'none', fontWeight: 500, background: '#f5f3ef', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.04em' };
const quickLinks = { marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid #f0ece6', display: 'flex', gap: '0.6rem' };
const miniLinkStyle = { fontSize: '0.72rem', color: '#1a1a18', textDecoration: 'none', padding: '7px 16px', border: '1px solid #ddd8d0', borderRadius: '30px', letterSpacing: '0.05em', fontWeight: 500 };
const spinnerStyle = { width: '32px', height: '32px', border: '2px solid #e8e4de', borderTop: '2px solid #1a1a18', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };