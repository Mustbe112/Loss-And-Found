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
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .claims-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ── Claim Card ── */
    .claim-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      border: 0.5px solid rgba(0,0,0,0.08);
    }

    .claim-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 0.75rem;
    }

    .claim-meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 0.5px solid rgba(0,0,0,0.06);
    }

    .claim-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.45rem 0.95rem;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .page-inner {
        padding: 1.25rem 0.875rem;
      }

      .page-header {
        margin-bottom: 1.5rem;
      }

      .claim-card {
        padding: 1rem;
        border-radius: 10px;
      }

      /* Stack title + badge vertically on very small screens */
      .claim-card-header {
        flex-direction: column-reverse;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      /* Badge aligns left when stacked */
      .claim-card-header .status-badge-wrap {
        align-self: flex-start;
      }

      /* Meta info: 2-column grid on mobile */
      .claim-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem 1rem;
        margin-bottom: 1rem;
        padding-bottom: 0.875rem;
      }

      /* Action buttons: full width on mobile */
      .claim-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
        padding: 0.6rem 1rem;
      }

      .action-btn-button {
        width: 100%;
        justify-content: center;
        padding: 0.6rem 1rem;
      }

      /* Status pill chips (confirmed/rejected) also full-width */
      .status-chip {
        display: block;
        width: 100%;
        text-align: center;
      }

      /* Chat ban notice stacks nicely already, just reduce padding */
      .chat-ban-notice {
        padding: 0.875rem 1rem;
      }

      /* h1 slightly smaller */
      .page-title {
        font-size: 1.45rem !important;
      }
    }

    /* ── Tiny phones ── */
    @media (max-width: 380px) {
      .claim-meta {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

export default function ClaimsPage() {
  const { authFetch, user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClaims(); }, []);

  const fetchClaims = async () => {
    const res = await authFetch('/api/claims');
    const data = await res.json();
    setClaims(data.claims || []);
    setLoading(false);
  };

  const updateStatus = async (claimId, status) => {
    await authFetch(`/api/claims/${claimId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    fetchClaims();
  };

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />
      
      <div className="page">
        <div className="page-inner">
          
          {/* Header */}
          <div className="page-header">
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              color: '#aaa', textTransform: 'uppercase', marginBottom: 6,
            }}>
              Claims
            </div>
            <h1 className="page-title" style={{
              fontSize: '1.75rem', fontWeight: 700,
              letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15,
            }}>
              My Claims
            </h1>
            <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
              Track your item claim requests
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb', fontSize: 14 }}>
              Loading your claims...
            </div>
          ) : claims.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="claims-list">
              {claims.map(claim => (
                <ClaimCard 
                  key={claim.id} 
                  claim={claim} 
                  user={user}
                  onUpdateStatus={updateStatus}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

function ClaimCard({ claim, user, onUpdateStatus }) {
  return (
    <div className="claim-card">
      
      {/* Header */}
      <div className="claim-card-header">
        <div>
          <h3 style={{ 
            color: '#0d0d0d', 
            fontWeight: 600, 
            fontSize: 15,
            letterSpacing: '-0.2px',
            marginBottom: 4
          }}>
            {claim.lost_item_name}
          </h3>
          <p style={{ fontSize: 13, color: '#999' }}>
            Found item: {claim.found_item_name}
          </p>
        </div>
        <div className="status-badge-wrap">
          <StatusBadge status={claim.status} />
        </div>
      </div>

      {/* Meta Info */}
      <div className="claim-meta">
        <span style={{ fontSize: 13, color: '#888' }}>
          <span style={{ color: '#aaa' }}>Claimant:</span> {claim.claimant_name}
        </span>
        <span style={{ fontSize: 13, color: '#888' }}>
          <span style={{ color: '#aaa' }}>Finder:</span> {claim.respondent_name}
        </span>
        <span style={{ fontSize: 13, color: '#888' }}>
          <span style={{ color: '#aaa' }}>Match:</span> {claim.score}%
        </span>
      </div>

      {/* Chat Ban Notice */}
      {claim.status === 'chat_ban' ? (
        <div className="chat-ban-notice" style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          background: '#fdecea',
          border: '0.5px solid #f5c6cb',
          borderRadius: 8,
          padding: '1rem 1.15rem'
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔒</span>
          <div>
            <p style={{ 
              color: '#721c24', 
              fontWeight: 600, 
              fontSize: 13, 
              marginBottom: 4 
            }}>
              Chat Permanently Closed
            </p>
            <p style={{ 
              color: '#856404', 
              fontSize: 13, 
              lineHeight: 1.5 
            }}>
              You exceeded the maximum verification attempts. Please{' '}
              <Link 
                href={`/admin/report?claim_id=${claim.id}`} 
                style={{ 
                  color: '#d32f2f', 
                  fontWeight: 600, 
                  textDecoration: 'underline' 
                }}
              >
                contact the admin office
              </Link>
              {' '}for assistance.
            </p>
          </div>
        </div>
      ) : (
        <div className="claim-actions">
          
          {/* Open chat */}
          {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
            <Link 
              href={`/chat/${claim.chat_id}`} 
              className="action-btn"
              style={{
                background: '#e8f0fe',
                color: '#1565c0',
                border: '0.5px solid #bbdefb',
              }}
            >
              💬 Open Chat
            </Link>
          )}

          {/* Claimant: not my item */}
          {user?.id === claim.claimant_id && claim.status === 'verifying' && (
            <button 
              onClick={() => onUpdateStatus(claim.id, 'rejected')} 
              className="action-btn action-btn-button"
              style={{
                background: 'transparent',
                color: '#d32f2f',
                border: '0.5px solid rgba(211, 47, 47, 0.3)',
                cursor: 'pointer',
              }}
            >
              ❌ Not My Item
            </button>
          )}

          {/* Report to admin */}
          {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
            <Link 
              href={`/admin/report?claim_id=${claim.id}`} 
              className="action-btn"
              style={{
                background: 'transparent',
                color: '#e65100',
                border: '0.5px solid rgba(230, 81, 0, 0.3)',
              }}
            >
              🚩 Report Issue
            </Link>
          )}

          {/* Confirmed message */}
          {claim.status === 'confirmed' && (
            <span className="action-btn status-chip" style={{
              background: '#e6f4ea',
              color: '#1e7e34',
              border: '0.5px solid #b7e1cd'
            }}>
              ✓ Item successfully returned
            </span>
          )}

          {/* Rejected message */}
          {claim.status === 'rejected' && (
            <span className="action-btn status-chip" style={{
              background: '#fdecea',
              color: '#d32f2f',
              border: '0.5px solid #f5c6cb'
            }}>
              ✗ Claim rejected
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending:   { bg: '#fff3e0', color: '#e65100', border: '#ffe0b2', label: 'pending' },
    verifying: { bg: '#e1f5fe', color: '#01579b', border: '#b3e5fc', label: 'verifying' },
    confirmed: { bg: '#e6f4ea', color: '#1e7e34', border: '#b7e1cd', label: 'confirmed' },
    rejected:  { bg: '#fdecea', color: '#d32f2f', border: '#f5c6cb', label: 'rejected' },
    disputed:  { bg: '#fdecea', color: '#c62828', border: '#f5c6cb', label: 'disputed' },
    chat_ban:  { bg: '#f3e5f5', color: '#6a1b9a', border: '#e1bee7', label: '🔒 chat banned' },
  };
  
  const c = config[status] || { bg: '#f5f4f0', color: '#666', border: '#ddd', label: status };
  
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      border: `0.5px solid ${c.border}`,
      padding: '0.3rem 0.75rem',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {c.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1.5rem',
      background: '#fff',
      borderRadius: 12,
      border: '0.5px solid rgba(0,0,0,0.08)'
    }}>
      <div style={{ 
        fontSize: '3rem', 
        marginBottom: '1rem',
        opacity: 0.4
      }}>
        📋
      </div>
      <p style={{ 
        color: '#aaa', 
        marginBottom: '1.5rem',
        fontSize: 14
      }}>
        No claims yet
      </p>
      <Link 
        href="/notifications" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#0d0d0d',
          color: '#fff',
          padding: '0.6rem 1.25rem',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 500
        }}
      >
        View Matches
      </Link>
    </div>
  );
}