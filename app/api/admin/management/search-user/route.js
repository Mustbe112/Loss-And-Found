// app/api/admin/management/search-user/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q) return Response.json({ users: [] });

    const users = await query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE role != 'admin' AND (name LIKE ? OR email LIKE ?)
       LIMIT 10`,
      [`%${q}%`, `%${q}%`]
    );

    // For each user, fetch their FOUND items only
    const result = [];
    for (const user of (Array.isArray(users) ? users : [])) {
      const items = await query(
        `SELECT id, name, category, location, date_occurred, description, image_url, status
         FROM items
         WHERE user_id = ? AND type = 'found'
         ORDER BY created_at DESC`,
        [user.id]
      );
      result.push({ ...user, found_items: Array.isArray(items) ? items : [] });
    }

    return Response.json({ users: result });
  } catch (err) {
    console.error('management search-user error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}