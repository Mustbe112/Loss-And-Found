'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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
      <Navbar />
      <div style={pageStyle}>
        <h1 style={titleStyle}>📋 My Claims</h1>
        <p style={subtitleStyle}>Track your item claim requests</p>

        {loading ? (
          <p style={mutedStyle}>Loading...</p>
        ) : claims.length === 0 ? (
          <div style={emptyStyle}>
            <p style={{ fontSize: '3rem' }}>📋</p>
            <p style={{ color: '#aaa', margin: '1rem 0' }}>No claims yet</p>
            <Link href="/notifications" style={btnPrimary}>View Matches</Link>
          </div>
        ) : (
          <div style={listStyle}>
            {claims.map(claim => (
              <div key={claim.id} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div>
                    <h3 style={itemNameStyle}>{claim.lost_item_name}</h3>
                    <p style={mutedStyle}>Found item: {claim.found_item_name}</p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div style={metaRowStyle}>
                  <span style={metaStyle}>👤 Claimant: {claim.claimant_name}</span>
                  <span style={metaStyle}>🔍 Finder: {claim.respondent_name}</span>
                  <span style={metaStyle}>🎯 Match: {claim.score}%</span>
                </div>

                {/* ── Chat Ban ── */}
                {claim.status === 'chat_ban' ? (
                  <div style={banBoxStyle}>
                    <span style={{ fontSize: '1.3rem' }}>🔒</span>
                    <div>
                      <p style={banTitleStyle}>Chat Permanently Closed</p>
                      <p style={banDescStyle}>
                        You exceeded the maximum verification attempts. Please{' '}
                        <Link href={`/admin/report?claim_id=${claim.id}`} style={adminLinkStyle}>
                          contact the admin office
                        </Link>
                        {' '}for assistance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={actionsStyle}>
                    {/* Open chat */}
                    {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
                      <Link href={`/chat/${claim.chat_id}`} style={btnChat}>
                        💬 Open Chat
                      </Link>
                    )}

                    {/* Claimant: not my item — stays here on claims page */}
                    {user?.id === claim.claimant_id && claim.status === 'verifying' && (
                      <button onClick={() => updateStatus(claim.id, 'rejected')} style={btnReject}>
                        ❌ Not My Item
                      </button>
                    )}

                    {/* Report to admin */}
                    {claim.status !== 'confirmed' && claim.status !== 'rejected' && (
                      <Link href={`/admin/report?claim_id=${claim.id}`} style={btnReport}>
                        🚩 Report Issue
                      </Link>
                    )}

                    {/* Confirmed message */}
                    {claim.status === 'confirmed' && (
                      <span style={confirmedMsgStyle}>✅ Item successfully returned</span>
                    )}

                    {/* Rejected message */}
                    {claim.status === 'rejected' && (
                      <span style={rejectedMsgStyle}>❌ Claim rejected</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending:   '#ff9800',
    verifying: '#2196f3',
    confirmed: '#4caf50',
    rejected:  '#e94560',
    disputed:  '#f44336',
    chat_ban:  '#9c27b0',
  };
  const labels = {
    pending:   'pending',
    verifying: 'verifying',
    confirmed: 'confirmed',
    rejected:  'rejected',
    disputed:  'disputed',
    chat_ban:  '🔒 chat banned',
  };
  return (
    <span style={{
      background: `${colors[status] || '#666'}20`,
      color: colors[status] || '#666',
      border: `1px solid ${colors[status] || '#666'}`,
      padding: '0.3rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
    }}>
      {labels[status] || status}
    </span>
  );
}

const pageStyle       = { maxWidth: '900px', margin: '0 auto', padding: '2rem' };
const titleStyle      = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' };
const subtitleStyle   = { color: '#aaa', marginBottom: '2rem' };
const mutedStyle      = { color: '#666', fontSize: '0.85rem' };
const listStyle       = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const cardStyle       = { background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: '1px solid #333' };
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' };
const itemNameStyle   = { color: '#fff', fontWeight: '600', fontSize: '1.1rem' };
const metaRowStyle    = { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' };
const metaStyle       = { color: '#aaa', fontSize: '0.85rem' };
const actionsStyle    = { display: 'flex', gap: '0.8rem', flexWrap: 'wrap' };
const banBoxStyle     = { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#1a0a2e', border: '1px solid #9c27b050', borderRadius: '8px', padding: '0.9rem 1.1rem' };
const banTitleStyle   = { color: '#ce93d8', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 0.25rem' };
const banDescStyle    = { color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.6' };
const adminLinkStyle  = { color: '#e94560', fontWeight: '600', textDecoration: 'underline' };
const btnChat         = { background: '#2196f320', color: '#2196f3', border: '1px solid #2196f3', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none' };
const btnReject       = { background: '#e9456020', color: '#e94560', border: '1px solid #e94560', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' };
const btnReport       = { background: '#ff980020', color: '#ff9800', border: '1px solid #ff9800', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none' };
const btnPrimary      = { background: '#e94560', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' };
const emptyStyle      = { textAlign: 'center', padding: '4rem 2rem', background: '#1a1a2e', borderRadius: '12px', border: '1px solid #333' };
const confirmedMsgStyle = { color: '#4caf50', fontSize: '0.85rem', fontWeight: '500' };
const rejectedMsgStyle  = { color: '#e94560', fontSize: '0.85rem', fontWeight: '500' };