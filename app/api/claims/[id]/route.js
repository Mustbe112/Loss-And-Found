import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH /api/claims/[id] — update claim status
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;  // await params
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [id]);
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

    // Only claimant or respondent can update
    if (claim.claimant_id !== decoded.id && claim.respondent_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { status } = await req.json();
    const allowed = ['pending', 'verifying', 'confirmed', 'rejected', 'disputed'];
    if (!allowed.includes(status))
      return Response.json({ error: 'Invalid status' }, { status: 400 });

    await query('UPDATE claims SET status = ? WHERE id = ?', [status, id]);

    // If confirmed, mark both items as resolved
    if (status === 'confirmed') {
      const [match] = await query('SELECT * FROM matches WHERE id = ?', [claim.match_id]);
      await query('UPDATE items SET status = ? WHERE id = ?', ['resolved', match.lost_item_id]);
      await query('UPDATE items SET status = ? WHERE id = ?', ['resolved', match.found_item_id]);
      await query('UPDATE matches SET status = ? WHERE id = ?', ['resolved', claim.match_id]);
    }

    const [updated] = await query('SELECT * FROM claims WHERE id = ?', [id]);
    return Response.json({ claim: updated });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}