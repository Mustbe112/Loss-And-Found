'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function NotificationsPage() {
  const { authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

    // Mark all as read
    await authFetch('/api/notifications', { method: 'PATCH' });
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <h1 style={titleStyle}>🔔 Notifications & Matches</h1>
        <p style={subtitleStyle}>AI match results and system notifications</p>

        {loading ? (
          <p style={mutedStyle}>Loading...</p>
        ) : (
          <div style={sectionsStyle}>

            {/* AI Matches */}
            <section>
              <h2 style={sectionTitle}>🤖 AI Match Results</h2>
              {matches.length === 0 ? (
                <EmptyState text="No matches found yet. Submit a lost or found item to trigger AI matching." />
              ) : (
                <div style={listStyle}>
                  {matches.map(match => (
                    <div key={match.id} style={matchCardStyle}>
                      <div style={matchHeaderStyle}>
                        <span style={matchScoreStyle(match.score)}>
                          {match.score}% Match
                        </span>
                        <ConfidenceBadge confidence={match.confidence} />
                        <StatusBadge status={match.status} />
                      </div>

                      <div style={matchItemsStyle}>
                        <div style={matchItemStyle}>
                          <p style={matchLabelStyle}>📦 Lost Item</p>
                          <p style={matchNameStyle}>{match.lost_item_name}</p>
                          <p style={matchMetaStyle}>{match.lost_category}</p>
                        </div>
                        <div style={arrowStyle}>↔️</div>
                        <div style={matchItemStyle}>
                          <p style={matchLabelStyle}>✅ Found Item</p>
                          <p style={matchNameStyle}>{match.found_item_name}</p>
                          <p style={matchMetaStyle}>{match.found_category}</p>
                        </div>
                      </div>

                      {match.explanation && (
                        <p style={explanationStyle}>💡 {match.explanation}</p>
                      )}

                      {match.status === 'pending' && (
                        <Link
                          href={`/claims/new?match_id=${match.id}`}
                          style={claimBtnStyle}
                        >
                          Claim This Item →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Notifications */}
            <section>
              <h2 style={sectionTitle}>📬 System Notifications</h2>
              {notifications.length === 0 ? (
                <EmptyState text="No notifications yet" />
              ) : (
                <div style={listStyle}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      ...notifCardStyle,
                      borderLeft: n.is_read ? '3px solid #333' : '3px solid #e94560',
                    }}>
                      <p style={{ color: '#fff', fontSize: '0.9rem' }}>{n.message}</p>
                      <p style={mutedStyle}>
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ConfidenceBadge({ confidence }) {
  const colors = { Low: '#ff9800', Medium: '#2196f3', High: '#4caf50' };
  return (
    <span style={{
      background: `${colors[confidence]}20`,
      color: colors[confidence],
      border: `1px solid ${colors[confidence]}`,
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
    }}>
      {confidence} Confidence
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = { pending: '#ff9800', accepted: '#4caf50', rejected: '#e94560', resolved: '#9c27b0' };
  return (
    <span style={{
      background: `${colors[status] || '#666'}20`,
      color: colors[status] || '#666',
      border: `1px solid ${colors[status] || '#666'}`,
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
    }}>
      {status}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', background: '#1a1a2e', borderRadius: '10px', border: '1px solid #333' }}>
      <p style={{ color: '#aaa' }}>{text}</p>
    </div>
  );
}

const matchScoreStyle = (score) => ({
  color: score >= 80 ? '#4caf50' : score >= 50 ? '#ff9800' : '#e94560',
  fontWeight: 'bold',
  fontSize: '1rem',
});

const pageStyle = { maxWidth: '900px', margin: '0 auto', padding: '2rem' };
const titleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' };
const subtitleStyle = { color: '#aaa', marginBottom: '2rem' };
const mutedStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.3rem' };
const sectionsStyle = { display: 'flex', flexDirection: 'column', gap: '2rem' };
const sectionTitle = { fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '1rem' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const matchCardStyle = { background: '#1a1a2e', borderRadius: '10px', padding: '1.5rem', border: '1px solid #333' };
const matchHeaderStyle = { display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' };
const matchItemsStyle = { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' };
const matchItemStyle = { flex: 1, background: '#0f0f1a', padding: '0.8rem', borderRadius: '8px' };
const matchLabelStyle = { color: '#aaa', fontSize: '0.75rem', marginBottom: '0.3rem' };
const matchNameStyle = { color: '#fff', fontWeight: '600', fontSize: '0.95rem' };
const matchMetaStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' };
const arrowStyle = { fontSize: '1.5rem' };
const explanationStyle = { color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic', background: '#0f0f1a', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem' };
const claimBtnStyle = { display: 'inline-block', background: '#e94560', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' };
const notifCardStyle = { background: '#1a1a2e', borderRadius: '8px', padding: '1rem 1.2rem', border: '1px solid #333' };