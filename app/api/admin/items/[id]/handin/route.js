// app/api/admin/items/[id]/handin/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

// PATCH — admin confirms or rejects physical hand-in
// body: { action: 'confirm' | 'reject', claim_id: string }
export async function PATCH(req, { params }) {
  try {
    const { id } = await params; // found item id
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, claim_id } = await req.json();
    if (!['confirm', 'reject'].includes(action))
      return Response.json({ error: 'Invalid action. Use confirm or reject.' }, { status: 400 });

    if (action === 'confirm') {
      // Insert into handin_confirmations (ignore if already exists)
      await query(
        `INSERT IGNORE INTO handin_confirmations (id, item_id, claim_id) VALUES (?, ?, ?)`,
        [uuid(), id, claim_id]
      );

      // Mark the found item as at_office so it appears in Items at Admin Office
      await query(
        `UPDATE items SET status = 'at_office' WHERE id = ?`,
        [id]
      );
    } else {
      // Remove confirmation if admin changes their mind
      await query(
        `DELETE FROM handin_confirmations WHERE item_id = ?`,
        [id]
      );

      // Revert status back to active so it re-appears in Hand In queue
      await query(
        `UPDATE items SET status = 'active' WHERE id = ?`,
        [id]
      );
    }

    return Response.json({ success: true, action });
  } catch (err) {
    console.error('handin PATCH error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}