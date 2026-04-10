'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Phone', 'Wallet', 'Bag', 'Keys', 'ID Card', 'Earbuds', 'Laptop', 'Watch', 'Other'];

export default function ReportFoundPage() {
  const { authFetch, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', description: '', category: 'Phone',
    location: '', date_occurred: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImage(reader.result); setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await authFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({ ...form, type: 'found', image_base64: image }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    await authFetch('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ item_id: data.item.id }),
    });
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rfi-page { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans', sans-serif; }

        /* NAV */
        .rfi-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 60px; background: #f5f4f0;
          border-bottom: 0.5px solid #ddd; position: sticky; top: 0; z-index: 10;
        }
        .rfi-nav-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0; }
        .rfi-nav-logo svg { width: 18px; height: 18px; stroke: #111; }
        .rfi-nav-brand { font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; color: #111; }
        .rfi-nav-brand span { font-weight: 300; }
        .rfi-nav-links { display: flex; align-items: center; gap: 1.75rem; }
        .rfi-nav-link {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          color: #888; cursor: pointer; background: none; border: none;
          font-family: 'DM Sans', sans-serif; padding: 0; transition: color 0.15s;
          white-space: nowrap;
        }
        .rfi-nav-link:hover { color: #111; }
        .rfi-nav-cta {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          background: #111; color: #fff; border: none; padding: 8px 18px;
          border-radius: 2px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-weight: 500; transition: background 0.15s; white-space: nowrap;
        }
        .rfi-nav-cta:hover { background: #333; }

        /* FORM WRAPPER */
        .rfi-wrapper { max-width: 560px; margin: 0 auto; padding: 3rem 2rem 4rem; }
        .rfi-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #999; margin-bottom: 6px; }
        .rfi-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #111; line-height: 1.15; margin-bottom: 8px; }
        .rfi-title em { font-style: italic; color: #444; }
        .rfi-sub { font-size: 13px; color: #888; font-weight: 300; line-height: 1.6; margin-bottom: 2.25rem; }

        .rfi-error { border: 0.5px solid #111; border-left: 2px solid #111; color: #111; padding: 10px 14px; border-radius: 2px; margin-bottom: 1.5rem; font-size: 13px; }

        /* FIELDS */
        .rfi-form { display: flex; flex-direction: column; }
        .rfi-field { padding: 14px 0; border-top: 0.5px solid #ddd; display: grid; grid-template-columns: 110px 1fr; gap: 12px; align-items: start; }
        .rfi-field:last-of-type { border-bottom: 0.5px solid #ddd; }
        .rfi-flabel { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #888; font-weight: 500; padding-top: 6px; }
        .rfi-field input[type="text"], .rfi-field input[type="date"], .rfi-field select, .rfi-field textarea {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #ccc;
          padding: 5px 0; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          color: #111; outline: none; appearance: none; -webkit-appearance: none; border-radius: 0; transition: border-color 0.15s;
        }
        .rfi-field input:focus, .rfi-field select:focus, .rfi-field textarea:focus { border-bottom-color: #111; }
        .rfi-field input::placeholder, .rfi-field textarea::placeholder { color: #bbb; font-weight: 300; }
        .rfi-field textarea { resize: vertical; min-height: 80px; }
        .rfi-field select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 4px center; padding-right: 18px; cursor: pointer;
        }

        /* FILE UPLOAD */
        .rfi-file-wrap { position: relative; display: inline-flex; }
        .rfi-file-btn {
          display: inline-flex; align-items: center; gap: 6px; background: #fff;
          border: 0.5px solid #ccc; padding: 7px 14px; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; letter-spacing: 0.05em; color: #555;
          cursor: pointer; border-radius: 2px; transition: border-color 0.15s;
        }
        .rfi-file-btn:hover { border-color: #111; }
        .rfi-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .rfi-preview { width: 100%; max-height: 160px; object-fit: cover; margin-top: 10px; border: 0.5px solid #ccc; border-radius: 2px; display: block; filter: grayscale(15%); }

        /* BUTTONS */
        .rfi-btn-row { display: flex; gap: 10px; margin-top: 1.75rem; }
        .rfi-btn-cancel {
          flex: 0 0 auto; background: transparent; color: #888; border: 0.5px solid #ccc;
          padding: 10px 22px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: border-color 0.15s, color 0.15s;
        }
        .rfi-btn-cancel:hover { border-color: #111; color: #111; }
        .rfi-btn-submit {
          flex: 1; background: #111; color: #fff; border: none; padding: 10px 22px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 0.09em;
          text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: background 0.15s;
        }
        .rfi-btn-submit:hover:not(:disabled) { background: #333; }
        .rfi-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          /* Nav: hide text links, keep only sign out */
          .rfi-nav { padding: 0 1.25rem; }
          .rfi-nav-links { gap: 0.75rem; }
          .rfi-nav-link { display: none; }
          .rfi-nav-cta { padding: 7px 14px; font-size: 11px; }

          /* Wrapper */
          .rfi-wrapper { padding: 1.75rem 1.25rem 3rem; }

          /* Title */
          .rfi-title { font-size: 22px; }

          /* Fields: single column */
          .rfi-field {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 12px 0;
          }
          .rfi-flabel { padding-top: 0; }

          /* Inputs: slightly larger tap targets */
          .rfi-field input[type="text"],
          .rfi-field input[type="date"],
          .rfi-field select,
          .rfi-field textarea {
            font-size: 16px; /* prevents iOS zoom */
            padding: 8px 0;
          }

          /* File upload: full width */
          .rfi-file-wrap { width: 100%; }
          .rfi-file-btn { width: 100%; justify-content: center; padding: 10px 14px; }

          /* Buttons: stack vertically, full width */
          .rfi-btn-row { flex-direction: column-reverse; gap: 8px; margin-top: 1.5rem; }
          .rfi-btn-cancel { flex: unset; width: 100%; text-align: center; padding: 11px; }
          .rfi-btn-submit { padding: 13px; font-size: 13px; }
        }
      `}</style>

      <div className="rfi-page">
        <nav className="rfi-nav">
          <div className="rfi-nav-logo" onClick={() => router.push('/')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="rfi-nav-brand">FIND<span>BASE</span></span>
          </div>
          <div className="rfi-nav-links">
            <button className="rfi-nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="rfi-nav-link" onClick={() => router.push('/my-items')}>My Items</button>
            <button className="rfi-nav-cta" onClick={logout}>Sign out</button>
          </div>
        </nav>

        <div className="rfi-wrapper">
          <p className="rfi-eyebrow">Report form</p>
          <h1 className="rfi-title">Something found.<br /><em>Return it right.</em></h1>
          <p className="rfi-sub">Fill in the details so our matching system can reunite the item with its owner.</p>

          {error && <div className="rfi-error">{error}</div>}

          <form className="rfi-form" onSubmit={handleSubmit}>
            <div className="rfi-field">
              <span className="rfi-flabel">Item name</span>
              <input type="text" placeholder="e.g. Black iPhone 14"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="rfi-field">
              <span className="rfi-flabel">Category</span>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rfi-field">
              <span className="rfi-flabel">Description</span>
              <textarea placeholder="Color, brand, unique marks, stickers, serial number..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="rfi-field">
              <span className="rfi-flabel">Location</span>
              <input type="text" placeholder="e.g. Library 2nd Floor"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="rfi-field">
              <span className="rfi-flabel">Date found</span>
              <input type="date" value={form.date_occurred}
                onChange={e => setForm({ ...form, date_occurred: e.target.value })} required />
            </div>
            <div className="rfi-field">
              <span className="rfi-flabel">Photo</span>
              <div>
                <div className="rfi-file-wrap">
                  <label className="rfi-file-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload image
                    <input className="rfi-file-input" type="file" accept="image/*" onChange={handleImage} />
                  </label>
                </div>
                {preview && <img src={preview} alt="preview" className="rfi-preview" />}
              </div>
            </div>

            <div className="rfi-btn-row">
              <button type="button" className="rfi-btn-cancel" onClick={() => router.back()}>Cancel</button>
              <button type="submit" className="rfi-btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}