'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Admin office location — shown to found person when chat is permanently closed
const ADMIN_OFFICE = {
  name: 'Lost & Found Admin Office',
  address: '123 Campus Center, Building A, Room 101',
  hours: 'Mon–Fri, 9:00 AM – 5:00 PM',
  phone: '+66 2-123-4567',
  mapLink: 'https://maps.google.com/?q=123+Campus+Center',
};

export default function ChatPage() {
  const { authFetch, user, token } = useAuth();
  const params = useParams();
  const chatId = params.id;

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [claimId, setClaimId] = useState(null);
  const claimIdRef = useRef(null);

  // Verification state
  const [verificationStatus, setVerificationStatus] = useState(null);
  // 'no_question'   → found person hasn't set a question yet
  // 'pending'       → question set, lost person hasn't passed yet
  // 'passed'        → lost person answered correctly
  // 'locked'        → 3 wrong attempts, chat permanently closed

  const [isFoundPerson, setIsFoundPerson] = useState(false); // respondent
  const [isLostPerson, setIsLostPerson] = useState(false);   // claimant

  const [verificationData, setVerificationData] = useState(null);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) return; // wait until token is hydrated from localStorage
    fetchChatAndMessages();
    const interval = setInterval(() => {
      fetchMessages();
      fetchVerificationStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatAndMessages = async () => {
    const chatRes = await authFetch(`/api/chats/${chatId}`);
    if (chatRes.ok) {
      const chatData = await chatRes.json();
      const cid = chatData.chat?.claim_id;
      setClaimId(cid);
      claimIdRef.current = cid;
      if (cid) await fetchVerificationStatus(cid);
    }
    await fetchMessages();
  };

  const fetchMessages = async () => {
    const res = await authFetch(`/api/chats/${chatId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    setLoading(false);
  };

  const fetchVerificationStatus = async (cid) => {
    const resolvedId = cid || claimIdRef.current || claimId;
    // Guard: don't fetch if we don't have a claimId yet
    if (!resolvedId) return;

    const claimRes = await authFetch('/api/claims');
    const claimData = await claimRes.json();
    const claims = claimData.claims || [];
    const claim = claims.find(c => c.id === resolvedId);

    if (!claim) return;

    const iFound = claim.respondent_id === user?.id;
    const iLost = claim.claimant_id === user?.id;
    setIsFoundPerson(iFound);
    setIsLostPerson(iLost);

    const vRes = await authFetch(`/api/verification/${resolvedId}`);
    if (vRes.ok) {
      const vData = await vRes.json();
      const v = vData.verification;
      setVerificationData(v);

      if (!v) {
        setVerificationStatus('no_question');
      } else if (v.is_locked) {
        setVerificationStatus('locked');
      } else if (v.is_passed) {
        setVerificationStatus('passed');
      } else {
        setVerificationStatus('pending');
      }
    } else {
      // Only reset to no_question on 404 (genuinely no record), not on other errors
      if (vRes.status === 404) setVerificationStatus('no_question');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    await authFetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: newMsg }),
    });
    setNewMsg('');
    setSending(false);
    fetchMessages();
  };

  // Is chat usable?
  const chatLocked = verificationStatus === 'locked';
  const canChat = verificationStatus === 'passed';

  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <div style={chatContainerStyle}>

          {/* Header */}
          <div style={chatHeaderStyle}>
            <div>
              <h2 style={chatTitleStyle}>💬 Private Chat</h2>
              <p style={chatSubtitleStyle}>Only you and the other party can see this</p>
            </div>
            <div style={headerActionsStyle}>
              {canChat && (
                <button
                  onClick={() => setShowVerificationPanel(p => !p)}
                  style={verifyBtnStyle}
                >
                  🔐 Verification
                </button>
              )}
              <Link href="/claims" style={backBtnStyle}>← Claims</Link>
            </div>
          </div>

          {/* Verification Panel (optional toggle when already passed) */}
          {canChat && showVerificationPanel && verificationData && (
            <div style={panelStyle}>
              <p style={{ color: '#4caf50', fontWeight: 600 }}>✅ Ownership verified — chat is open.</p>
            </div>
          )}

          {/* === GATE: show gate UI if not yet passed === */}
          {!canChat && (
            <VerificationGate
              claimId={claimId}
              authFetch={authFetch}
              user={user}
              isFoundPerson={isFoundPerson}
              isLostPerson={isLostPerson}
              verificationStatus={verificationStatus}
              verificationData={verificationData}
              onVerificationUpdate={() => fetchVerificationStatus()}
            />
          )}

          {/* Messages — only shown when chat is open */}
          {canChat && (
            <div style={messagesStyle}>
              {loading ? (
                <p style={mutedStyle}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <div style={emptyMsgStyle}>
                  <p>💬 No messages yet. Start the conversation!</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                    Discuss pickup details here.
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      ...msgWrapStyle,
                      alignItems: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.sender_id !== user?.id && (
                      <p style={senderNameStyle}>{msg.sender_name}</p>
                    )}
                    <div style={{
                      ...msgBubbleStyle,
                      background: msg.sender_id === user?.id ? '#e94560' : '#2a2a3e',
                      borderRadius: msg.sender_id === user?.id
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    }}>
                      <p style={msgTextStyle}>{msg.content}</p>
                      <p style={msgTimeStyle}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender_id === user?.id && (
                          <span style={{ marginLeft: '0.4rem' }}>{msg.is_read ? '✓✓' : '✓'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input — only shown when chat is open */}
          {canChat && (
            <form onSubmit={sendMessage} style={inputAreaStyle}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                style={inputStyle}
                disabled={sending}
              />
              <button type="submit" style={sendBtnStyle} disabled={sending || !newMsg.trim()}>
                {sending ? '...' : '➤'}
              </button>
            </form>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

// ─── Verification Gate Component ────────────────────────────────────────────

function VerificationGate({
  claimId, authFetch, user,
  isFoundPerson, isLostPerson,
  verificationStatus, verificationData,
  onVerificationUpdate,
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitAnswer, setSubmitAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const MAX_ATTEMPTS = 3;
  const attemptsLeft = verificationData
    ? MAX_ATTEMPTS - (verificationData.attempts || 0)
    : MAX_ATTEMPTS;

  // ── LOCKED: chat permanently closed ──
  if (verificationStatus === 'locked') {
    return (
      <div style={gateWrapStyle}>
        <div style={lockedBoxStyle}>
          <div style={lockedIconStyle}>🔒</div>
          <h3 style={lockedTitleStyle}>Chat Permanently Closed</h3>
          <p style={lockedDescStyle}>
            The claimant failed verification 3 times. This chat has been permanently closed.
          </p>

          {/* Show admin office info to the FOUND PERSON so they can hand in the item */}
          {isFoundPerson && (
            <div style={adminBoxStyle}>
              <h4 style={adminTitleStyle}>📦 Please Submit the Item to Admin</h4>
              <p style={adminRowStyle}>📍 <strong>Location:</strong> {ADMIN_OFFICE.address}</p>
              <p style={adminRowStyle}>🕐 <strong>Hours:</strong> {ADMIN_OFFICE.hours}</p>
              <p style={adminRowStyle}>📞 <strong>Phone:</strong> {ADMIN_OFFICE.phone}</p>
              <a
                href={ADMIN_OFFICE.mapLink}
                target="_blank"
                rel="noreferrer"
                style={mapLinkStyle}
              >
                🗺 Open in Google Maps
              </a>
            </div>
          )}

          {isLostPerson && (
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '1rem' }}>
              You have exceeded the maximum verification attempts. Please contact the admin office for assistance.
            </p>
          )}

          <Link href="/claims" style={backToClaimsStyle}>← Back to Claims</Link>
        </div>
      </div>
    );
  }

  // ── FOUND PERSON: needs to set a question ──
  if (isFoundPerson && verificationStatus === 'no_question') {
    const handleSetQuestion = async () => {
      if (!question.trim() || !answer.trim()) return;
      // Extra guard: don't POST if a question already exists (prevents 409)
      if (verificationData) return;
      setSaving(true);
      const res = await authFetch('/api/verification', {
        method: 'POST',
        body: JSON.stringify({ claim_id: claimId, question, answer }),
      });
      setSaving(false);
      if (res.ok) {
        setQuestion('');
        setAnswer('');
        onVerificationUpdate();
      }
    };

    return (
      <div style={gateWrapStyle}>
        <div style={gateBoxStyle}>
          <div style={gateIconStyle}>🔐</div>
          <h3 style={gateTitleStyle}>Set Ownership Verification</h3>
          <p style={gateDescStyle}>
            Before chatting, set a secret question that only the true owner would know.
            The other person must answer correctly to unlock the chat.
          </p>
          <div style={gateFormStyle}>
            <label style={labelStyle}>Secret Question</label>
            <input
              placeholder="e.g. What sticker is on the laptop lid?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={gateInputStyle}
            />
            <label style={labelStyle}>Correct Answer</label>
            <input
              placeholder="Your answer (case-insensitive)"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              style={gateInputStyle}
            />
            <button
              onClick={handleSetQuestion}
              style={primaryBtnStyle}
              disabled={saving || !question.trim() || !answer.trim()}
            >
              {saving ? 'Saving...' : '🔒 Set Verification Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FOUND PERSON: question set, waiting for claimant ──
  if (isFoundPerson && verificationStatus === 'pending') {
    return (
      <div style={gateWrapStyle}>
        <div style={gateBoxStyle}>
          <div style={gateIconStyle}>⏳</div>
          <h3 style={gateTitleStyle}>Waiting for Verification</h3>
          <p style={gateDescStyle}>
            You've set the verification question. Waiting for the claimant to answer correctly.
          </p>
          <div style={statusPillStyle('#f59e0b')}>
            ❓ Question: "{verificationData?.question}"
          </div>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
            Attempts used by claimant: {verificationData?.attempts || 0} / {MAX_ATTEMPTS}
          </p>
        </div>
      </div>
    );
  }

  // ── LOST PERSON: needs to answer ──
  if (isLostPerson && (verificationStatus === 'pending' || verificationStatus === 'no_question')) {
    if (verificationStatus === 'no_question') {
      return (
        <div style={gateWrapStyle}>
          <div style={gateBoxStyle}>
            <div style={gateIconStyle}>⏳</div>
            <h3 style={gateTitleStyle}>Verification Pending</h3>
            <p style={gateDescStyle}>
              The finder hasn't set a verification question yet. Please check back soon.
            </p>
          </div>
        </div>
      );
    }

    const handleAnswer = async () => {
      if (!submitAnswer.trim()) return;
      const res = await authFetch(`/api/verification/${claimId}`, {
        method: 'POST',
        body: JSON.stringify({ answer: submitAnswer }),
      });
      const data = await res.json();
      setResult(data);
      if (data.passed) {
        onVerificationUpdate();
      } else {
        setSubmitAnswer('');
        onVerificationUpdate(); // refresh attempt count
      }
    };

    return (
      <div style={gateWrapStyle}>
        <div style={gateBoxStyle}>
          <div style={gateIconStyle}>🔑</div>
          <h3 style={gateTitleStyle}>Prove You're the Owner</h3>
          <p style={gateDescStyle}>
            Answer the secret question to unlock the chat. You have{' '}
            <strong style={{ color: attemptsLeft <= 1 ? '#e94560' : '#f59e0b' }}>
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''}
            </strong>{' '}
            remaining.
          </p>

          <div style={questionBoxStyle}>
            <span style={{ fontSize: '1.2rem' }}>❓</span>
            <p style={questionTextStyle}>{verificationData?.question}</p>
          </div>

          <div style={gateFormStyle}>
            <input
              placeholder="Your answer..."
              value={submitAnswer}
              onChange={e => setSubmitAnswer(e.target.value)}
              style={{
                ...gateInputStyle,
                borderColor: result && !result.passed ? '#e94560' : '#333',
              }}
              onKeyDown={e => e.key === 'Enter' && handleAnswer()}
            />
            <button
              onClick={handleAnswer}
              style={primaryBtnStyle}
              disabled={!submitAnswer.trim()}
            >
              🔓 Submit Answer
            </button>

            {result && !result.passed && (
              <div style={errorBoxStyle}>
                <p style={{ color: '#e94560', fontWeight: 600 }}>❌ Incorrect answer</p>
                <p style={{ color: '#aaa', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                  {result.message}
                </p>
              </div>
            )}
          </div>

          {attemptsLeft <= 1 && !result?.passed && (
            <div style={warningBoxStyle}>
              ⚠️ <strong>Last attempt!</strong> If you answer incorrectly, this chat will be permanently closed.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback loading
  return (
    <div style={gateWrapStyle}>
      <p style={mutedStyle}>Loading verification...</p>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const pageStyle = { maxWidth: '800px', margin: '0 auto', padding: '2rem' };
const chatContainerStyle = { background: '#1a1a2e', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '80vh' };
const chatHeaderStyle = { background: '#0f0f1a', padding: '1rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 };
const chatTitleStyle = { color: '#fff', fontWeight: '600', fontSize: '1rem' };
const chatSubtitleStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' };
const headerActionsStyle = { display: 'flex', gap: '0.8rem', alignItems: 'center' };
const verifyBtnStyle = { background: '#2196f320', color: '#2196f3', border: '1px solid #2196f3', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' };
const backBtnStyle = { color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' };
const messagesStyle = { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' };
const msgWrapStyle = { display: 'flex', flexDirection: 'column' };
const senderNameStyle = { color: '#666', fontSize: '0.75rem', marginBottom: '0.2rem', paddingLeft: '0.5rem' };
const msgBubbleStyle = { maxWidth: '70%', padding: '0.8rem 1rem' };
const msgTextStyle = { color: '#fff', fontSize: '0.95rem', lineHeight: '1.4' };
const msgTimeStyle = { color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '0.3rem', textAlign: 'right' };
const inputAreaStyle = { padding: '1rem 1.5rem', borderTop: '1px solid #333', display: 'flex', gap: '0.8rem', flexShrink: 0 };
const inputStyle = { flex: 1, background: '#0f0f1a', border: '1px solid #333', borderRadius: '25px', padding: '0.8rem 1.2rem', color: '#fff', fontSize: '0.95rem' };
const sendBtnStyle = { background: '#e94560', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.1rem', flexShrink: 0, cursor: 'pointer' };
const emptyMsgStyle = { textAlign: 'center', color: '#aaa', margin: 'auto' };
const mutedStyle = { color: '#666', fontSize: '0.85rem' };
const panelStyle = { background: '#0f0f1a20', padding: '0.8rem 1.5rem', borderBottom: '1px solid #333' };

// Gate styles
const gateWrapStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const gateBoxStyle = { background: '#0f0f1a', border: '1px solid #333', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', textAlign: 'center' };
const gateIconStyle = { fontSize: '2.5rem', marginBottom: '1rem' };
const gateTitleStyle = { color: '#fff', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.6rem' };
const gateDescStyle = { color: '#888', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' };
const gateFormStyle = { display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' };
const labelStyle = { color: '#aaa', fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' };
const gateInputStyle = { background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px', padding: '0.7rem 1rem', color: '#fff', fontSize: '0.92rem', outline: 'none' };
const primaryBtnStyle = { background: '#e94560', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.25rem' };
const questionBoxStyle = { background: '#1a1a2e', border: '1px solid #2196f330', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', textAlign: 'left' };
const questionTextStyle = { color: '#fff', fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.5' };
const errorBoxStyle = { background: '#e9456010', border: '1px solid #e9456030', borderRadius: '8px', padding: '0.75rem 1rem' };
const warningBoxStyle = { background: '#f59e0b15', border: '1px solid #f59e0b40', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f59e0b', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'left' };

// Locked styles
const lockedBoxStyle = { background: '#0f0f1a', border: '1px solid #e9456040', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%', textAlign: 'center' };
const lockedIconStyle = { fontSize: '3rem', marginBottom: '1rem' };
const lockedTitleStyle = { color: '#e94560', fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.6rem' };
const lockedDescStyle = { color: '#888', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' };
const adminBoxStyle = { background: '#1a1a2e', border: '1px solid #2196f340', borderRadius: '12px', padding: '1.2rem 1.5rem', textAlign: 'left', marginBottom: '1.5rem' };
const adminTitleStyle = { color: '#2196f3', fontWeight: '700', fontSize: '0.95rem', marginBottom: '1rem' };
const adminRowStyle = { color: '#ccc', fontSize: '0.88rem', marginBottom: '0.5rem' };
const mapLinkStyle = { display: 'inline-block', marginTop: '0.75rem', background: '#2196f320', color: '#2196f3', border: '1px solid #2196f360', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' };
const backToClaimsStyle = { display: 'inline-block', marginTop: '0.5rem', color: '#666', fontSize: '0.85rem', textDecoration: 'none' };
const statusPillStyle = (color) => ({ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: '8px', padding: '0.75rem 1rem', color, fontSize: '0.88rem', textAlign: 'left' });