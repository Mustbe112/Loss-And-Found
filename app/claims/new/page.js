'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ClaimForm() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const match_id = searchParams.get('match_id');

  const [loading, setLoading] = useState(false);
  const [fetchingMatch, setFetchingMatch] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Fetch match + found item details on load
  useEffect(() => {
    if (!match_id) { setFetchingMatch(false); return; }
    const load = async () => {
      try {
        const res = await authFetch(`/api/matches/${match_id}`);
        const data = await res.json();
        setMatchData(data.match || null);
      } catch {
        setError('Failed to load match details.');
      } finally {
        setFetchingMatch(false);
      }
    };
    load();
  }, [match_id]);

  const handleClaim = async () => {
    if (!match_id) return setError('No match ID provided');
    if (!agreed) return setError('Please agree to the terms before claiming.');
    setLoading(true);
    setError('');

    const res = await authFetch('/api/claims', {
      method: 'POST',
      body: JSON.stringify({ match_id }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);

    const chatRes = await authFetch('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ claim_id: data.claim.id }),
    });

    const chatData = await chatRes.json();
    if (chatRes.ok) {
      router.push(`/chat/${chatData.chat.id}`);
    } else {
      router.push('/claims');
    }
  };

  if (fetchingMatch) {
    return (
      <div style={loadingWrapStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: '#aaa', marginTop: '1rem' }}>Loading item details...</p>
      </div>
    );
  }

  const found = matchData?.found_item;
  const lost = matchData?.lost_item;

  return (
    <div style={outerStyle}>

      {/* Page Header */}
      <div>
        <h1 style={pageTitleStyle}>📋 Claim This Item</h1>
        <p style={pageSubtitleStyle}>
          Review the found item details below before submitting your claim.
        </p>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* ── Found Item Details ── */}
      {found ? (
        <div style={sectionCardStyle}>
          <SectionLabel color="#4caf50" text="Found Item Details" />

          {/* Photo */}
          {found.image_url && (
            <div style={photoWrapStyle}>
              <img
                src={found.image_url}
                alt={found.name}
                style={photoStyle}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <h2 style={foundNameStyle}>{found.name}</h2>

          <div style={infoGridStyle}>
            <InfoTile icon="📂" label="Category" value={found.category} />
            <InfoTile icon="📍" label="Where Found" value={found.location} />
            <InfoTile
              icon="📅"
              label="Date Found"
              value={found.date
                ? new Date(found.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : null}
            />
            <InfoTile icon="👤" label="Found By" value={matchData?.found_user_name || 'Anonymous'} />
          </div>

          {found.description && (
            <div style={descBoxStyle}>
              <p style={descLabelStyle}>📝 Description</p>
              <p style={descTextStyle}>{found.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div style={sectionCardStyle}>
          <p style={{ color: '#888', textAlign: 'center', padding: '1rem 0' }}>
            Could not load found item details. You may still proceed with your claim.
          </p>
        </div>
      )}

      {/* ── Your Lost Item (reference) ── */}
      {lost && (
        <div style={{ ...sectionCardStyle, borderColor: '#e9456030' }}>
          <SectionLabel color="#e94560" text="Your Lost Item" />
          <div style={infoGridStyle}>
            <InfoTile icon="📦" label="Item Name" value={lost.name} />
            <InfoTile icon="📂" label="Category" value={lost.category} />
            <InfoTile icon="📍" label="Lost At" value={lost.location} />
            <InfoTile
              icon="🎯"
              label="AI Match Score"
              value={matchData?.score != null ? `${matchData.score}%` : null}
              valueColor={matchData?.score >= 80 ? '#4caf50' : matchData?.score >= 50 ? '#ff9800' : '#e94560'}
            />
          </div>
        </div>
      )}

      {/* ── What Happens Next ── */}
      <div style={sectionCardStyle}>
        <SectionLabel color="#2196f3" text="What Happens Next" />
        <div style={stepsStyle}>
          {[
            { n: '1', icon: '💬', title: 'Private Chat Opens', desc: 'A secure chat is created between you and the finder.' },
            { n: '2', icon: '❓', title: 'Verification Question', desc: 'The finder will ask you to prove ownership of the item.' },
            { n: '3', icon: '✅', title: 'Confirm Ownership', desc: 'Answer correctly to proceed to item pickup.' },
            { n: '4', icon: '🤝', title: 'Arrange Pickup', desc: 'Coordinate a safe handover location in the chat.' },
            { n: '5', icon: '🎉', title: 'Mark as Received', desc: 'Confirm once you have your item back to close the case.' },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} style={stepRowStyle}>
              <div style={stepNumStyle}>{n}</div>
              <div style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={stepTitleStyle}>{title}</p>
                <p style={stepDescStyle}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Agreement ── */}
      <div style={agreementBoxStyle}>
        <label style={checkLabelStyle}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#e94560' }}
          />
          <span style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>
            I confirm this is genuinely my lost item and understand that submitting a false claim
            violates the platform's terms and may result in account suspension.
          </span>
        </label>
      </div>

      {/* ── Buttons ── */}
      <div style={btnRowStyle}>
        <button onClick={() => router.back()} style={btnSecondary}>
          ← Cancel
        </button>
        <button
          onClick={handleClaim}
          style={{ ...btnPrimary, opacity: agreed ? 1 : 0.45, cursor: agreed ? 'pointer' : 'not-allowed' }}
          disabled={loading || !agreed}
        >
          {loading ? 'Processing...' : '✅ Confirm Claim'}
        </button>
      </div>

    </div>
  );
}

function SectionLabel({ color, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777' }}>
        {text}
      </span>
    </div>
  );
}

function InfoTile({ icon, label, value, valueColor }) {
  return (
    <div style={infoTileStyle}>
      <p style={tileLabelStyle}>{icon} {label}</p>
      <p style={{ color: valueColor || '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>
        {value || '—'}
      </p>
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <Suspense fallback={
          <div style={loadingWrapStyle}>
            <div style={spinnerStyle} />
            <p style={{ color: '#aaa', marginTop: '1rem' }}>Loading...</p>
          </div>
        }>
          <ClaimForm />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

/* ── Styles ── */
const pageStyle = { maxWidth: '700px', margin: '0 auto', padding: '2rem 2rem 4rem' };
const outerStyle = { display: 'flex', flexDirection: 'column', gap: '1.2rem' };

const pageTitleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.4rem' };
const pageSubtitleStyle = { color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 };

const sectionCardStyle = { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2a3e' };

const photoWrapStyle = { width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.2rem', background: '#0f0f1a', maxHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const photoStyle = { width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' };

const foundNameStyle = { color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' };

const infoGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1rem' };
const infoTileStyle = { background: '#0f0f1a', borderRadius: '8px', padding: '0.8rem 1rem', border: '1px solid #1e1e30' };
const tileLabelStyle = { color: '#666', fontSize: '0.72rem', marginBottom: '0.3rem', margin: '0 0 0.3rem' };

const descBoxStyle = { background: '#0f0f1a', borderRadius: '8px', padding: '1rem', border: '1px solid #1e1e30' };
const descLabelStyle = { color: '#777', fontSize: '0.72rem', fontWeight: '600', marginBottom: '0.5rem' };
const descTextStyle = { color: '#ccc', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 };

const stepsStyle = { display: 'flex', flexDirection: 'column', gap: '0.7rem' };
const stepRowStyle = { display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.8rem', background: '#0f0f1a', borderRadius: '8px', border: '1px solid #1e1e30' };
const stepNumStyle = { minWidth: '22px', height: '22px', borderRadius: '50%', background: '#2196f315', border: '1px solid #2196f3', color: '#2196f3', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const stepTitleStyle = { color: '#fff', fontSize: '0.88rem', fontWeight: '600', margin: '0 0 0.2rem' };
const stepDescStyle = { color: '#777', fontSize: '0.8rem', margin: 0 };

const agreementBoxStyle = { background: '#1a1a2e', borderRadius: '10px', padding: '1.2rem', border: '1px solid #e9456035' };
const checkLabelStyle = { display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer' };

const errorStyle = { background: '#ff000015', border: '1px solid #ff000050', color: '#ff6b6b', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem' };

const btnRowStyle = { display: 'flex', gap: '1rem' };
const btnPrimary = { flex: 1, background: '#e94560', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', transition: 'opacity 0.2s' };
const btnSecondary = { flex: 1, background: 'transparent', color: '#aaa', border: '1px solid #333', padding: '0.9rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' };

const loadingWrapStyle = { textAlign: 'center', padding: '4rem 2rem' };
const spinnerStyle = { width: '36px', height: '36px', margin: '0 auto', border: '3px solid #2a2a3e', borderTop: '3px solid #e94560', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };