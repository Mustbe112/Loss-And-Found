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

    // Find user by email
    const [user] = await query(
      `SELECT id, name, email FROM users WHERE email = ?`,
      [email]
    );

    if (!user) return Response.json({ user: null, claim_id: null });

    // Check if this user has a claim linked to this found item
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

    const { full_name, id_number, phone, email, notes, claim_id } = await req.json();
    if (!full_name || !id_number || !phone)
      return Response.json({ error: 'full_name, id_number and phone are required' }, { status: 400 });

    // Verify item exists and is at_office
    const [item] = await query(
      `SELECT id, name, status FROM items WHERE id = ? AND type = 'found'`,
      [id]
    );
    if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
    if (item.status !== 'at_office')
      return Response.json({ error: 'Item is not currently at the office' }, { status: 400 });

    // Save delivery record — claim_id is linked if found, NULL otherwise
    const deliveryId = uuid();
    await query(
      `INSERT INTO delivery_records
         (id, item_id, claim_id, full_name, id_number, phone, email, notes, delivered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [deliveryId, id, claim_id || null, full_name, id_number, phone, email || null, notes || null, decoded.id]
    );

    // Mark item as resolved
    await query(
      `UPDATE items SET status = 'resolved', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // If there's a claim, mark it approved too
    if (claim_id) {
      await query(
        `UPDATE claims SET status = 'approved', updated_at = NOW() WHERE id = ?`,
        [claim_id]
      );
    }

    return Response.json({ success: true, delivery_id: deliveryId });
  } catch (err) {
    console.error('registry deliver POST error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}