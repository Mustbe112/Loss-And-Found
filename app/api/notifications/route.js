import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET — get current user notifications
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [decoded.id]
  );

  return Response.json({ notifications });
}

// PATCH — mark all as read
export async function PATCH(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await query('UPDATE notifications SET is_read = true WHERE user_id = ?', [decoded.id]);
  return Response.json({ message: 'All notifications marked as read' });
}