// app/api/admin/registry/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'pending'; // 'pending' | 'history'

    if (tab === 'pending') {
      // All found items currently at office (not yet delivered/resolved)
      const rows = await query(
        `SELECT
          i.id, i.name, i.category, i.location, i.date_occurred,
          i.description, i.image_url, i.status, i.created_at,
          u.id   AS user_id,
          u.name AS user_name,
          u.email AS user_email
         FROM items i
         LEFT JOIN users u ON i.user_id = u.id
         WHERE i.type = 'found' AND i.status = 'at_office'
         ORDER BY i.created_at DESC`
      );

      const items = (Array.isArray(rows) ? rows : []).map(r => ({
        id: r.id, name: r.name, category: r.category,
        location: r.location, date_occurred: r.date_occurred,
        description: r.description, image_url: r.image_url,
        status: r.status, created_at: r.created_at,
        submitted_by: r.user_id
          ? { id: r.user_id, name: r.user_name, email: r.user_email }
          : null,
      }));

      return Response.json({ items });

    } else {
      // History — all delivery records with item + recipient info
      const rows = await query(
        `SELECT
          dr.id          AS delivery_id,
          dr.full_name,
          dr.id_number,
          dr.phone,
          dr.email,
          dr.signature,
          dr.notes,
          dr.delivered_at,
          dr.delivered_by,

          i.id           AS item_id,
          i.name         AS item_name,
          i.category     AS item_category,
          i.location     AS item_location,
          i.description  AS item_description,
          i.image_url    AS item_image_url,
          i.status       AS item_status,

          u.name         AS submitted_by_name,
          u.email        AS submitted_by_email

         FROM delivery_records dr
         JOIN items i ON dr.item_id = i.id
         LEFT JOIN users u ON i.user_id = u.id
         ORDER BY dr.delivered_at DESC`
      );

      const records = (Array.isArray(rows) ? rows : []).map(r => ({
        delivery_id:  r.delivery_id,
        delivered_at: r.delivered_at,
        delivered_by: r.delivered_by,
        recipient: {
          full_name: r.full_name,
          id_number: r.id_number,
          phone:     r.phone,
          email:     r.email,
          signature: r.signature,
          notes:     r.notes,
        },
        item: {
          id:          r.item_id,
          name:        r.item_name,
          category:    r.item_category,
          location:    r.item_location,
          description: r.item_description,
          image_url:   r.item_image_url,
          status:      r.item_status,
        },
        submitted_by: r.submitted_by_name
          ? { name: r.submitted_by_name, email: r.submitted_by_email }
          : null,
      }));

      return Response.json({ records });
    }
  } catch (err) {
    console.error('registry GET error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}