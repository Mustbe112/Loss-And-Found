// app/api/admin/users/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim();

    let users;
    if (email) {
      users = await query(
        `SELECT id, name, email, role, avatar_url, created_at, updated_at
         FROM users
         WHERE email LIKE ? AND role != 'admin'
         ORDER BY created_at DESC`,
        [`%${email}%`]
      );
    } else {
      users = await query(
        `SELECT id, name, email, role, avatar_url, created_at, updated_at
         FROM users
         WHERE role != 'admin'
         ORDER BY created_at DESC`
      );
    }

    return Response.json({ users: Array.isArray(users) ? users : [] });
  } catch (err) {
    console.error('admin users GET error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}