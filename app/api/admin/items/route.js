import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const items = await query(
    `SELECT i.*, u.name as user_name, u.email as user_email
     FROM items i
     JOIN users u ON i.user_id = u.id
     ORDER BY i.created_at DESC`
  );

  return Response.json({ items });
}