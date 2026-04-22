'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .home {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }

    /* ── HERO ── */
    .hero {
      background: #0d0d0d;
      padding: 52px 0 48px;
    }
    .hero-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
    }
    .hero-eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 14px;
    }
    .hero-title {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -1.5px;
      color: #fff;
      line-height: 1.08;
      margin-bottom: 12px;
    }
    .hero-title span { color: #f5f4f0; opacity: 0.35; }
    .hero-sub {
      font-size: 14px;
      color: #888;
      font-weight: 400;
      max-width: 420px;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 42px;
      padding: 0 22px;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      white-space: nowrap;
    }
    .hero-btn-light {
      background: #fff;
      color: #0d0d0d;
    }
    .hero-btn-outline {
      background: transparent;
      color: #fff;
      border: 0.5px solid rgba(255,255,255,0.2);
    }

    /* ── STAT BAR ── */
    .stat-bar {
      background: #fff;
      border-bottom: 0.5px solid rgba(0,0,0,0.07);
    }
    .stat-bar-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 32px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
    .stat-item {
      padding: 20px 0 20px 24px;
      border-right: 0.5px solid rgba(0,0,0,0.07);
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .stat-item:first-child { padding-left: 0; }
    .stat-item:last-child { border-right: none; }
    .stat-icon-wrap {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-num {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.8px;
      color: #0d0d0d;
      line-height: 1;
    }
    .stat-lbl {
      font-size: 11.5px;
      color: #aaa;
      margin-top: 3px;
    }

    /* ── MAIN CONTENT ── */
    .main-content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 32px 56px;
    }

    /* ── SECTION LABEL ── */
    .section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #aaa;
      margin-bottom: 14px;
    }

    /* ── QUICK ACTIONS ── */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .action-card {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      padding: 22px 22px 20px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: border-color 0.15s, box-shadow 0.15s;
      cursor: pointer;
    }
    .action-card:hover {
      border-color: rgba(0,0,0,0.18);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .action-card-icon {
      width: 40px; height: 40px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
    }
    .action-card-title {
      font-size: 14px;
      font-weight: 700;
      color: #0d0d0d;
      margin-bottom: 4px;
    }
    .action-card-desc {
      font-size: 12.5px;
      color: #999;
      font-weight: 400;
      line-height: 1.5;
    }
    .action-card-arrow {
      margin-top: auto;
      font-size: 12px;
      color: #ccc;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ── TWO COL ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 16px;
      align-items: start;
    }

    /* ── PANEL ── */
    .panel {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      overflow: hidden;
    }
    .panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 0.5px solid rgba(0,0,0,0.06);
    }
    .panel-head-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0d0d0d;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .panel-head-link {
      font-size: 12px;
      color: #bbb;
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .panel-head-link:hover { color: #0d0d0d; }

    /* ── TABS ── */
    .tabs {
      display: flex;
      border-bottom: 0.5px solid rgba(0,0,0,0.06);
      padding: 0 20px;
    }
    .tab {
      font-size: 12.5px;
      font-weight: 500;
      color: #bbb;
      padding: 10px 0;
      margin-right: 20px;
      border: none;
      border-bottom: 2px solid transparent;
      background: none;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: color 0.1s;
    }
    .tab.active { color: #0d0d0d; border-bottom-color: #0d0d0d; font-weight: 600; }

    /* ── ITEM ROW ── */
    .panel-list { padding: 8px 12px 12px; }
    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px;
      border-radius: 8px;
      transition: background 0.1s;
    }
    .item-row:hover { background: #f9f9f8; }
    .item-index {
      font-size: 11px;
      color: #ddd;
      font-weight: 500;
      width: 18px;
      text-align: right;
      flex-shrink: 0;
    }
    .item-body { flex: 1; min-width: 0; }
    .item-name {
      font-size: 13px;
      font-weight: 600;
      color: #0d0d0d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta {
      font-size: 11px;
      color: #bbb;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* ── NOTIF ROW ── */
    .notif-row {
      display: flex;
      gap: 10px;
      padding: 11px 20px;
      border-bottom: 0.5px solid rgba(0,0,0,0.05);
      align-items: flex-start;
    }
    .notif-row:last-child { border-bottom: none; }
    .notif-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .notif-msg { font-size: 12.5px; color: #333; line-height: 1.5; }
    .notif-date { font-size: 11px; color: #ccc; margin-top: 2px; }

    /* ── CLAIM ROW ── */
    .claim-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 20px;
      border-bottom: 0.5px solid rgba(0,0,0,0.05);
    }
    .claim-row:last-child { border-bottom: none; }
    .claim-name { font-size: 13px; font-weight: 600; color: #0d0d0d; }
    .claim-sub  { font-size: 11px; color: #bbb; margin-top: 2px; }

    /* ── RIGHT COL ── */
    .right-col { display: flex; flex-direction: column; gap: 16px; }

    /* ── BADGE ── */
    .badge {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── EMPTY ── */
    .empty {
      padding: 32px 20px;
      text-align: center;
      font-size: 13px;
      color: #ccc;
      font-weight: 300;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 960px) {
      .two-col { grid-template-columns: 1fr; }
      .right-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    }
    @media (max-width: 768px) {
      .hero-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
      .hero-title { font-size: 30px; }
      .stat-bar-inner { grid-template-columns: repeat(2, 1fr); }
      .stat-item:nth-child(2) { border-right: none; }
      .stat-item:nth-child(1),
      .stat-item:nth-child(2) { border-bottom: 0.5px solid rgba(0,0,0,0.07); }
      .quick-actions { grid-template-columns: 1fr 1fr; }
      .right-col { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .hero { padding: 36px 0 32px; }
      .hero-inner, .stat-bar-inner, .main-content { padding-left: 18px; padding-right: 18px; }
      .hero-title { font-size: 26px; }
      .quick-actions { grid-template-columns: 1fr; }
      .hero-actions { width: 100%; }
      .hero-btn { flex: 1; justify-content: center; }
    }
  `}</style>
);

/* ── BADGE ── */
const badgeMap = {
  active:    { bg: '#e6f4ea', color: '#1a6b3c' },
  matched:   { bg: '#fef9e6', color: '#92600a' },
  claimed:   { bg: '#e8f0fe', color: '#1a47a0' },
  resolved:  { bg: '#f0ebfe', color: '#5b21b6' },
  closed:    { bg: '#f3f4f6', color: '#6b7280' },
  pending:   { bg: '#fef9e6', color: '#92600a' },
  verifying: { bg: '#e8f0fe', color: '#1a47a0' },
  confirmed: { bg: '#e6f4ea', color: '#1a6b3c' },
  rejected:  { bg: '#fdecea', color: '#b91c1c' },
  disputed:  { bg: '#fdecea', color: '#b91c1c' },
};
function Badge({ status }) {
  const s = badgeMap[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

/* ── ICONS ── */
function Ico({ d, size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width={11} height={11} viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}
function Plus() {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}

/* ── PAGE ── */
export default function HomePage() {
  const { authFetch, user } = useAuth();
  const [lostItems, setLostItems]         = useState([]);
  const [foundItems, setFoundItems]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [claims, setClaims]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('lost');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [lostRes, foundRes, notifRes, claimsRes] = await Promise.all([
        authFetch('/api/items?type=lost'),
        authFetch('/api/items?type=found'),
        authFetch('/api/notifications'),
        authFetch('/api/claims'),
      ]);
      const [lost, found, notif, claimsData] = await Promise.all([
        lostRes.json(), foundRes.json(), notifRes.json(), claimsRes.json(),
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

  const unreadCount  = notifications.filter(n => !n.is_read).length;
  const activeClaims = claims.filter(c => c.status !== 'confirmed' && c.status !== 'rejected').length;
  const displayItems = activeTab === 'lost' ? lostItems : foundItems;
  const firstName    = user?.name?.split(' ')[0] || 'there';

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />
      <div className="home">

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">Lost &amp; Found · Findbase</div>
              <h1 className="hero-title">
                Hey, {firstName}.<br />
                <span>What can we help you find?</span>
              </h1>
              <p className="hero-sub">
                Report a missing item, log something you found, or track your active claims — all in one place.
              </p>
            </div>
            <div className="hero-actions">
              <Link href="/items/found/new" className="hero-btn hero-btn-outline">
                <Plus /> Report Found
              </Link>
              <Link href="/items/lost/new" className="hero-btn hero-btn-light">
                <Plus /> Report Lost
              </Link>
            </div>
          </div>
        </div>

        {/* ── STAT BAR ── */}
        <div className="stat-bar">
          <div className="stat-bar-inner">
            <div className="stat-item">
              <div className="stat-icon-wrap" style={{ background: '#fdecea' }}>
                <Ico d="M2 5h12v9H2zM5 5V4a3 3 0 0 1 6 0v1" color="#b91c1c" />
              </div>
              <div>
                <div className="stat-num">{lostItems.length}</div>
                <div className="stat-lbl">Lost Items</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap" style={{ background: '#e6f4ea' }}>
                <Ico d="M3 8l4 4 6-7" color="#1a6b3c" />
              </div>
              <div>
                <div className="stat-num">{foundItems.length}</div>
                <div className="stat-lbl">Found Items</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap" style={{ background: '#fef9e6' }}>
                <Ico d="M8 2a4.5 4.5 0 0 0-4.5 4.5c0 2.4-.8 3.5-1.5 4h12c-.7-.5-1.5-1.6-1.5-4A4.5 4.5 0 0 0 8 2z M6.5 13.5a1.5 1.5 0 0 0 3 0" color="#92600a" />
              </div>
              <div>
                <div className="stat-num">{unreadCount}</div>
                <div className="stat-lbl">Notifications</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap" style={{ background: '#e8f0fe' }}>
                <Ico d="M2 2h12v12H2z M5 8h6M5 5h6M5 11h4" color="#1a47a0" />
              </div>
              <div>
                <div className="stat-num">{activeClaims}</div>
                <div className="stat-lbl">Active Claims</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main-content">

          {/* Quick Actions */}
          <div className="section-label">Quick Actions</div>
          <div className="quick-actions">
            <Link href="/items/lost/new" className="action-card">
              <div className="action-card-icon" style={{ background: '#fdecea' }}>
                <Ico d="M2 5h12v9H2zM5 5V4a3 3 0 0 1 6 0v1" color="#b91c1c" size={17} />
              </div>
              <div>
                <div className="action-card-title">Report a Lost Item</div>
                <div className="action-card-desc">Something missing? File a report and we'll help track it down.</div>
              </div>
              <div className="action-card-arrow">Get started <ChevronRight /></div>
            </Link>

            <Link href="/items/found/new" className="action-card">
              <div className="action-card-icon" style={{ background: '#e6f4ea' }}>
                <Ico d="M3 8l4 4 6-7" color="#1a6b3c" size={17} />
              </div>
              <div>
                <div className="action-card-title">Log a Found Item</div>
                <div className="action-card-desc">Found something? Submit it so the owner can claim it back.</div>
              </div>
              <div className="action-card-arrow">Get started <ChevronRight /></div>
            </Link>
          </div>

          {/* Two column */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#bbb', fontSize: 13 }}>
              Loading your activity…
            </div>
          ) : (
            <div className="two-col">

              {/* Left: tabbed items */}
              <div>
                <div className="section-label">My Items</div>
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-head-title">
                      <Ico d="M2 5h12v9H2zM5 5V4a3 3 0 0 1 6 0v1" size={14} color="#aaa" />
                      My Reported Items
                    </div>
                    <Link
                      href={activeTab === 'lost' ? '/items/lost' : '/items/found'}
                      className="panel-head-link"
                    >
                      View all <ChevronRight />
                    </Link>
                  </div>
                  <div className="tabs">
                    <button className={`tab ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>
                      Lost ({lostItems.length})
                    </button>
                    <button className={`tab ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>
                      Found ({foundItems.length})
                    </button>
                  </div>
                  <div className="panel-list">
                    {displayItems.length === 0 ? (
                      <div className="empty">
                        No {activeTab} items yet —&nbsp;
                        <Link
                          href={activeTab === 'lost' ? '/items/lost/new' : '/items/found/new'}
                          style={{ color: '#0d0d0d', fontWeight: 600 }}
                        >
                          report one
                        </Link>
                      </div>
                    ) : (
                      displayItems.slice(0, 6).map((item, i) => (
                        <div className="item-row" key={item.id}>
                          <div className="item-index">{String(i + 1).padStart(2, '0')}</div>
                          <div className="item-body">
                            <div className="item-name">{item.name}</div>
                            <div className="item-meta">
                              <Ico d="M6 1a3 3 0 0 1 3 3c0 2-3 7-3 7S3 6 3 4a3 3 0 0 1 3-3z" size={10} color="#ccc" />
                              {item.location}
                              <span style={{ color: '#e0ddd8' }}>·</span>
                              {item.category}
                            </div>
                          </div>
                          <Badge status={item.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: notifications + claims */}
              <div className="right-col">
                <div>
                  <div className="section-label">Notifications</div>
                  <div className="panel">
                    <div className="panel-head">
                      <div className="panel-head-title">
                        <Ico d="M8 2a4.5 4.5 0 0 0-4.5 4.5c0 2.4-.8 3.5-1.5 4h12c-.7-.5-1.5-1.6-1.5-4A4.5 4.5 0 0 0 8 2z M6.5 13.5a1.5 1.5 0 0 0 3 0" size={14} color="#aaa" />
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{
                            background: '#0d0d0d', color: '#fff', fontSize: 10,
                            fontWeight: 700, borderRadius: 10, padding: '1px 7px', marginLeft: 4,
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <Link href="/notifications" className="panel-head-link">View all <ChevronRight /></Link>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="empty">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div className="notif-row" key={n.id}>
                          <div className="notif-dot" style={{ background: n.is_read ? '#ddd' : '#0d0d0d' }} />
                          <div>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-date">
                              {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="section-label">My Claims</div>
                  <div className="panel">
                    <div className="panel-head">
                      <div className="panel-head-title">
                        <Ico d="M2 2h12v12H2z M5 8h6M5 5h6M5 11h4" size={14} color="#aaa" />
                        Claims
                      </div>
                      <Link href="/claims" className="panel-head-link">View all <ChevronRight /></Link>
                    </div>
                    {claims.length === 0 ? (
                      <div className="empty">No claims yet</div>
                    ) : (
                      claims.slice(0, 4).map(claim => (
                        <div className="claim-row" key={claim.id}>
                          <div>
                            <div className="claim-name">{claim.lost_item_name}</div>
                            <div className="claim-sub">Found: {claim.found_item_name}</div>
                          </div>
                          <Badge status={claim.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}