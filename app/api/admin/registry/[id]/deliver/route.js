// app/api/admin/registry/[id]/deliver/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

// GET — lookup user by email + find their claim for this item (if any)
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim();
    if (!email) return Response.json({ user: null, claim_id: null });

    const [user] = await query(
      `SELECT id, name, email FROM users WHERE email = ?`,
      [email]
    );
    if (!user) return Response.json({ user: null, claim_id: null });

    const [claim] = await query(
      `SELECT cl.id AS claim_id
       FROM claims cl
       JOIN matches m ON cl.match_id = m.id
       WHERE m.found_item_id = ? AND cl.claimant_id = ?
       LIMIT 1`,
      [id, user.id]
    );

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email },
      claim_id: claim?.claim_id || null,
    });
  } catch (err) {
    console.error('registry deliver GET error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST — save delivery record and mark item resolved
// body: { full_name, id_number, phone, email, notes, claim_id (optional) }
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { claim_id, full_name, id_number, phone, email, signature, notes } = await req.json();

    // ✅ claim_id is now optional
    if (!full_name || !id_number || !phone) {
      return Response.json(
        { error: 'full_name, id_number and phone are required.' },
        { status: 400 }
      );
    }

    // Verify found item exists
    const [foundItem] = await query(
      `SELECT id, name, category, status FROM items WHERE id = ? AND type = 'found'`,
      [id]
    );
    if (!foundItem) return Response.json({ error: 'Item not found' }, { status: 404 });

    const deliveryId = uuid();

    // 1. Store delivery record
    await query(
      `INSERT INTO delivery_records
         (id, item_id, claim_id, full_name, id_number, phone, email, signature, notes, delivered_at, delivered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [deliveryId, id, claim_id || null, full_name, id_number, phone,
       email ?? null, signature ?? null, notes ?? null, decoded.id]
    );

    // 2. Mark found item as resolved
    await query(
      `UPDATE items SET status = 'resolved', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // 3. Mark claim as completed if provided
    if (claim_id) {
      await query(
        `UPDATE claims SET status = 'completed', updated_at = NOW() WHERE id = ?`,
        [claim_id]
      );
    }

    // ✅ 4. Resolve the matching lost item by email
    if (email) {
      const [recipient] = await query(
        `SELECT id FROM users WHERE email = ?`,
        [email]
      );

      if (recipient) {
        // Priority 1: resolve via matches table
        const [matchedLost] = await query(
          `SELECT i.id FROM matches m
           JOIN items i ON i.id = m.lost_item_id
           WHERE m.found_item_id = ?
             AND i.user_id = ?
             AND i.type = 'lost'
             AND i.status != 'resolved'
           LIMIT 1`,
          [id, recipient.id]
        );

        if (matchedLost) {
          await query(
            `UPDATE items SET status = 'resolved', updated_at = NOW() WHERE id = ?`,
            [matchedLost.id]
          );
        } else {
          // Priority 2: same category, most recent lost item
          await query(
            `UPDATE items
             SET status = 'resolved', updated_at = NOW()
             WHERE type = 'lost'
               AND user_id = ?
               AND category = ?
               AND status NOT IN ('resolved', 'closed')
             ORDER BY created_at DESC
             LIMIT 1`,
            [recipient.id, foundItem.category]
          );
        }
      }
    }

    return Response.json({ success: true, delivery_id: deliveryId });
  } catch (err) {
    console.error('deliver POST error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}