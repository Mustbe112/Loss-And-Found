'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Phone', 'Wallet', 'Bag', 'Keys', 'ID Card', 'Earbuds', 'Laptop', 'Watch', 'Other'];

export default function ReportLostPage() {
  const { authFetch } = useAuth();
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
    reader.onloadend = () => {
      setImage(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await authFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        type: 'lost',
        image_base64: image,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);

    // Trigger AI matching
    await authFetch('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ item_id: data.item.id }),
    });

    router.push('/dashboard');
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>📦 Report Lost Item</h1>
          <p style={subtitleStyle}>Fill in the details of your lost item</p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit} style={formStyle}>
            <Field label="Item Name">
              <input
                type="text"
                placeholder="e.g. Black iPhone 14"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Description">
              <textarea
                placeholder="Describe the item in detail (color, brand, unique marks, stickers...)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </Field>

            <Field label="Last Seen Location">
              <input
                type="text"
                placeholder="e.g. Library 2nd Floor"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
              />
            </Field>

            <Field label="Date Lost">
              <input
                type="date"
                value={form.date_occurred}
                onChange={e => setForm({ ...form, date_occurred: e.target.value })}
                required
              />
            </Field>

            <Field label="Image (optional)">
              <input type="file" accept="image/*" onChange={handleImage} />
              {preview && (
                <img src={preview} alt="preview" style={previewStyle} />
              )}
            </Field>

            <div style={btnRowStyle}>
              <button type="button" onClick={() => router.back()} style={btnSecondary}>
                Cancel
              </button>
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? 'Submitting...' : 'Report Lost Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Field({ label, children }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const pageStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '2rem',
};

const cardStyle = {
  background: '#1a1a2e',
  borderRadius: '12px',
  padding: '2.5rem',
  border: '1px solid #333',
};

const titleStyle = {
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: '#e94560',
  marginBottom: '0.5rem',
};

const subtitleStyle = {
  color: '#aaa',
  marginBottom: '2rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const labelStyle = {
  color: '#ccc',
  fontSize: '0.9rem',
  fontWeight: '500',
};

const errorStyle = {
  background: '#ff000020',
  border: '1px solid #ff000060',
  color: '#ff6b6b',
  padding: '0.8rem',
  borderRadius: '6px',
  marginBottom: '1rem',
  fontSize: '0.9rem',
};

const previewStyle = {
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginTop: '0.5rem',
  border: '1px solid #333',
};

const btnRowStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '0.5rem',
};

const btnPrimary = {
  flex: 1,
  background: '#e94560',
  color: '#fff',
  border: 'none',
  padding: '0.8rem',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const btnSecondary = {
  flex: 1,
  background: 'transparent',
  color: '#fff',
  border: '1px solid #444',
  padding: '0.8rem',
  borderRadius: '6px',
  fontSize: '1rem',
};