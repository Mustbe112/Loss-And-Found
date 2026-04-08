'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .db-page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .db-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* NAV */
    .nav-root {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      border-bottom: 0.5px solid rgba(0,0,0,0.1);
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 2rem;
      justify-content: space-between;
    }
    .nav-desktop-links {
      display: flex;
      gap: 2rem;
    }
    .nav-desktop-links a {
      font-size: 13px;
      color: #888;
      text-decoration: none;
      font-weight: 400;
    }
    .nav-desktop-links a.active {
      color: #0d0d0d;
      font-weight: 600;
    }
    .hamburger-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      color: #0d0d0d;
      padding: 4px;
      align-items: center;
      justify-content: center;
    }
    .mobile-drawer {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: #fff;
      border-bottom: 0.5px solid rgba(0,0,0,0.1);
      z-index: 99;
      padding: 1rem 2rem 1.5rem;
      flex-direction: column;
    }
    .mobile-drawer.open {
      display: flex;
    }
    .mobile-drawer a {
      font-size: 15px;
      color: #0d0d0d;
      text-decoration: none;
      padding: 0.85rem 0;
      border-bottom: 0.5px solid rgba(0,0,0,0.07);
      font-weight: 400;
    }
    .mobile-drawer a:last-child {
      border-bottom: none;
    }

    /* PAGE HEADER */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* STATS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    /* SECTIONS */
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    /* RESPONSIVE */
    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .nav-desktop-links {
        display: none;
      }
      .hamburger-btn {
        display: flex;
      }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .sections-grid {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-actions {
        width: 100%;
      }
      .db-inner {
        padding: 1.5rem 1rem;
      }
    }
  `}</style>
);

/* ─────────────── SVG ICONS ─────────────── */
function StarLogo({ style }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  );
}
function IconBox({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="10" rx="1.5" />
      <path d="M5 4V3a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
function IconCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 8l4 4 6-7" />
    </svg>
  );
}
function IconBell({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 2a4.5 4.5 0 0 0-4.5 4.5c0 2.4-.8 3.5-1.5 4h12c-.7-.5-1.5-1.6-1.5-4A4.5 4.5 0 0 0 8 2z" />
      <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
function IconClipboard({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M5 8h6M5 5h6M5 11h4" />
    </svg>
  );
}
function IconArrowRight({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 6h8M6 2l4 4-4 4" />
    </svg>
  );
}
function IconPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}
function IconMenu({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}
function IconClose({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}
function IconPin({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M6 1a3 3 0 0 1 3 3c0 2-3 7-3 7S3 6 3 4a3 3 0 0 1 3-3z" />
      <circle cx="6" cy="4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTag({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 1h4l6 6-4 4-6-6V1z" />
      <circle cx="3.5" cy="3.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ─────────────── BADGE ─────────────── */
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
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 10,
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: 20,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {status}
    </span>
  );
}

/* ─────────────── EMPTY STATE ─────────────── */
function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <p style={{ color: '#bbb', fontSize: 13, fontWeight: 300 }}>{text}</p>
    </div>
  );
}

/* ─────────────── STAT CARD ─────────────── */
function StatCard({ label, value, iconBg, Icon }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.09)',
      borderRadius: 14,
      padding: '1.3rem 1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 9,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#0d0d0d', letterSpacing: '-1px', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4, fontWeight: 400 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── SECTION ─────────────── */
function Section({ title, link, Icon, children }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.09)',
      borderRadius: 14,
      padding: '1.4rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.9rem',
        borderBottom: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#888', display: 'flex' }}><Icon size={15} /></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0d0d0d' }}>{title}</span>
        </div>
        <Link href={link} style={{
          fontSize: 12, color: '#888', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          View all <IconArrowRight size={11} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────── ITEM ROW ─────────────── */
function ItemRow({ item }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.7rem 0.85rem',
      background: '#f9f9f8',
      borderRadius: 9,
      border: '0.5px solid rgba(0,0,0,0.06)',
      gap: 8,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#0d0d0d',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </span>
        <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconPin size={11} />
          {item.location}
          <span style={{ color: '#ddd' }}>·</span>
          <IconTag size={11} />
          {item.category}
        </span>
      </div>
      <Badge status={item.status} />
    </div>
  );
}

/* ─────────────── NOTIFICATION ROW ─────────────── */
function NotifRow({ n }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '0.7rem 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.06)',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 7, height: 7,
        borderRadius: '50%',
        marginTop: 5,
        flexShrink: 0,
        background: n.is_read ? '#ddd' : '#0d0d0d',
      }} />
      <div>
        <div style={{ fontSize: 13, color: '#0d0d0d', lineHeight: 1.5 }}>{n.message}</div>
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
          {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── CLAIM ROW ─────────────── */
function ClaimRow({ claim }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.65rem 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.06)',
      gap: 8,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0d0d0d' }}>{claim.lost_item_name}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Found: {claim.found_item_name}</div>
      </div>
      <Badge status={claim.status} />
    </div>
  );
}

/* ─────────────── NAVBAR ─────────────── */
function Navbar({ user, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';

  return (
    <>
      <nav className="nav-root">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <StarLogo style={{ width: 20, height: 20, color: '#0d0d0d' }} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: '#0d0d0d' }}>
            FIND<span style={{ fontWeight: 300 }}>BASE</span>
          </span>
        </div>

        <div className="nav-desktop-links">
          <Link href="/dashboard" className="active">Dashboard</Link>
          <Link href="/items/lost">Lost Items</Link>
          <Link href="/items/found">Found Items</Link>
          <Link href="/claims">Claims</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 36, height: 36,
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#555',
            }}>
              <IconBell size={16} />
            </div>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: '#e53e3e', border: '1.5px solid #fff',
              }} />
            )}
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#0d0d0d', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer',
          }}>
            {initials}
          </div>
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <Link href="/dashboard"      onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link href="/items/lost"     onClick={() => setMenuOpen(false)}>Lost Items</Link>
        <Link href="/items/found"    onClick={() => setMenuOpen(false)}>Found Items</Link>
        <Link href="/claims"         onClick={() => setMenuOpen(false)}>Claims</Link>
        <Link href="/notifications"  onClick={() => setMenuOpen(false)}>Notifications</Link>
      </div>
    </>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function DashboardPage() {
  const { authFetch, user } = useAuth();
  const [lostItems, setLostItems]       = useState([]);
  const [foundItems, setFoundItems]     = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [claims, setClaims]             = useState([]);
  const [loading, setLoading]           = useState(true);

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

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar user={user} unreadCount={unreadCount} />

      <div className="db-page">
        <div className="db-inner">

          {/* Header */}
          <div className="page-header">
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                color: '#aaa', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Dashboard
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 700,
                letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15,
              }}>
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
                Here is your Lost &amp; Found activity overview
              </p>
            </div>
            <div className="header-actions">
              <Link href="/items/found/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent', color: '#0d0d0d',
                border: '0.5px solid rgba(0,0,0,0.2)',
                padding: '0.55rem 1.1rem', borderRadius: 8,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>
                <IconPlus size={13} /> Report Found
              </Link>
              <Link href="/items/lost/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#0d0d0d', color: '#fff', border: 'none',
                padding: '0.55rem 1.1rem', borderRadius: 8,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>
                <IconPlus size={13} /> Report Lost
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard label="Lost Items"           value={lostItems.length}  iconBg="#fdecea" Icon={IconBox} />
            <StatCard label="Found Items"          value={foundItems.length} iconBg="#e6f4ea" Icon={IconCheck} />
            <StatCard label="Unread Notifications" value={unreadCount}       iconBg="#fef9e6" Icon={IconBell} />
            <StatCard label="Active Claims"        value={activeClaims}      iconBg="#e8f0fe" Icon={IconClipboard} />
          </div>

          {/* Sections */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb', fontSize: 14 }}>
              Loading your data...
            </div>
          ) : (
            <div className="sections-grid">
              <Section title="My Lost Items"  link="/items/lost"    Icon={IconBox}>
                {lostItems.length === 0
                  ? <EmptyState text="No lost items reported yet" />
                  : lostItems.slice(0, 3).map(item => <ItemRow key={item.id} item={item} />)
                }
              </Section>

              <Section title="My Found Items" link="/items/found"   Icon={IconCheck}>
                {foundItems.length === 0
                  ? <EmptyState text="No found items reported yet" />
                  : foundItems.slice(0, 3).map(item => <ItemRow key={item.id} item={item} />)
                }
              </Section>

              <Section title="Notifications"  link="/notifications" Icon={IconBell}>
                {notifications.length === 0
                  ? <EmptyState text="No notifications yet" />
                  : notifications.slice(0, 4).map(n => <NotifRow key={n.id} n={n} />)
                }
              </Section>

              <Section title="My Claims"      link="/claims"        Icon={IconClipboard}>
                {claims.length === 0
                  ? <EmptyState text="No claims yet" />
                  : claims.slice(0, 3).map(claim => <ClaimRow key={claim.id} claim={claim} />)
                }
              </Section>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}