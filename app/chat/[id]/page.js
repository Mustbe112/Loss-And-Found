'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const { authFetch, user } = useAuth();
  const params = useParams();
  const chatId = params.id;
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [claimId, setClaimId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchChatAndMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatAndMessages = async () => {
    // Get chat info to find claim_id
    const chatRes = await authFetch(`/api/chats/${chatId}`);
    if (chatRes.ok) {
      const chatData = await chatRes.json();
      setClaimId(chatData.chat?.claim_id);
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
              <button
                onClick={() => setShowVerification(!showVerification)}
                style={verifyBtnStyle}
              >
                🔐 Verification
              </button>
              <Link href="/claims" style={backBtnStyle}>← Claims</Link>
            </div>
          </div>

          {/* Verification Panel */}
          {showVerification && claimId && (
            <VerificationPanel claimId={claimId} authFetch={authFetch} user={user} />
          )}

          {/* Messages */}
          <div style={messagesStyle}>
            {loading ? (
              <p style={mutedStyle}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <div style={emptyMsgStyle}>
                <p>💬 No messages yet. Start the conversation!</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                  Discuss pickup details and verify ownership here.
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
                        <span style={{ marginLeft: '0.4rem' }}>
                          {msg.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
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

        </div>
      </div>
    </ProtectedRoute>
  );
}

function VerificationPanel({ claimId, authFetch, user }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitAnswer, setSubmitAnswer] = useState('');
  const [existing, setExisting] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRespondent, setIsRespondent] = useState(false);

  useEffect(() => {
    fetchVerification();
  }, [claimId]);

  const fetchVerification = async () => {
    const claimRes = await authFetch('/api/claims');
    const claimData = await claimRes.json();
    const claims = claimData.claims || [];
    const claim = claims.find(c => c.id === claimId);

    if (claim) {
      setIsRespondent(claim.respondent_id === user?.id);
      const vRes = await authFetch(`/api/verification/${claimId}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        setExisting(vData.verification);
      }
    }
    setLoading(false);
  };

  const setVerificationQuestion = async () => {
    const res = await authFetch('/api/verification', {
      method: 'POST',
      body: JSON.stringify({ claim_id: claimId, question, answer }),
    });
    if (res.ok) {
      setExisting({ question, is_passed: false });
      setQuestion('');
      setAnswer('');
    }
  };

  const answerQuestion = async () => {
    const res = await authFetch(`/api/verification/${claimId}`, {
      method: 'POST',
      body: JSON.stringify({ answer: submitAnswer }),
    });
    const data = await res.json();
    setResult(data);
    if (data.passed) fetchVerification();
  };

  if (loading) return <div style={panelStyle}><p style={mutedStyle}>Loading...</p></div>;

  return (
    <div style={panelStyle}>
      <h3 style={panelTitleStyle}>🔐 Ownership Verification</h3>

      {!existing ? (
        isRespondent ? (
          <div style={verifyFormStyle}>
            <p style={mutedStyle}>Set a secret question to verify the claimant owns the item.</p>
            <input
              placeholder="Question (e.g. What sticker is on the laptop?)"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={verifyInputStyle}
            />
            <input
              placeholder="Answer"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              style={verifyInputStyle}
            />
            <button onClick={setVerificationQuestion} style={btnSetStyle}>
              Set Question
            </button>
          </div>
        ) : (
          <p style={mutedStyle}>Waiting for the finder to set a verification question...</p>
        )
      ) : (
        <div>
          <p style={questionStyle}>❓ {existing.question}</p>
          {existing.is_passed ? (
            <p style={passedStyle}>✅ Verification passed!</p>
          ) : !isRespondent ? (
            <div style={verifyFormStyle}>
              <input
                placeholder="Your answer..."
                value={submitAnswer}
                onChange={e => setSubmitAnswer(e.target.value)}
                style={verifyInputStyle}
              />
              <button onClick={answerQuestion} style={btnSetStyle}>
                Submit Answer
              </button>
              {result && (
                <p style={{ color: result.passed ? '#4caf50' : '#e94560', marginTop: '0.5rem' }}>
                  {result.message}
                </p>
              )}
            </div>
          ) : (
            <p style={mutedStyle}>Waiting for claimant to answer...</p>
          )}
        </div>
      )}
    </div>
  );
}

const pageStyle = { maxWidth: '800px', margin: '0 auto', padding: '2rem' };
const chatContainerStyle = { background: '#1a1a2e', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '80vh' };
const chatHeaderStyle = { background: '#0f0f1a', padding: '1rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const chatTitleStyle = { color: '#fff', fontWeight: '600', fontSize: '1rem' };
const chatSubtitleStyle = { color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' };
const headerActionsStyle = { display: 'flex', gap: '0.8rem', alignItems: 'center' };
const verifyBtnStyle = { background: '#2196f320', color: '#2196f3', border: '1px solid #2196f3', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' };
const backBtnStyle = { color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' };
const messagesStyle = { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' };
const msgWrapStyle = { display: 'flex', flexDirection: 'column' };
const senderNameStyle = { color: '#666', fontSize: '0.75rem', marginBottom: '0.2rem', paddingLeft: '0.5rem' };
const msgBubbleStyle = { maxWidth: '70%', padding: '0.8rem 1rem' };
const msgTextStyle = { color: '#fff', fontSize: '0.95rem', lineHeight: '1.4' };
const msgTimeStyle = { color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '0.3rem', textAlign: 'right' };
const inputAreaStyle = { padding: '1rem 1.5rem', borderTop: '1px solid #333', display: 'flex', gap: '0.8rem' };
const inputStyle = { flex: 1, background: '#0f0f1a', border: '1px solid #333', borderRadius: '25px', padding: '0.8rem 1.2rem', color: '#fff', fontSize: '0.95rem' };
const sendBtnStyle = { background: '#e94560', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.1rem', flexShrink: 0 };
const emptyMsgStyle = { textAlign: 'center', color: '#aaa', margin: 'auto' };
const mutedStyle = { color: '#666', fontSize: '0.85rem' };
const panelStyle = { background: '#0f0f1a', padding: '1rem 1.5rem', borderBottom: '1px solid #333' };
const panelTitleStyle = { color: '#fff', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.8rem' };
const verifyFormStyle = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const verifyInputStyle = { background: '#1a1a2e', border: '1px solid #333', borderRadius: '6px', padding: '0.5rem 0.8rem', color: '#fff', fontSize: '0.9rem' };
const btnSetStyle = { background: '#2196f3', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', alignSelf: 'flex-start' };
const questionStyle = { color: '#fff', fontWeight: '500', marginBottom: '0.8rem' };
const passedStyle = { color: '#4caf50', fontWeight: '500' };