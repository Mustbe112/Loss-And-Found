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
  const [error, setError] = useState('');

  const handleClaim = async () => {
    if (!match_id) return setError('No match ID provided');
    setLoading(true);
    setError('');

    const res = await authFetch('/api/claims', {
      method: 'POST',
      body: JSON.stringify({ match_id }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);

    // Open chat for this claim
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

  return (
    <div style={cardStyle}>
      <h1 style={titleStyle}>📋 Claim This Item</h1>
      <p style={subtitleStyle}>
        You are about to claim this matched item. A private chat will be opened
        between you and the finder to verify ownership.
      </p>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={infoBoxStyle}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>What happens next:</p>
        <ul style={listStyle}>
          <li>A private chat opens between you and the finder</li>
          <li>The finder will set a verification question</li>
          <li>You answer to prove ownership</li>
          <li>If correct, arrange pickup details in chat</li>
          <li>Confirm handover when you get your item back</li>
        </ul>
      </div>

      <div style={btnRowStyle}>
        <button onClick={() => router.back()} style={btnSecondary}>
          Cancel
        </button>
        <button onClick={handleClaim} style={btnPrimary} disabled={loading}>
          {loading ? 'Processing...' : '✅ Confirm Claim'}
        </button>
      </div>
    </div>
  );
}

export default function NewClaimPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <Suspense fallback={<p style={{ color: '#aaa' }}>Loading...</p>}>
          <ClaimForm />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

const pageStyle = { maxWidth: '600px', margin: '0 auto', padding: '2rem' };
const cardStyle = { background: '#1a1a2e', borderRadius: '12px', padding: '2.5rem', border: '1px solid #333' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#e94560', marginBottom: '0.5rem' };
const subtitleStyle = { color: '#aaa', marginBottom: '2rem', lineHeight: '1.6' };
const errorStyle = { background: '#ff000020', border: '1px solid #ff000060', color: '#ff6b6b', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem' };
const infoBoxStyle = { background: '#0f0f1a', borderRadius: '8px', padding: '1.2rem', marginBottom: '2rem', border: '1px solid #2a2a3e' };
const listStyle = { color: '#ccc', fontSize: '0.9rem', paddingLeft: '1.2rem', marginTop: '0.5rem', lineHeight: '2' };
const btnRowStyle = { display: 'flex', gap: '1rem' };
const btnPrimary = { flex: 1, background: '#e94560', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' };
const btnSecondary = { flex: 1, background: 'transparent', color: '#fff', border: '1px solid #444', padding: '0.8rem', borderRadius: '6px', fontSize: '1rem' };