import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return Response.json({ error: 'Missing fields' }, { status: 400 });

    if (newPassword.length < 8)
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const [user] = await query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!user)
      return Response.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid)
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, decoded.id]);

    return Response.json({ message: 'Password updated successfully' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}