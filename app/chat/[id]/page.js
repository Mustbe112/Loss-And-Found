'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_OFFICE = {
  name: 'Lost & Found Admin Office',
  address: '123 Campus Center, Building A, Room 101',
  hours: 'Mon–Fri, 9:00 AM – 5:00 PM',
  phone: '+66 2-123-4567',
  mapLink: 'https://maps.google.com/?q=123+Campus+Center',
};

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; }

    .cp-page {
      background: #f5f4f0;
      min-height: calc(100vh - 60px);
      font-family: 'DM Sans', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    }
    .cp-inner {
      max-width: 820px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Header row */
    .cp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 1rem;
    }
    .cp-header-left { display: flex; flex-direction: column; gap: 2px; }
    .cp-eyebrow {
      font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
      color: #aaa; text-transform: uppercase;
    }
    .cp-title {
      font-size: 1.5rem; font-weight: 700;
      letter-spacing: -0.4px; color: #0d0d0d; line-height: 1.2;
    }
    .cp-header-actions { display: flex; gap: 0.6rem; align-items: center; flex-shrink: 0; }

    /* Chat shell */
    .cp-shell {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.09);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 70vh;
    }

    /* Chat top bar */
    .cp-bar {
      padding: 0.85rem 1.25rem;
      border-bottom: 0.5px solid rgba(0,0,0,0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafaf8;
      flex-shrink: 0;
    }
    .cp-bar-label {
      font-size: 12px; font-weight: 600; color: #0d0d0d;
      display: flex; align-items: center; gap: 6px;
    }
    .cp-bar-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
      flex-shrink: 0;
    }
    .cp-bar-sub { font-size: 11px; color: #bbb; margin-top: 1px; }

    /* Verified panel */
    .cp-verified-banner {
      padding: 0.6rem 1.25rem;
      border-bottom: 0.5px solid rgba(0,0,0,0.06);
      background: #f0fdf4;
      font-size: 12px; color: #1a6b3c; font-weight: 500;
      display: flex; align-items: center; gap: 6px;
    }

    /* Messages */
    .cp-messages {
      flex: 1; overflow-y: auto; padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.65rem;
    }
    .cp-msg-wrap { display: flex; flex-direction: column; }
    .cp-sender-name { font-size: 11px; color: #bbb; margin-bottom: 3px; padding-left: 4px; }
    .cp-bubble {
      max-width: 68%;
      padding: 0.7rem 1rem;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .cp-bubble-mine {
      background: #0d0d0d; color: #fff;
      border-radius: 16px 16px 3px 16px;
      align-self: flex-end;
    }
    .cp-bubble-theirs {
      background: #f3f3f1; color: #0d0d0d;
      border-radius: 16px 16px 16px 3px;
    }
    .cp-msg-time {
      font-size: 10px; color: rgba(255,255,255,0.45); margin-top: 4px; text-align: right;
    }
    .cp-msg-time-theirs { color: #ccc; }
    .cp-empty-msg {
      margin: auto; text-align: center; color: #bbb; font-size: 13px; font-weight: 300;
    }

    /* Input area */
    .cp-input-area {
      padding: 0.9rem 1.25rem;
      border-top: 0.5px solid rgba(0,0,0,0.07);
      display: flex; gap: 0.65rem; align-items: center;
      flex-shrink: 0; background: #fafaf8;
    }
    .cp-input {
      flex: 1; background: #fff;
      border: 0.5px solid rgba(0,0,0,0.12);
      border-radius: 22px; padding: 0.65rem 1.1rem;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px; color: #0d0d0d;
      outline: none; transition: border-color 0.15s;
      min-width: 0;
    }
    .cp-input:focus { border-color: rgba(0,0,0,0.3); }
    .cp-input::placeholder { color: #bbb; font-weight: 300; }
    .cp-send-btn {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: #0d0d0d; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .cp-send-btn:hover:not(:disabled) { background: #333; }
    .cp-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* Claim actions bar */
    .cp-claim-bar {
      padding: 0.75rem 1.25rem;
      border-top: 0.5px solid rgba(0,0,0,0.07);
      display: flex; gap: 0.65rem;
      background: #fafaf8; flex-shrink: 0;
    }

    /* Gate (verification screen) */
    .cp-gate {
      flex: 1; display: flex;
      align-items: center; justify-content: center;
      padding: 2.5rem 1.5rem;
    }
    .cp-gate-box {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.09);
      border-radius: 14px;
      padding: 2.25rem 2rem;
      max-width: 460px; width: 100%; text-align: center;
    }
    .cp-gate-icon {
      width: 52px; height: 52px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; margin: 0 auto 1.25rem;
    }
    .cp-gate-title {
      font-size: 1rem; font-weight: 700; color: #0d0d0d; margin-bottom: 0.5rem;
    }
    .cp-gate-desc {
      font-size: 13px; color: #888; line-height: 1.65;
      margin-bottom: 1.5rem; font-weight: 300;
    }
    .cp-gate-form { display: flex; flex-direction: column; gap: 0.65rem; text-align: left; }
    .cp-gate-label {
      font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: #aaa;
    }
    .cp-gate-input {
      width: 100%; background: #f9f9f8;
      border: 0.5px solid rgba(0,0,0,0.12);
      border-radius: 8px; padding: 0.65rem 0.9rem;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px; color: #0d0d0d; outline: none;
      transition: border-color 0.15s;
    }
    .cp-gate-input:focus { border-color: rgba(0,0,0,0.3); }
    .cp-gate-input::placeholder { color: #ccc; font-weight: 300; }
    .cp-gate-input-error { border-color: #fca5a5 !important; }

    .cp-question-box {
      background: #f9f9f8; border: 0.5px solid rgba(0,0,0,0.07);
      border-radius: 9px; padding: 0.85rem 1rem;
      margin-bottom: 1.1rem; display: flex; gap: 0.6rem;
      align-items: flex-start; text-align: left;
    }
    .cp-question-text { font-size: 13.5px; font-weight: 600; color: #0d0d0d; line-height: 1.5; }

    /* Info/warning/error boxes */
    .cp-info-box {
      border-radius: 9px; padding: 0.8rem 1rem;
      font-size: 12.5px; text-align: left; margin-top: 0.5rem;
    }
    .cp-info-amber  { background: #fef9e6; color: #92600a; border: 0.5px solid #f0d080; }
    .cp-info-red    { background: #fdecea; color: #b91c1c; border: 0.5px solid #fca5a5; }
    .cp-info-green  { background: #e6f4ea; color: #1a6b3c; border: 0.5px solid #86efac; }
    .cp-info-blue   { background: #e8f0fe; color: #1a47a0; border: 0.5px solid #93c5fd; }

    /* Admin box inside locked gate */
    .cp-admin-box {
      background: #f9f9f8; border: 0.5px solid rgba(0,0,0,0.09);
      border-radius: 9px; padding: 1rem 1.1rem;
      text-align: left; margin-bottom: 1.25rem;
    }
    .cp-admin-box-title {
      font-size: 12px; font-weight: 600; color: #0d0d0d;
      margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .cp-admin-row { font-size: 12.5px; color: #555; margin-bottom: 0.4rem; }
    .cp-admin-row strong { color: #0d0d0d; }

    /* Buttons */
    .cp-btn-primary {
      width: 100%; background: #0d0d0d; color: #fff; border: none;
      padding: 0.7rem 1rem; border-radius: 8px; font-size: 13px;
      font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: background 0.15s; margin-top: 0.25rem;
    }
    .cp-btn-primary:hover:not(:disabled) { background: #333; }
    .cp-btn-primary:disabled { opacity: 0.38; cursor: not-allowed; }

    .cp-btn-outline {
      display: inline-flex; align-items: center; gap: 5px;
      background: transparent; color: #0d0d0d;
      border: 0.5px solid rgba(0,0,0,0.2);
      padding: 0.45rem 0.9rem; border-radius: 7px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      font-family: 'DM Sans', sans-serif; text-decoration: none;
      transition: border-color 0.15s; white-space: nowrap;
    }
    .cp-btn-outline:hover { border-color: rgba(0,0,0,0.4); }

    .cp-btn-success {
      flex: 1; background: #e6f4ea; color: #1a6b3c;
      border: 0.5px solid #86efac; padding: 0.6rem 1rem;
      border-radius: 8px; font-size: 12.5px; font-weight: 600;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: background 0.15s;
    }
    .cp-btn-success:hover:not(:disabled) { background: #d1fae5; }
    .cp-btn-success:disabled { opacity: 0.4; cursor: not-allowed; }

    .cp-map-link {
      display: inline-flex; align-items: center; gap: 5px;
      margin-top: 0.75rem;
      background: #e8f0fe; color: #1a47a0;
      border: 0.5px solid #93c5fd; border-radius: 7px;
      padding: 0.45rem 0.9rem; font-size: 12px; text-decoration: none;
      font-weight: 500;
    }
    .cp-back-link {
      display: inline-flex; align-items: center; gap: 4px;
      margin-top: 0.75rem;
      color: #aaa; font-size: 12px; text-decoration: none;
    }
    .cp-back-link:hover { color: #555; }

    .cp-status-pill {
      border-radius: 8px; padding: 0.65rem 0.9rem;
      font-size: 12.5px; text-align: left; margin-top: 0.5rem;
    }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .cp-inner {
        padding: 1rem 0.875rem;
      }

      /* Tighter header */
      .cp-header {
        margin-bottom: 0.875rem;
        gap: 0.5rem;
      }
      .cp-title {
        font-size: 1.2rem;
      }

      /* Shrink outline buttons to icon-only on mobile */
      .cp-btn-label {
        display: none;
      }
      .cp-btn-outline {
        padding: 0.5rem 0.65rem;
        gap: 0;
      }

      /* Chat shell */
      .cp-shell {
        border-radius: 10px;
        min-height: 60vh;
      }

      /* Wider bubbles on mobile */
      .cp-bubble {
        max-width: 84%;
        font-size: 13px;
        padding: 0.6rem 0.85rem;
      }

      /* Tighter message area */
      .cp-messages {
        padding: 0.875rem;
        gap: 0.5rem;
      }

      /* Input area */
      .cp-input-area {
        padding: 0.65rem 0.875rem;
        gap: 0.5rem;
      }
      .cp-input {
        font-size: 13px;
        padding: 0.6rem 0.9rem;
      }

      /* Top bar */
      .cp-bar {
        padding: 0.65rem 0.875rem;
      }
      .cp-bar-sub {
        font-size: 10px;
      }

      /* Claim bar */
      .cp-claim-bar {
        padding: 0.65rem 0.875rem;
      }
      .cp-btn-success {
        font-size: 13px;
        padding: 0.7rem 1rem;
      }

      /* Gate — align to top so content isn't cut off on short screens */
      .cp-gate {
        padding: 1rem 0.875rem 1.5rem;
        align-items: flex-start;
      }
      .cp-gate-box {
        padding: 1.5rem 1.1rem;
        border-radius: 10px;
        max-width: 100%;
        /* Remove inner border/bg since it floats on the shell already */
        border: none;
        background: transparent;
      }
      .cp-gate-icon {
        width: 44px; height: 44px;
        margin-bottom: 1rem;
      }
      .cp-gate-title {
        font-size: 0.95rem;
      }
      .cp-gate-desc {
        font-size: 12.5px;
        margin-bottom: 1.1rem;
      }
      .cp-gate-input {
        font-size: 13px;
        padding: 0.6rem 0.85rem;
      }

      /* Admin box */
      .cp-admin-box {
        padding: 0.875rem;
      }
      .cp-admin-row {
        font-size: 12px;
      }

      /* Map link full-width on mobile */
      .cp-map-link {
        display: flex;
        justify-content: center;
      }

      /* Question box */
      .cp-question-box {
        padding: 0.75rem 0.875rem;
      }
      .cp-question-text {
        font-size: 13px;
      }

      /* Info boxes */
      .cp-info-box {
        font-size: 12px;
        padding: 0.7rem 0.875rem;
      }
    }
  `}</style>
);

/* ─────────────── ICONS ─────────────── */
function IconSend({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L2 7l5 1.5L8.5 14 14 2z" />
    </svg>
  );
}
function IconLock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconKey({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="5" />
      <path d="M21 3l-9.4 9.4M16 8l2 2" />
    </svg>
  );
}
function IconClock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconShield({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 4v5c0 5-3.5 9-7 10C8.5 20 5 16 5 11V6l7-4z" />
    </svg>
  );
}
function IconCheck({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 8l4 4 6-7" />
    </svg>
  );
}
function IconMap({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 1a4 4 0 0 0-4 4c0 3 4 9 4 9s4-6 4-9a4 4 0 0 0-4-4z" />
      <circle cx="8" cy="5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconArrowLeft({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M10 6H2M6 10L2 6l4-4" />
    </svg>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function ChatPage() {
  const { authFetch, user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const chatId = params.id;

  const [messages, setMessages]                     = useState([]);
  const [newMsg, setNewMsg]                         = useState('');
  const [loading, setLoading]                       = useState(true);
  const [sending, setSending]                       = useState(false);
  const [claimId, setClaimId]                       = useState(null);
  const claimIdRef                                  = useRef(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isFoundPerson, setIsFoundPerson]           = useState(false);
  const [isLostPerson, setIsLostPerson]             = useState(false);
  const [verificationData, setVerificationData]     = useState(null);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);
  const [claimActionLoading, setClaimActionLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) return;
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
    if (!resolvedId) return;
    const claimRes  = await authFetch('/api/claims');
    const claimData = await claimRes.json();
    const claims    = claimData.claims || [];
    const claim     = claims.find(c => c.id === resolvedId);
    if (!claim) return;
    setIsFoundPerson(claim.respondent_id === user?.id);
    setIsLostPerson(claim.claimant_id === user?.id);
    const vRes = await authFetch(`/api/verification/${resolvedId}`);
    if (vRes.ok) {
      const vData = await vRes.json();
      const v = vData.verification;
      setVerificationData(v);
      if (!v)               setVerificationStatus('no_question');
      else if (v.is_locked) setVerificationStatus('locked');
      else if (v.is_passed) setVerificationStatus('passed');
      else                  setVerificationStatus('pending');
    } else {
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

  const handleClaimConfirm = async () => {
    if (!claimId) return;
    if (!confirm('Confirm that you received your item back?')) return;
    setClaimActionLoading(true);
    try {
      const res = await authFetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (res.ok) router.push('/claims');
      else alert('Failed to update claim. Please try again.');
    } catch { alert('An error occurred. Please try again.'); }
    finally { setClaimActionLoading(false); }
  };

  const chatLocked = verificationStatus === 'locked';
  const canChat    = verificationStatus === 'passed';

  return (
    <ProtectedRoute>
      <GlobalStyles />
      <Navbar />

      <div className="cp-page">
        <div className="cp-inner">

          {/* Page header */}
          <div className="cp-header">
            <div className="cp-header-left">
              <span className="cp-eyebrow">Chat</span>
              <h1 className="cp-title">Private conversation</h1>
            </div>
            <div className="cp-header-actions">
              {canChat && (
                <button
                  className="cp-btn-outline"
                  onClick={() => setShowVerificationPanel(p => !p)}
                >
                  <IconShield size={13} />
                  <span className="cp-btn-label">Verification</span>
                </button>
              )}
              <Link href="/claims" className="cp-btn-outline">
                <IconArrowLeft size={12} />
                <span className="cp-btn-label">Claims</span>
              </Link>
            </div>
          </div>

          {/* Chat shell */}
          <div className="cp-shell">

            {/* Top bar */}
            <div className="cp-bar">
              <div>
                <div className="cp-bar-label">
                  {canChat && <span className="cp-bar-dot" />}
                  Private Chat
                </div>
                <div className="cp-bar-sub">Only you and the other party can see this</div>
              </div>
            </div>

            {/* Verified banner */}
            {canChat && showVerificationPanel && verificationData && (
              <div className="cp-verified-banner">
                <IconCheck size={13} />
                Ownership verified — chat is open
              </div>
            )}

            {/* Gate: verification not passed */}
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

            {/* Messages */}
            {canChat && (
              <div className="cp-messages">
                {loading ? (
                  <p style={{ color: '#bbb', fontSize: 13, margin: 'auto' }}>Loading messages…</p>
                ) : messages.length === 0 ? (
                  <div className="cp-empty-msg">
                    <p style={{ fontSize: 13, fontWeight: 500 }}>No messages yet</p>
                    <p style={{ fontSize: 12, marginTop: 4, color: '#ccc', fontWeight: 300 }}>Start the conversation — discuss pickup details here.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const mine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className="cp-msg-wrap"
                        style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}
                      >
                        {!mine && <p className="cp-sender-name">{msg.sender_name}</p>}
                        <div className={`cp-bubble ${mine ? 'cp-bubble-mine' : 'cp-bubble-theirs'}`}>
                          {msg.content}
                          <div className={`cp-msg-time ${mine ? '' : 'cp-msg-time-theirs'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {mine && <span style={{ marginLeft: 4 }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Input */}
            {canChat && (
              <form className="cp-input-area" onSubmit={sendMessage}>
                <input
                  className="cp-input"
                  type="text"
                  placeholder="Type a message…"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  disabled={sending}
                />
                <button className="cp-send-btn" type="submit" disabled={sending || !newMsg.trim()}>
                  <IconSend size={15} />
                </button>
              </form>
            )}

            {/* Claim action */}
            {canChat && isLostPerson && (
              <div className="cp-claim-bar">
                <button
                  className="cp-btn-success"
                  onClick={handleClaimConfirm}
                  disabled={claimActionLoading}
                >
                  {claimActionLoading ? 'Processing…' : '✓ I Got My Item Back'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ─────────────── VERIFICATION GATE ─────────────── */
function VerificationGate({
  claimId, authFetch, user,
  isFoundPerson, isLostPerson,
  verificationStatus, verificationData,
  onVerificationUpdate,
}) {
  const [question, setQuestion]         = useState('');
  const [answer, setAnswer]             = useState('');
  const [submitAnswer, setSubmitAnswer] = useState('');
  const [result, setResult]             = useState(null);
  const [saving, setSaving]             = useState(false);

  const MAX_ATTEMPTS  = 3;
  const attemptsLeft  = verificationData
    ? MAX_ATTEMPTS - (verificationData.attempts || 0)
    : MAX_ATTEMPTS;

  /* ── LOCKED ── */
  if (verificationStatus === 'locked') {
    return (
      <div className="cp-gate">
        <div className="cp-gate-box">
          <div className="cp-gate-icon" style={{ background: '#fdecea', color: '#b91c1c' }}>
            <IconLock size={22} />
          </div>
          <h3 className="cp-gate-title">Chat Permanently Closed</h3>
          <p className="cp-gate-desc">
            The claimant failed verification 3 times. This chat has been permanently closed.
          </p>

          {isFoundPerson && (
            <div className="cp-admin-box">
              <div className="cp-admin-box-title">Please submit the item to admin</div>
              <div className="cp-admin-row"><strong>Location:</strong> {ADMIN_OFFICE.address}</div>
              <div className="cp-admin-row"><strong>Hours:</strong> {ADMIN_OFFICE.hours}</div>
              <div className="cp-admin-row"><strong>Phone:</strong> {ADMIN_OFFICE.phone}</div>
              <a href={ADMIN_OFFICE.mapLink} target="_blank" rel="noreferrer" className="cp-map-link">
                <IconMap size={12} /> Open in Google Maps
              </a>
            </div>
          )}

          {isLostPerson && (
            <div className="cp-info-box cp-info-red" style={{ marginBottom: '1rem' }}>
              You exceeded the maximum attempts. Please contact the admin office for assistance.
            </div>
          )}

          <Link href="/claims" className="cp-back-link">
            <IconArrowLeft size={11} /> Back to Claims
          </Link>
        </div>
      </div>
    );
  }

  /* ── FOUND PERSON: set question ── */
  if (isFoundPerson && verificationStatus === 'no_question') {
    const handleSetQuestion = async () => {
      if (!question.trim() || !answer.trim() || verificationData) return;
      setSaving(true);
      const res = await authFetch('/api/verification', {
        method: 'POST',
        body: JSON.stringify({ claim_id: claimId, question, answer }),
      });
      setSaving(false);
      if (res.ok) { setQuestion(''); setAnswer(''); onVerificationUpdate(); }
    };

    return (
      <div className="cp-gate">
        <div className="cp-gate-box">
          <div className="cp-gate-icon" style={{ background: '#e8f0fe', color: '#1a47a0' }}>
            <IconShield size={22} />
          </div>
          <h3 className="cp-gate-title">Set Ownership Verification</h3>
          <p className="cp-gate-desc">
            Set a secret question only the true owner would know. The claimant must answer correctly to unlock the chat.
          </p>
          <div className="cp-gate-form">
            <label className="cp-gate-label">Secret question</label>
            <input
              className="cp-gate-input"
              placeholder="e.g. What sticker is on the laptop lid?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <label className="cp-gate-label">Correct answer</label>
            <input
              className="cp-gate-input"
              placeholder="Your answer (case-insensitive)"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <button
              className="cp-btn-primary"
              onClick={handleSetQuestion}
              disabled={saving || !question.trim() || !answer.trim()}
            >
              {saving ? 'Saving…' : 'Set verification question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── FOUND PERSON: waiting for claimant ── */
  if (isFoundPerson && verificationStatus === 'pending') {
    return (
      <div className="cp-gate">
        <div className="cp-gate-box">
          <div className="cp-gate-icon" style={{ background: '#fef9e6', color: '#92600a' }}>
            <IconClock size={22} />
          </div>
          <h3 className="cp-gate-title">Waiting for Verification</h3>
          <p className="cp-gate-desc">
            You've set the verification question. Waiting for the claimant to answer correctly.
          </p>
          <div className="cp-info-box cp-info-amber">
            Question: "{verificationData?.question}"
          </div>
          <p style={{ color: '#bbb', fontSize: 12, marginTop: '1rem' }}>
            Attempts used by claimant: {verificationData?.attempts || 0} / {MAX_ATTEMPTS}
          </p>
        </div>
      </div>
    );
  }

  /* ── LOST PERSON: no question yet ── */
  if (isLostPerson && verificationStatus === 'no_question') {
    return (
      <div className="cp-gate">
        <div className="cp-gate-box">
          <div className="cp-gate-icon" style={{ background: '#fef9e6', color: '#92600a' }}>
            <IconClock size={22} />
          </div>
          <h3 className="cp-gate-title">Verification Pending</h3>
          <p className="cp-gate-desc">
            The finder hasn't set a verification question yet. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  /* ── LOST PERSON: answer the question ── */
  if (isLostPerson && verificationStatus === 'pending') {
    const handleAnswer = async () => {
      if (!submitAnswer.trim()) return;
      const res  = await authFetch(`/api/verification/${claimId}`, {
        method: 'POST',
        body: JSON.stringify({ answer: submitAnswer }),
      });
      const data = await res.json();
      setResult(data);
      if (data.passed) {
        onVerificationUpdate();
      } else {
        setSubmitAnswer('');
        onVerificationUpdate();
      }
    };

    return (
      <div className="cp-gate">
        <div className="cp-gate-box">
          <div className="cp-gate-icon" style={{ background: '#e6f4ea', color: '#1a6b3c' }}>
            <IconKey size={22} />
          </div>
          <h3 className="cp-gate-title">Prove You're the Owner</h3>
          <p className="cp-gate-desc">
            Answer the secret question to unlock the chat. You have{' '}
            <strong style={{ color: attemptsLeft <= 1 ? '#b91c1c' : '#92600a' }}>
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''}
            </strong>{' '}
            remaining.
          </p>

          <div className="cp-question-box">
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>?</span>
            <p className="cp-question-text">{verificationData?.question}</p>
          </div>

          <div className="cp-gate-form">
            <label className="cp-gate-label">Your answer</label>
            <input
              className={`cp-gate-input ${result && !result.passed ? 'cp-gate-input-error' : ''}`}
              placeholder="Type your answer…"
              value={submitAnswer}
              onChange={e => setSubmitAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnswer()}
            />
            <button
              className="cp-btn-primary"
              onClick={handleAnswer}
              disabled={!submitAnswer.trim()}
            >
              Submit answer
            </button>

            {result && !result.passed && (
              <div className="cp-info-box cp-info-red">
                <strong>Incorrect answer.</strong> {result.message}
              </div>
            )}
          </div>

          {attemptsLeft <= 1 && !result?.passed && (
            <div className="cp-info-box cp-info-amber" style={{ marginTop: '1rem' }}>
              <strong>Last attempt!</strong> If you answer incorrectly, this chat will be permanently closed.
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Fallback */
  return (
    <div className="cp-gate">
      <p style={{ color: '#bbb', fontSize: 13 }}>Loading verification…</p>
    </div>
  );
}