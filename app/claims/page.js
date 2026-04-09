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

    @media (max-width: 640px) {
      .page-inner {
        padding: 1.5rem 1rem;
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
            <h1 style={{
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
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '1.5rem',
      border: '0.5px solid rgba(0,0,0,0.08)',
    }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem'
      }}>
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
        <StatusBadge status={claim.status} />
      </div>

      {/* Meta Info */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)'
      }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          background: '#fdecea',
          border: '0.5px solid #f5c6cb',
          borderRadius: 8,
          padding: '1rem 1.15rem'
        }}>
          <span style={{ fontSize: '1.3rem' }}>🔒</span>
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
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          
          {/* Open chat */}
          {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
            <Link 
              href={`/chat/${claim.chat_id}`} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#e8f0fe',
                color: '#1565c0',
                border: '0.5px solid #bbdefb',
                padding: '0.45rem 0.95rem',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              💬 Open Chat
            </Link>
          )}

          {/* Claimant: not my item */}
          {user?.id === claim.claimant_id && claim.status === 'verifying' && (
            <button 
              onClick={() => onUpdateStatus(claim.id, 'rejected')} 
              style={{
                background: 'transparent',
                color: '#d32f2f',
                border: '0.5px solid rgba(211, 47, 47, 0.3)',
                padding: '0.45rem 0.95rem',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ❌ Not My Item
            </button>
          )}

          {/* Report to admin */}
          {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
            <Link 
              href={`/admin/report?claim_id=${claim.id}`} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                color: '#e65100',
                border: '0.5px solid rgba(230, 81, 0, 0.3)',
                padding: '0.45rem 0.95rem',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🚩 Report Issue
            </Link>
          )}

          {/* Confirmed message */}
          {claim.status === 'confirmed' && (
            <span style={{
              display: 'inline-block',
              background: '#e6f4ea',
              color: '#1e7e34',
              padding: '0.45rem 0.95rem',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              border: '0.5px solid #b7e1cd'
            }}>
              ✓ Item successfully returned
            </span>
          )}

          {/* Rejected message */}
          {claim.status === 'rejected' && (
            <span style={{
              display: 'inline-block',
              background: '#fdecea',
              color: '#d32f2f',
              padding: '0.45rem 0.95rem',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
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
      whiteSpace: 'nowrap'
    }}>
      {c.label}
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
          padding: '0.55rem 1.1rem',
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