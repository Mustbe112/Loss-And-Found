import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [user] = await query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (!user)
      return Response.json({ error: 'User not found' }, { status: 404 });

    // Delete claims where user is either the claimant or the respondent
    await query('DELETE FROM claims        WHERE claimant_id = ?',   [decoded.id]);
    await query('DELETE FROM claims        WHERE respondent_id = ?', [decoded.id]);
    await query('DELETE FROM notifications WHERE user_id = ?',       [decoded.id]);
    await query('DELETE FROM items         WHERE user_id = ?',       [decoded.id]);
    await query('DELETE FROM users         WHERE id = ?',            [decoded.id]);

    return Response.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('[DELETE /api/user/delete]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}