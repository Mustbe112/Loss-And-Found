'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (adminOnly && user?.role !== 'admin') router.push('/');
    }
  }, [user, loading, adminOnly]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  );

  if (!user) return null;
  if (adminOnly && user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  return children;
}