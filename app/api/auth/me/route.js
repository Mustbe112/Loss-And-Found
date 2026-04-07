import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!user)
      return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json({ user });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}