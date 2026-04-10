'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Phone', 'Wallet', 'Bag', 'Keys', 'ID Card', 'Earbuds', 'Laptop', 'Watch', 'Other'];

export default function ReportLostPage() {
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
      body: JSON.stringify({ ...form, type: 'lost', image_base64: image }),
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

        .rfl-page { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans', sans-serif; }

        /* NAV */
        .rfl-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 60px; background: #f5f4f0;
          border-bottom: 0.5px solid #ddd; position: sticky; top: 0; z-index: 10;
        }
        .rfl-nav-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0; }
        .rfl-nav-logo svg { width: 18px; height: 18px; stroke: #111; }
        .rfl-nav-brand { font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 500; color: #111; }
        .rfl-nav-brand span { font-weight: 300; }
        .rfl-nav-links { display: flex; align-items: center; gap: 1.75rem; }
        .rfl-nav-link {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          color: #888; cursor: pointer; background: none; border: none;
          font-family: 'DM Sans', sans-serif; padding: 0; transition: color 0.15s;
          white-space: nowrap;
        }
        .rfl-nav-link:hover { color: #111; }
        .rfl-nav-cta {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          background: #111; color: #fff; border: none; padding: 8px 18px;
          border-radius: 2px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-weight: 500; transition: background 0.15s; white-space: nowrap;
        }
        .rfl-nav-cta:hover { background: #333; }

        /* FORM WRAPPER */
        .rfl-wrapper { max-width: 560px; margin: 0 auto; padding: 3rem 2rem 4rem; }
        .rfl-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #999; margin-bottom: 6px; }
        .rfl-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #111; line-height: 1.15; margin-bottom: 8px; }
        .rfl-title em { font-style: italic; color: #444; }
        .rfl-sub { font-size: 13px; color: #888; font-weight: 300; line-height: 1.6; margin-bottom: 2.25rem; }

        .rfl-error { border: 0.5px solid #111; border-left: 2px solid #111; color: #111; padding: 10px 14px; border-radius: 2px; margin-bottom: 1.5rem; font-size: 13px; }

        /* FIELDS */
        .rfl-form { display: flex; flex-direction: column; }
        .rfl-field { padding: 14px 0; border-top: 0.5px solid #ddd; display: grid; grid-template-columns: 110px 1fr; gap: 12px; align-items: start; }
        .rfl-field:last-of-type { border-bottom: 0.5px solid #ddd; }
        .rfl-flabel { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #888; font-weight: 500; padding-top: 6px; }
        .rfl-field input[type="text"], .rfl-field input[type="date"], .rfl-field select, .rfl-field textarea {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #ccc;
          padding: 5px 0; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          color: #111; outline: none; appearance: none; -webkit-appearance: none; border-radius: 0; transition: border-color 0.15s;
        }
        .rfl-field input:focus, .rfl-field select:focus, .rfl-field textarea:focus { border-bottom-color: #111; }
        .rfl-field input::placeholder, .rfl-field textarea::placeholder { color: #bbb; font-weight: 300; }
        .rfl-field textarea { resize: vertical; min-height: 80px; }
        .rfl-field select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 4px center; padding-right: 18px; cursor: pointer;
        }

        /* FILE UPLOAD */
        .rfl-file-wrap { position: relative; display: inline-flex; }
        .rfl-file-btn {
          display: inline-flex; align-items: center; gap: 6px; background: #fff;
          border: 0.5px solid #ccc; padding: 7px 14px; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; letter-spacing: 0.05em; color: #555;
          cursor: pointer; border-radius: 2px; transition: border-color 0.15s;
        }
        .rfl-file-btn:hover { border-color: #111; }
        .rfl-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .rfl-preview { width: 100%; max-height: 160px; object-fit: cover; margin-top: 10px; border: 0.5px solid #ccc; border-radius: 2px; display: block; filter: grayscale(15%); }

        /* BUTTONS */
        .rfl-btn-row { display: flex; gap: 10px; margin-top: 1.75rem; }
        .rfl-btn-cancel {
          flex: 0 0 auto; background: transparent; color: #888; border: 0.5px solid #ccc;
          padding: 10px 22px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: border-color 0.15s, color 0.15s;
        }
        .rfl-btn-cancel:hover { border-color: #111; color: #111; }
        .rfl-btn-submit {
          flex: 1; background: #111; color: #fff; border: none; padding: 10px 22px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 0.09em;
          text-transform: uppercase; font-weight: 500; cursor: pointer; border-radius: 2px; transition: background 0.15s;
        }
        .rfl-btn-submit:hover:not(:disabled) { background: #333; }
        .rfl-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          /* Nav: hide text links, keep only sign out */
          .rfl-nav { padding: 0 1.25rem; }
          .rfl-nav-links { gap: 0.75rem; }
          .rfl-nav-link { display: none; }
          .rfl-nav-cta { padding: 7px 14px; font-size: 11px; }

          /* Wrapper */
          .rfl-wrapper { padding: 1.75rem 1.25rem 3rem; }

          /* Title */
          .rfl-title { font-size: 22px; }

          /* Fields: single column */
          .rfl-field {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 12px 0;
          }
          .rfl-flabel { padding-top: 0; }

          /* Inputs: font-size 16px prevents iOS auto-zoom on focus */
          .rfl-field input[type="text"],
          .rfl-field input[type="date"],
          .rfl-field select,
          .rfl-field textarea {
            font-size: 16px;
            padding: 8px 0;
          }

          /* File upload: full width */
          .rfl-file-wrap { width: 100%; }
          .rfl-file-btn { width: 100%; justify-content: center; padding: 10px 14px; }

          /* Buttons: stack vertically, full width */
          .rfl-btn-row { flex-direction: column-reverse; gap: 8px; margin-top: 1.5rem; }
          .rfl-btn-cancel { flex: unset; width: 100%; text-align: center; padding: 11px; }
          .rfl-btn-submit { padding: 13px; font-size: 13px; }
        }
      `}</style>

      <div className="rfl-page">
        <nav className="rfl-nav">
          <div className="rfl-nav-logo" onClick={() => router.push('/')}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="rfl-nav-brand">FIND<span>BASE</span></span>
          </div>
          <div className="rfl-nav-links">
            <button className="rfl-nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="rfl-nav-link" onClick={() => router.push('/my-items')}>My Items</button>
            <button className="rfl-nav-cta" onClick={logout}>Sign out</button>
          </div>
        </nav>

        <div className="rfl-wrapper">
          <p className="rfl-eyebrow">Report form</p>
          <h1 className="rfl-title">Something lost.<br /><em>Let's find it.</em></h1>
          <p className="rfl-sub">Describe your item in detail so our matching system can track it down.</p>

          {error && <div className="rfl-error">{error}</div>}

          <form className="rfl-form" onSubmit={handleSubmit}>
            <div className="rfl-field">
              <span className="rfl-flabel">Item name</span>
              <input type="text" placeholder="e.g. Black iPhone 14"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="rfl-field">
              <span className="rfl-flabel">Category</span>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rfl-field">
              <span className="rfl-flabel">Description</span>
              <textarea placeholder="Color, brand, unique marks, stickers, serial number..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="rfl-field">
              <span className="rfl-flabel">Last seen</span>
              <input type="text" placeholder="e.g. Library 2nd Floor"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="rfl-field">
              <span className="rfl-flabel">Date lost</span>
              <input type="date" value={form.date_occurred}
                onChange={e => setForm({ ...form, date_occurred: e.target.value })} required />
            </div>
            <div className="rfl-field">
              <span className="rfl-flabel">Photo</span>
              <div>
                <div className="rfl-file-wrap">
                  <label className="rfl-file-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload image
                    <input className="rfl-file-input" type="file" accept="image/*" onChange={handleImage} />
                  </label>
                </div>
                {preview && <img src={preview} alt="preview" className="rfl-preview" />}
              </div>
            </div>

            <div className="rfl-btn-row">
              <button type="button" className="rfl-btn-cancel" onClick={() => router.back()}>Cancel</button>
              <button type="submit" className="rfl-btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}