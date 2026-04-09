// app/api/admin/items/[id]/deliver/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

/**
 * POST — admin records that the claimant picked up the item in person.
 *
 * Body:
 * {
 *   claim_id:   string,       // the claim being fulfilled
 *   full_name:  string,       // recipient's full name
 *   id_number:  string,       // national ID / student ID / passport
 *   phone:      string,       // contact number
 *   email:      string,       // contact email  (optional)
 *   signature:  string|null,  // base-64 PNG of signature (optional)
 *   notes:      string|null   // any extra admin notes
 * }
 *
 * On success:
 *  - inserts a row into delivery_records
 *  - sets found_items.status = 'delivered'
 *  - sets the matched claim's status = 'completed'
 */
export async function POST(req, { params }) {
  try {
    const { id } = await params; // found item id
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { claim_id, full_name, id_number, phone, email, signature, notes } = await req.json();

    // Basic validation
    if (!claim_id || !full_name || !id_number || !phone) {
      return Response.json(
        { error: 'claim_id, full_name, id_number and phone are required.' },
        { status: 400 }
      );
    }

    const deliveryId = uuid();

    // 1. Store delivery record with recipient personal info
    await query(
      `INSERT INTO delivery_records
         (id, item_id, claim_id, full_name, id_number, phone, email, signature, notes, delivered_at, delivered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        deliveryId,
        id,
        claim_id,
        full_name,
        id_number,
        phone,
        email ?? null,
        signature ?? null,
        notes ?? null,
        decoded.id, // admin user id
      ]
    );

    // 2. Mark the found item as delivered
    await query(
      `UPDATE found_items SET status = 'delivered' WHERE id = ?`,
      [id]
    );

    // 3. Mark the claim as completed
    await query(
      `UPDATE claims SET status = 'completed' WHERE id = ?`,
      [claim_id]
    );

    return Response.json({ success: true, delivery_id: deliveryId });
  } catch (err) {
    console.error('deliver POST error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET — fetch the delivery record for a given item (admin audit view).
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const rows = await query(
      `SELECT dr.*, u.name AS delivered_by_name
       FROM delivery_records dr
       LEFT JOIN users u ON u.id = dr.delivered_by
       WHERE dr.item_id = ?
       ORDER BY dr.delivered_at DESC
       LIMIT 1`,
      [id]
    );

    if (!rows.length) return Response.json({ record: null });
    return Response.json({ record: rows[0] });
  } catch (err) {
    console.error('deliver GET error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}