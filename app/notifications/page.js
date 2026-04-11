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

    .np-page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .np-inner {
      max-width: 1160px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .np-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 2rem; gap: 1rem;
    }

    .np-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .np-match-items {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 0.6rem;
      align-items: center;
      margin: 0.75rem 0;
    }

    @media (max-width: 900px) { .np-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) {
      .np-inner { padding: 1.5rem 1rem; }
      .np-header { flex-direction: column; align-items: flex-start; }
      .np-match-items { grid-template-columns: 1fr; }
      .np-arrow { display: none; }
    }
  `}</style>
);

/* ─────────────── ICONS ─────────────── */
function IconBell({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 2a4.5 4.5 0 0 0-4.5 4.5c0 2.4-.8 3.5-1.5 4h12c-.7-.5-1.5-1.6-1.5-4A4.5 4.5 0 0 0 8 2z" />
      <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
function IconBot({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="5" width="12" height="9" rx="2" />
      <path d="M8 2v3M5 9h.01M11 9h.01M5.5 12h5" />
    </svg>
  );
}
function IconArrowRight({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 6h8M6 2l4 4-4 4" />
    </svg>
  );
}
function IconBox({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="4" width="12" height="10" rx="1.5" />
      <path d="M5 4V3a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
function IconCheck({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 8l4 4 6-7" />
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
  High:      { bg: '#e6f4ea', color: '#1a6b3c' },
  Medium:    { bg: '#e8f0fe', color: '#1a47a0' },
  Low:       { bg: '#fef9e6', color: '#92600a' },
};

function Badge({ label, status }) {
  const key = status || label;
  const s = badgeMap[key] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 600,
      padding: '3px 10px', borderRadius: 20,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label || status}
    </span>
  );
}

/* ─────────────── SECTION CARD ─────────────── */
function Section({ title, Icon, children }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.09)',
      borderRadius: 14,
      padding: '1.4rem',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1rem',
        paddingBottom: '0.9rem',
        borderBottom: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#888', display: 'flex' }}><Icon size={15} /></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0d0d0d' }}>{title}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {children}
      </div>
    </div>
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

/* ─────────────── NOTIFICATION ROW ─────────────── */
function NotifRow({ n }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '0.7rem 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.06)',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', marginTop: 5,
        flexShrink: 0, background: n.is_read ? '#ddd' : '#0d0d0d',
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

/* ─────────────── SCORE COLORS ─────────────── */
function scoreColor(score) {
  if (score >= 80) return '#1a6b3c';
  if (score >= 50) return '#92600a';
  return '#b91c1c';
}
function scoreBg(score) {
  if (score >= 80) return '#e6f4ea';
  if (score >= 50) return '#fef9e6';
  return '#fdecea';
}

/* ─────────────── MATCH CARD ─────────────── */
function MatchCard({ match, userId }) {
  // Determine the claim action state:
  // - claim_status = null/undefined → no claim yet → show "Claim this item"
  // - claim_status = 'pending' | 'verifying' → claim in progress → show "View Claim"
  // - claim_status = 'confirmed' → resolved → show "Resolved" chip
  // - claim_status = 'rejected' → rejected → show "Rejected" chip (button gone)
  const claimStatus = match.claim_status;
  const isOwner = match.lost_user_id === userId;

  const renderClaimArea = () => {
    if (!isOwner) return null;

    if (!claimStatus || claimStatus === null) {
      // No claim yet — go to confirmation page
      return (
        <Link
          href={`/claims/new?match_id=${match.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0d0d0d', color: '#fff',
            padding: '0.5rem 1rem', borderRadius: 8,
            fontSize: 12, fontWeight: 500, textDecoration: 'none',
          }}
        >
          Claim this item <IconArrowRight size={11} />
        </Link>
      );
    }

    if (claimStatus === 'pending' || claimStatus === 'verifying') {
      // Claim submitted — link to claim detail to verify
      return (
        <Link
          href={`/claims`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#e8f0fe', color: '#1565c0',
            border: '0.5px solid #bbdefb',
            padding: '0.5rem 1rem', borderRadius: 8,
            fontSize: 12, fontWeight: 500, textDecoration: 'none',
          }}
        >
          View Claim <IconArrowRight size={11} />
        </Link>
      );
    }

    if (claimStatus === 'confirmed') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#e6f4ea', color: '#1a6b3c',
          border: '0.5px solid #b7e1cd',
          padding: '0.5rem 1rem', borderRadius: 8,
          fontSize: 12, fontWeight: 500,
        }}>
          ✓ Item returned
        </span>
      );
    }

    if (claimStatus === 'rejected') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fdecea', color: '#b91c1c',
          border: '0.5px solid #f5c6cb',
          padding: '0.5rem 1rem', borderRadius: 8,
          fontSize: 12, fontWeight: 500,
        }}>
          ✗ Claim rejected — searching for new matches
        </span>
      );
    }

    return null;
  };

  return (
    <div style={{
      background: '#f9f9f8', border: '0.5px solid rgba(0,0,0,0.07)',
      borderRadius: 10, padding: '1rem 1.1rem',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <span style={{
          background: scoreBg(match.score), color: scoreColor(match.score),
          fontSize: 12, fontWeight: 700, padding: '3px 10px',
          borderRadius: 20, letterSpacing: '0.04em',
        }}>
          {match.score}% match
        </span>
        <Badge label={`${match.confidence} Confidence`} status={match.confidence} />
        <Badge status={match.claim_status || match.status} />
      </div>

      {/* Items comparison */}
      <div className="np-match-items">
        <div style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
          borderRadius: 8, padding: '0.7rem 0.9rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ color: '#aaa' }}><IconBox size={11} /></span>
            <span style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lost item</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0d0d0d' }}>{match.lost_item_name}</div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{match.lost_category}</div>
        </div>

        <div className="np-arrow" style={{ textAlign: 'center', color: '#ccc', fontSize: 16 }}>↔</div>

        <div style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
          borderRadius: 8, padding: '0.7rem 0.9rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ color: '#aaa' }}><IconCheck size={11} /></span>
            <span style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Found item</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0d0d0d' }}>{match.found_item_name}</div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{match.found_category}</div>
        </div>
      </div>

      {/* Explanation */}
      {match.explanation && (
        <div style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)',
          borderRadius: 8, padding: '0.65rem 0.9rem',
          fontSize: 12, color: '#888', lineHeight: 1.55,
          fontStyle: 'italic', fontWeight: 300, marginBottom: '0.75rem',
        }}>
          {match.explanation}
        </div>
      )}

      {/* Claim area — driven by claim_status */}
      {renderClaimArea()}
    </div>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function NotificationsPage() {
  const { authFetch, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [matches, setMatches]             = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [notifRes, matchRes] = await Promise.all([
      authFetch('/api/notifications'),
      authFetch('/api/matches'),
    ]);
    const [notifData, matchData] = await Promise.all([
      notifRes.json(),
      matchRes.json(),
    ]);
    setNotifications(notifData.notifications || []);
    setMatches(matchData.matches || []);
    setLoading(false);
    await authFetch('/api/notifications', { method: 'PATCH' });
  };



  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />

      <div className="np-page">
        <div className="np-inner">

          {/* Header */}
          <div className="np-header">
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                color: '#aaa', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Notifications
              </div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 700,
                letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15,
              }}>
                Matches &amp; alerts
              </h1>
              <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
                {unread > 0
                  ? `You have ${unread} unread notification${unread !== 1 ? 's' : ''}`
                  : 'All caught up — no unread notifications'}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb', fontSize: 14 }}>
              Loading…
            </div>
          ) : (
            <div className="np-grid">

              {/* AI Matches */}
              <div style={{ gridColumn: matches.length > 0 ? '1 / -1' : undefined }}>
                <Section title="AI Match Results" Icon={IconBot}>
                  {matches.length === 0 ? (
                    <EmptyState text="No matches found yet. Submit a lost or found item to trigger AI matching." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {matches.map(match => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          userId={user?.id}
                        />
                      ))}
                    </div>
                  )}
                </Section>
              </div>

              {/* Notifications */}
              <div style={{ gridColumn: matches.length > 0 ? '1 / -1' : undefined }}>
                <Section title="System Notifications" Icon={IconBell}>
                  {notifications.length === 0 ? (
                    <EmptyState text="No notifications yet" />
                  ) : (
                    notifications.map(n => <NotifRow key={n.id} n={n} />)
                  )}
                </Section>
              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}