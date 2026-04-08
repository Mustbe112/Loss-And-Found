'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Admin-only Navbar ────────────────────────────────────────────────────────
function AdminNavbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={navStyle}>
      <Link href="/admin" style={navBrandStyle}>🛡️ Admin Panel</Link>
      <div style={navLinksStyle}>
        <Link href="/admin" style={navLinkStyle}>Dashboard</Link>
        <Link href="/admin/reports" style={navLinkStyle}>Reports</Link>
        <Link href="/admin/items" style={navLinkStyle}>Items</Link>
        <span style={navUserStyle}>👤 {user?.name}</span>
        <button onClick={logout} style={navLogoutStyle}>Logout</button>
      </div>
    </nav>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { authFetch, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [lockedClaims, setLockedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);
  const [expandedLocked, setExpandedLocked] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading]);  // wait until auth is ready

  const fetchData = async () => {
    const [reportsRes, lockedRes] = await Promise.all([
      authFetch('/api/admin/reports'),
      authFetch('/api/admin/locked-claims'),
    ]);
    const [reportsData, lockedData] = await Promise.all([
      reportsRes.json(),
      lockedRes.json(),
    ]);
    setReports(reportsData.reports || []);
    setLockedClaims(lockedData.lockedClaims || []);
    setLoading(false);
  };

  const updateReportStatus = async (id, status) => {
    await authFetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const openReports  = reports.filter(r => r.status === 'open').length;
  const underReview  = reports.filter(r => r.status === 'under_review').length;
  const resolved     = reports.filter(r => r.status === 'resolved').length;
  const pendingItems = lockedClaims.length;

  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <div style={pageStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>🛡️ Admin Dashboard</h1>
          <p style={subtitleStyle}>Manage reports, verify returned items, and monitor the system</p>
        </div>

        {/* Stats */}
        <div style={statsGrid}>
          <StatCard label="Open Reports"    value={openReports}  icon="🚨" color="#e94560" />
          <StatCard label="Under Review"    value={underReview}  icon="🔍" color="#ff9800" />
          <StatCard label="Resolved"        value={resolved}     icon="✅" color="#4caf50" />
          <StatCard label="Items at Office" value={pendingItems} icon="📦" color="#2196f3" />
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

        {/* ── Items Submitted to Admin Office (locked claims) ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>📦 Items at Admin Office</h2>
            <span style={badgeStyle('#2196f3')}>{pendingItems} pending</span>
          </div>
          <p style={sectionDescStyle}>
            These items were submitted to the admin office because the claimant failed verification 3 times.
            Verify that the finder has dropped them off before marking as resolved.
          </p>

          {loading ? (
            <p style={mutedStyle}>Loading...</p>
          ) : lockedClaims.length === 0 ? (
            <p style={mutedStyle}>No items at the admin office.</p>
          ) : (
            <div style={listStyle}>
              {lockedClaims.map(lc => (
                <div key={lc.vq_id} style={lockedCardStyle}>
                  <div
                    style={lockedCardHeaderStyle}
                    onClick={() => setExpandedLocked(expandedLocked === lc.vq_id ? null : lc.vq_id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {lc.found_item.image_url && (
                        <img src={lc.found_item.image_url} alt={lc.found_item.name} style={thumbStyle} />
                      )}
                      <div>
                        <p style={lockedItemNameStyle}>🔒 {lc.found_item.name}</p>
                        <p style={mutedStyle}>
                          📍 Found at: {lc.found_item.location} · 🏷️ {lc.found_item.category}
                        </p>
                        <p style={mutedStyle}>
                          Claimant failed {lc.attempts} attempts · {new Date(lc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={badgeStyle('#e94560')}>Verification Failed</span>
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>
                        {expandedLocked === lc.vq_id ? '▲ Hide' : '▼ Details'}
                      </span>
                    </div>
                  </div>

                  {expandedLocked === lc.vq_id && (
                    <div style={expandedStyle}>
                      <div style={detailsGridStyle}>

                        {/* Found Item */}
                        <DetailBox title="📦 Found Item" color="#2196f3">
                          {lc.found_item.image_url && (
                            <img src={lc.found_item.image_url} alt="" style={detailImgStyle} />
                          )}
                          <DetailRow label="Name"     value={lc.found_item.name} />
                          <DetailRow label="Category" value={lc.found_item.category} />
                          <DetailRow label="Location" value={lc.found_item.location} />
                          <DetailRow label="Description" value={lc.found_item.description} />
                        </DetailBox>

                        {/* Lost Item */}
                        <DetailBox title="🔍 Lost Item (Claimed)" color="#ff9800">
                          {lc.lost_item.image_url && (
                            <img src={lc.lost_item.image_url} alt="" style={detailImgStyle} />
                          )}
                          <DetailRow label="Name"     value={lc.lost_item.name} />
                          <DetailRow label="Category" value={lc.lost_item.category} />
                          <DetailRow label="Location" value={lc.lost_item.location} />
                          <DetailRow label="Description" value={lc.lost_item.description} />
                        </DetailBox>

                        {/* People */}
                        <DetailBox title="👥 People Involved" color="#9c27b0">
                          <p style={detailSubtitleStyle}>Finder (Respondent)</p>
                          <DetailRow label="Name"  value={lc.respondent.name} />
                          <DetailRow label="Email" value={lc.respondent.email} />
                          <div style={{ marginTop: '1rem' }} />
                          <p style={detailSubtitleStyle}>Claimant (Lost Person)</p>
                          <DetailRow label="Name"  value={lc.claimant.name} />
                          <DetailRow label="Email" value={lc.claimant.email} />
                          <div style={{ marginTop: '1rem' }} />
                          <p style={detailSubtitleStyle}>Verification</p>
                          <DetailRow label="Question" value={lc.question} />
                          <DetailRow label="Attempts" value={`${lc.attempts} / 3`} />
                        </DetailBox>

                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Reports ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>🚨 Recent Reports</h2>
            <Link href="/admin/reports" style={viewAllStyle}>View all →</Link>
          </div>

          {loading ? (
            <p style={mutedStyle}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={mutedStyle}>No reports yet.</p>
          ) : (
            <div style={listStyle}>
              {reports.slice(0, 5).map(report => (
                <div key={report.id} style={reportCardStyle}>
                  {/* Clickable header */}
                  <div
                    style={reportCardHeaderStyle}
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={reportReasonStyle}>{report.reason}</p>
                      <p style={mutedStyle}>
                        👤 {report.reporter?.name} · {report.reporter?.email} · {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <StatusBadge status={report.status} />
                      {report.status === 'open' && (
                        <button
                          onClick={e => { e.stopPropagation(); updateReportStatus(report.id, 'under_review'); }}
                          style={btnReview}
                        >Review</button>
                      )}
                      {report.status === 'under_review' && (
                        <button
                          onClick={e => { e.stopPropagation(); updateReportStatus(report.id, 'resolved'); }}
                          style={btnResolve}
                        >Resolve</button>
                      )}
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>
                        {expandedReport === report.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded full details */}
                  {expandedReport === report.id && report.claim && (
                    <div style={expandedStyle}>
                      <div style={detailsGridStyle}>

                        <DetailBox title="🔍 Lost Item" color="#ff9800">
                          {report.claim.lost_item?.image_url && (
                            <img src={report.claim.lost_item.image_url} alt="" style={detailImgStyle} />
                          )}
                          <DetailRow label="Name"        value={report.claim.lost_item?.name} />
                          <DetailRow label="Category"    value={report.claim.lost_item?.category} />
                          <DetailRow label="Location"    value={report.claim.lost_item?.location} />
                          <DetailRow label="Description" value={report.claim.lost_item?.description} />
                        </DetailBox>

                        <DetailBox title="📦 Found Item" color="#2196f3">
                          {report.claim.found_item?.image_url && (
                            <img src={report.claim.found_item.image_url} alt="" style={detailImgStyle} />
                          )}
                          <DetailRow label="Name"        value={report.claim.found_item?.name} />
                          <DetailRow label="Category"    value={report.claim.found_item?.category} />
                          <DetailRow label="Location"    value={report.claim.found_item?.location} />
                          <DetailRow label="Description" value={report.claim.found_item?.description} />
                        </DetailBox>

                        <DetailBox title="👥 People Involved" color="#9c27b0">
                          <p style={detailSubtitleStyle}>Claimant</p>
                          <DetailRow label="Name"  value={report.claim.claimant?.name} />
                          <DetailRow label="Email" value={report.claim.claimant?.email} />
                          <div style={{ marginTop: '1rem' }} />
                          <p style={detailSubtitleStyle}>Finder</p>
                          <DetailRow label="Name"  value={report.claim.respondent?.name} />
                          <DetailRow label="Email" value={report.claim.respondent?.email} />
                          <div style={{ marginTop: '1rem' }} />
                          <p style={detailSubtitleStyle}>Claim</p>
                          <DetailRow label="Status" value={report.claim.status} />
                        </DetailBox>

                      </div>

                      {report.admin_notes && (
                        <div style={adminNotesStyle}>
                          <p style={{ color: '#aaa', fontSize: '0.82rem', fontWeight: 600 }}>Admin Notes</p>
                          <p style={{ color: '#fff', fontSize: '0.88rem', marginTop: '0.3rem' }}>{report.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {expandedReport === report.id && !report.claim && (
                    <div style={{ ...expandedStyle, color: '#666', fontSize: '0.85rem' }}>
                      No claim linked to this report.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function DetailBox({ title, color, children }) {
  return (
    <div style={{ background: '#0a0a18', borderRadius: '10px', border: `1px solid ${color}30`, padding: '1.2rem' }}>
      <p style={{ color, fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <span style={{ color: '#666', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}: </span>
      <span style={{ color: '#ccc', fontSize: '0.88rem' }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #333', borderTop: `3px solid ${color}` }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{value}</p>
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { open: '#e94560', under_review: '#ff9800', resolved: '#4caf50', pending: '#ff9800' };
  const c = colors[status] || '#666';
  return (
    <span style={{ background: `${c}20`, color: c, border: `1px solid ${c}`, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem' }}>
      {status}
    </span>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const navStyle = { background: '#0a0a18', borderBottom: '1px solid #1e1e35', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 };
const navBrandStyle = { color: '#e94560', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', letterSpacing: '0.02em' };
const navLinksStyle = { display: 'flex', alignItems: 'center', gap: '1.5rem' };
const navLinkStyle = { color: '#aaa', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' };
const navUserStyle = { color: '#666', fontSize: '0.85rem' };
const navLogoutStyle = { background: '#e9456020', color: '#e94560', border: '1px solid #e9456060', padding: '0.35rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer' };

const pageStyle = { maxWidth: '1100px', margin: '0 auto', padding: '2rem' };
const headerStyle = { marginBottom: '2rem' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' };
const subtitleStyle = { color: '#aaa', marginTop: '0.3rem' };
const mutedStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const quickLinksStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' };
const quickLinkCard = (color) => ({ background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: `1px solid ${color}40`, textDecoration: 'none', display: 'block' });
const quickLinkIcon = { fontSize: '2rem', display: 'block', marginBottom: '0.8rem' };
const quickLinkTitle = { color: '#fff', fontWeight: '600', fontSize: '1rem', marginBottom: '0.3rem' };
const quickLinkDesc = { color: '#aaa', fontSize: '0.85rem' };
const sectionStyle = { background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: '1px solid #333', marginBottom: '1.5rem' };
const sectionHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' };
const sectionTitleStyle = { fontSize: '1rem', fontWeight: '600', color: '#fff' };
const sectionDescStyle = { color: '#666', fontSize: '0.82rem', marginBottom: '1.2rem', lineHeight: '1.5' };
const viewAllStyle = { color: '#e94560', fontSize: '0.85rem', textDecoration: 'none' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '0.8rem' };
const badgeStyle = (color) => ({ background: `${color}20`, color, border: `1px solid ${color}60`, padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 });

const lockedCardStyle = { background: '#0f0f1a', borderRadius: '10px', border: '1px solid #e9456030', overflow: 'hidden' };
const lockedCardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', cursor: 'pointer', flexWrap: 'wrap', gap: '0.8rem' };
const lockedItemNameStyle = { color: '#fff', fontWeight: 600, fontSize: '0.95rem' };
const thumbStyle = { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 };

const reportCardStyle = { background: '#0f0f1a', borderRadius: '10px', border: '1px solid #2a2a3e', overflow: 'hidden' };
const reportCardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.2rem', cursor: 'pointer', flexWrap: 'wrap', gap: '0.8rem' };
const reportReasonStyle = { color: '#fff', fontSize: '0.9rem', marginBottom: '0.25rem' };

const expandedStyle = { padding: '1.2rem', borderTop: '1px solid #1e1e35', background: '#070710' };
const detailsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' };
const detailImgStyle = { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.8rem' };
const detailSubtitleStyle = { color: '#aaa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' };
const adminNotesStyle = { marginTop: '1rem', background: '#1a1a2e', borderRadius: '8px', padding: '0.8rem 1rem', border: '1px solid #333' };

const btnReview = { background: '#ff980020', color: '#ff9800', border: '1px solid #ff9800', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' };
const btnResolve = { background: '#4caf5020', color: '#4caf50', border: '1px solid #4caf50', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' };