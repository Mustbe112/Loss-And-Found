// /api/admin/locked-claims/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const rows = await query(
      `SELECT
        vq.id              AS vq_id,
        vq.claim_id,
        vq.question,
        vq.attempts,
        vq.is_locked,
        vq.created_at      AS vq_created_at,

        -- Claim
        cl.status          AS claim_status,

        -- Lost item
        li.id              AS lost_item_id,
        li.name            AS lost_item_name,
        li.category        AS lost_item_category,
        li.location        AS lost_item_location,
        li.date_occurred   AS lost_item_date,
        li.description     AS lost_item_description,
        li.image_url       AS lost_item_image_url,

        -- Found item
        fi.id              AS found_item_id,
        fi.name            AS found_item_name,
        fi.category        AS found_item_category,
        fi.location        AS found_item_location,
        fi.date_occurred   AS found_item_date,
        fi.description     AS found_item_description,
        fi.image_url       AS found_item_image_url,

        -- Claimant (lost person)
        uc.id              AS claimant_id,
        uc.name            AS claimant_name,
        uc.email           AS claimant_email,

        -- Respondent (found person)
        ur.id              AS respondent_id,
        ur.name            AS respondent_name,
        ur.email           AS respondent_email

       FROM verification_questions vq
       JOIN claims  cl  ON vq.claim_id      = cl.id
       JOIN matches m   ON cl.match_id      = m.id
       JOIN items   li  ON m.lost_item_id   = li.id
       JOIN items   fi  ON m.found_item_id  = fi.id
       JOIN users   uc  ON cl.claimant_id   = uc.id
       JOIN users   ur  ON cl.respondent_id = ur.id
       WHERE vq.is_locked = 1
       ORDER BY vq.created_at DESC`
    );

    const lockedClaims = Array.isArray(rows) ? rows.map(r => ({
      vq_id: r.vq_id,
      claim_id: r.claim_id,
      question: r.question,
      attempts: r.attempts,
      claim_status: r.claim_status,
      created_at: r.vq_created_at,
      claimant: { id: r.claimant_id, name: r.claimant_name, email: r.claimant_email },
      respondent: { id: r.respondent_id, name: r.respondent_name, email: r.respondent_email },
      lost_item: {
        id: r.lost_item_id, name: r.lost_item_name, category: r.lost_item_category,
        location: r.lost_item_location, date: r.lost_item_date,
        description: r.lost_item_description, image_url: r.lost_item_image_url,
      },
      found_item: {
        id: r.found_item_id, name: r.found_item_name, category: r.found_item_category,
        location: r.found_item_location, date: r.found_item_date,
        description: r.found_item_description, image_url: r.found_item_image_url,
      },
    })) : [];

    return Response.json({ lockedClaims });
  } catch (err) {
    console.error('FULL ERROR:', err); // add this
    return Response.json({ error: err.message }, { status: 500 });
  }
}