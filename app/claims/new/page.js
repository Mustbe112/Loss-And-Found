'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MessageSquare, HelpCircle, CheckCircle, Handshake, PartyPopper, ArrowLeft, Check } from 'lucide-react';

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .claim-page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .claim-page-inner {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    .section-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      border: 0.5px solid rgba(0,0,0,0.08);
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 1.1rem;
    }

    .section-label-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .section-label-text {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #aaa;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
    }

    .info-tile {
      background: #f5f4f0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      border: 0.5px solid rgba(0,0,0,0.06);
    }

    .info-tile-label {
      font-size: 11px;
      color: #aaa;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .info-tile-value {
      font-size: 13px;
      font-weight: 600;
      color: #0d0d0d;
    }

    .photo-wrap {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1.1rem;
      background: #f5f4f0;
      max-height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .photo-wrap img {
      width: 100%;
      max-height: 260px;
      object-fit: cover;
      display: block;
    }

    .desc-box {
      margin-top: 1rem;
      background: #f5f4f0;
      border-radius: 8px;
      padding: 0.9rem 1rem;
      border: 0.5px solid rgba(0,0,0,0.06);
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .step-row {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      background: #f5f4f0;
      border-radius: 8px;
      border: 0.5px solid rgba(0,0,0,0.06);
    }

    .step-num {
      min-width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #e8f0fe;
      border: 0.5px solid #bbdefb;
      color: #1565c0;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-icon {
      flex-shrink: 0;
      color: #888;
      margin-top: 1px;
    }

    .agreement-box {
      background: #fff;
      border-radius: 10px;
      padding: 1.1rem 1.25rem;
      border: 0.5px solid rgba(0,0,0,0.08);
    }

    .check-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
    }

    .custom-checkbox {
      width: 17px;
      height: 17px;
      border-radius: 4px;
      border: 1.5px solid #ccc;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .custom-checkbox.checked {
      background: #0d0d0d;
      border-color: #0d0d0d;
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
    }

    .btn-secondary {
      flex: 1;
      background: transparent;
      color: #555;
      border: 0.5px solid rgba(0,0,0,0.2);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s ease;
      font-family: inherit;
    }

    .btn-secondary:hover {
      background: rgba(0,0,0,0.04);
    }

    .btn-primary {
      flex: 1;
      background: #0d0d0d;
      color: #fff;
      border: none;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.2s;
      font-family: inherit;
    }

    .btn-primary:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .btn-primary:not(:disabled) {
      cursor: pointer;
    }

    .error-box {
      background: #fdecea;
      border: 0.5px solid #f5c6cb;
      color: #d32f2f;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 13px;
    }

    .loading-wrap {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto 1rem;
      border: 2px solid rgba(0,0,0,0.08);
      border-top: 2px solid #0d0d0d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .claim-page-inner {
        padding: 1.25rem 0.875rem 3rem;
      }
      .section-card {
        padding: 1rem;
      }
      .info-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }
      .btn-row {
        flex-direction: column;
      }
      .page-title {
        font-size: 1.45rem !important;
      }
    }

    @media (max-width: 380px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

function SectionLabel({ color, text }) {
  return (
    <div className="section-label">
      <span className="section-label-dot" style={{ background: color }} />
      <span className="section-label-text">{text}</span>
    </div>
  );
}

function InfoTile({ label, value, valueColor }) {
  return (
    <div className="info-tile">
      <p className="info-tile-label">{label}</p>
      <p className="info-tile-value" style={valueColor ? { color: valueColor } : {}}>
        {value || '—'}
      </p>
    </div>
  );
}

const STEPS = [
  { n: '1', Icon: MessageSquare, title: 'Private chat opens', desc: 'A secure chat is created between you and the finder.' },
  { n: '2', Icon: HelpCircle,   title: 'Verification question', desc: 'The finder will ask you to prove ownership of the item.' },
  { n: '3', Icon: CheckCircle,  title: 'Confirm ownership', desc: 'Answer correctly to proceed to item pickup.' },
  { n: '4', Icon: Handshake,    title: 'Arrange pickup', desc: 'Coordinate a safe handover location in the chat.' },
  { n: '5', Icon: PartyPopper,  title: 'Mark as received', desc: 'Confirm once you have your item back to close the case.' },
];

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
      <div className="loading-wrap">
        <div className="spinner" />
        <p style={{ color: '#bbb', fontSize: 14 }}>Loading item details...</p>
      </div>
    );
  }

  const found = matchData?.found_item;
  const lost  = matchData?.lost_item;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>
          Claims
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#0d0d0d', lineHeight: 1.15 }}>
          Claim this item
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 4, fontWeight: 300 }}>
          Review the found item details before submitting your claim.
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Found Item Details */}
      {found ? (
        <div className="section-card">
          <SectionLabel color="#1e7e34" text="Found item details" />

          {found.image_url && (
            <div className="photo-wrap">
              <img
                src={found.image_url}
                alt={found.name}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <h3 style={{ color: '#0d0d0d', fontWeight: 600, fontSize: 16, marginBottom: '0.85rem', letterSpacing: '-0.2px' }}>
            {found.name}
          </h3>

          <div className="info-grid" style={{ marginBottom: found.description ? '1rem' : 0 }}>
            <InfoTile label="Category"    value={found.category} />
            <InfoTile label="Where found" value={found.location} />
            <InfoTile
              label="Date found"
              value={found.date
                ? new Date(found.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : null}
            />
            <InfoTile label="Found by" value={matchData?.found_user_name || 'Anonymous'} />
          </div>

          {found.description && (
            <div className="desc-box">
              <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Description
              </p>
              <p style={{ color: '#555', fontSize: 13, lineHeight: 1.7 }}>{found.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="section-card">
          <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem 0', fontSize: 14 }}>
            Could not load found item details. You may still proceed with your claim.
          </p>
        </div>
      )}

      {/* Lost Item Reference */}
      {lost && (
        <div className="section-card" style={{ borderColor: 'rgba(211,47,47,0.18)' }}>
          <SectionLabel color="#d32f2f" text="Your lost item" />
          <div className="info-grid">
            <InfoTile label="Item name" value={lost.name} />
            <InfoTile label="Category"  value={lost.category} />
            <InfoTile label="Lost at"   value={lost.location} />
            <InfoTile
              label="AI match score"
              value={matchData?.score != null ? `${matchData.score}%` : null}
              valueColor={
                matchData?.score >= 80 ? '#1e7e34'
                : matchData?.score >= 50 ? '#e65100'
                : '#d32f2f'
              }
            />
          </div>
        </div>
      )}

      {/* What Happens Next */}
      <div className="section-card">
        <SectionLabel color="#1565c0" text="What happens next" />
        <div className="steps-list">
          {STEPS.map(({ n, Icon, title, desc }) => (
            <div key={n} className="step-row">
              <div className="step-num">{n}</div>
              <Icon size={15} className="step-icon" />
              <div>
                <p style={{ color: '#0d0d0d', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</p>
                <p style={{ color: '#999', fontSize: 12, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement */}
      <div className="agreement-box">
        <label className="check-label" onClick={() => setAgreed(v => !v)}>
          <div className={`custom-checkbox ${agreed ? 'checked' : ''}`}>
            {agreed && <Check size={11} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{ color: '#555', fontSize: 13, lineHeight: 1.6 }}>
            I confirm this is genuinely my lost item and understand that submitting a false claim
            violates the platform's terms and may result in account suspension.
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="btn-row">
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft size={14} /> Cancel
        </button>
        <button
          onClick={handleClaim}
          className="btn-primary"
          disabled={loading || !agreed}
        >
          <Check size={14} />
          {loading ? 'Processing...' : 'Confirm claim'}
        </button>
      </div>

    </div>
  );
}

export default function NewClaimPage() {
  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />
      <div className="claim-page">
        <div className="claim-page-inner">
          <Suspense fallback={
            <div className="loading-wrap">
              <div className="spinner" />
              <p style={{ color: '#bbb', fontSize: 14 }}>Loading...</p>
            </div>
          }>
            <ClaimForm />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}