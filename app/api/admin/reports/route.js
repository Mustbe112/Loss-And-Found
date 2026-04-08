// /api/admin/reports/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

// POST — user reports a problem
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { claim_id, reason } = await req.json();
    if (!reason) return Response.json({ error: 'Reason required' }, { status: 400 });

    await query(
      `INSERT INTO admin_reports (id, reporter_id, claim_id, reason) VALUES (?, ?, ?, ?)`,
      [uuid(), decoded.id, claim_id || null, reason]
    );

    return Response.json({ message: 'Report submitted successfully' }, { status: 201 });
  } catch (err) {
    console.error('FULL ERROR:', err); // add this
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET — admin only: view all reports with full claim/item/user details
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const rows = await query(
      `SELECT
        r.id, r.reason, r.status, r.admin_notes, r.created_at,

        -- Reporter
        ur.id    AS reporter_id,
        ur.name  AS reporter_name,
        ur.email AS reporter_email,

        -- Claim (nullable)
        cl.id     AS claim_id,
        cl.status AS claim_status,

        -- Lost item
        li.id          AS lost_item_id,
        li.name        AS lost_item_name,
        li.category    AS lost_item_category,
        li.location    AS lost_item_location,
        li.image_url   AS lost_item_image_url,
        li.description AS lost_item_description,

        -- Found item
        fi.id          AS found_item_id,
        fi.name        AS found_item_name,
        fi.category    AS found_item_category,
        fi.location    AS found_item_location,
        fi.image_url   AS found_item_image_url,
        fi.description AS found_item_description,

        -- Claimant
        uc.id    AS claimant_id,
        uc.name  AS claimant_name,
        uc.email AS claimant_email,

        -- Respondent
        ures.id    AS respondent_id,
        ures.name  AS respondent_name,
        ures.email AS respondent_email

       FROM admin_reports r
       JOIN users    ur   ON r.reporter_id    = ur.id
       LEFT JOIN claims  cl   ON r.claim_id       = cl.id
       LEFT JOIN matches m    ON cl.match_id      = m.id
       LEFT JOIN items   li   ON m.lost_item_id   = li.id
       LEFT JOIN items   fi   ON m.found_item_id  = fi.id
       LEFT JOIN users   uc   ON cl.claimant_id   = uc.id
       LEFT JOIN users   ures ON cl.respondent_id = ures.id
       ORDER BY r.created_at DESC`
    );

    const reports = (Array.isArray(rows) ? rows : []).map(r => ({
      id: r.id,
      reason: r.reason,
      status: r.status,
      admin_notes: r.admin_notes,
      created_at: r.created_at,
      reporter: { id: r.reporter_id, name: r.reporter_name, email: r.reporter_email },
      claim: r.claim_id ? {
        id: r.claim_id,
        status: r.claim_status,
        claimant:   { id: r.claimant_id,   name: r.claimant_name,   email: r.claimant_email },
        respondent: { id: r.respondent_id,  name: r.respondent_name, email: r.respondent_email },
        lost_item:  { id: r.lost_item_id,   name: r.lost_item_name,  category: r.lost_item_category, location: r.lost_item_location, image_url: r.lost_item_image_url, description: r.lost_item_description },
        found_item: { id: r.found_item_id,  name: r.found_item_name, category: r.found_item_category, location: r.found_item_location, image_url: r.found_item_image_url, description: r.found_item_description },
      } : null,
    }));

    return Response.json({ reports });
  } catch (err) {
    console.error('FULL ERROR:', err); // add this
    return Response.json({ error: err.message }, { status: 500 });
  }
}