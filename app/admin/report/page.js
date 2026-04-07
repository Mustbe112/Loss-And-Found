'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ReportForm() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claim_id = searchParams.get('claim_id');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await authFetch('/api/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ claim_id, reason }),
    });

    setLoading(false);
    if (res.ok) setSuccess(true);
  };

  if (success) return (
    <div style={cardStyle}>
      <p style={{ fontSize: '3rem', textAlign: 'center' }}>✅</p>
      <h2 style={{ color: '#4caf50', textAlign: 'center', margin: '1rem 0' }}>
        Report Submitted
      </h2>
      <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '1.5rem' }}>
        An admin will review your case shortly.
      </p>
      <button onClick={() => router.push('/claims')} style={btnPrimary}>
        Back to Claims
      </button>
    </div>
  );

  return (
    <div style={cardStyle}>
      <h1 style={titleStyle}>🚩 Report an Issue</h1>
      <p style={subtitleStyle}>Describe the problem and an admin will review it.</p>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Reason</label>
          <textarea
            placeholder="Describe the issue in detail..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={5}
            required
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={btnRowStyle}>
          <button type="button" onClick={() => router.back()} style={btnSecondary}>
            Cancel
          </button>
          <button type="submit" style={btnPrimary} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <Suspense fallback={<p style={{ color: '#aaa' }}>Loading...</p>}>
          <ReportForm />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

const pageStyle = { maxWidth: '600px', margin: '0 auto', padding: '2rem' };
const cardStyle = { background: '#1a1a2e', borderRadius: '12px', padding: '2.5rem', border: '1px solid #333' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#e94560', marginBottom: '0.5rem' };
const subtitleStyle = { color: '#aaa', marginBottom: '2rem' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '1.2rem' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const labelStyle = { color: '#ccc', fontSize: '0.9rem' };
const btnRowStyle = { display: 'flex', gap: '1rem' };
const btnPrimary = { flex: 1, background: '#e94560', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' };
const btnSecondary = { flex: 1, background: 'transparent', color: '#fff', border: '1px solid #444', padding: '0.8rem', borderRadius: '6px', fontSize: '1rem' };
const viewAllStyle = { color: '#e94560', fontSize: '0.85rem', textDecoration: 'none' };