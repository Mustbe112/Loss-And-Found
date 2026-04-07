import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

// POST /api/claims — create a claim
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { match_id } = await req.json();
    if (!match_id) return Response.json({ error: 'match_id required' }, { status: 400 });

    // Get match
    const [match] = await query('SELECT * FROM matches WHERE id = ?', [match_id]);
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });

    // Get lost and found items
    const [lostItem] = await query('SELECT * FROM items WHERE id = ?', [match.lost_item_id]);
    const [foundItem] = await query('SELECT * FROM items WHERE id = ?', [match.found_item_id]);

    // Only the lost item owner can claim
    if (lostItem.user_id !== decoded.id)
      return Response.json({ error: 'Only the lost item owner can claim' }, { status: 403 });

    // Check if claim already exists
    const existing = await query('SELECT id FROM claims WHERE match_id = ?', [match_id]);
    if (existing.length > 0)
      return Response.json({ error: 'Claim already exists' }, { status: 409 });

    const claimId = uuid();
    await query(
      `INSERT INTO claims (id, match_id, claimant_id, respondent_id)
       VALUES (?, ?, ?, ?)`,
      [claimId, match_id, lostItem.user_id, foundItem.user_id]
    );

    // Notify found item owner
    await query(
      `INSERT INTO notifications (id, user_id, match_id, type, message)
       VALUES (?, ?, ?, 'claim_request', ?)`,
      [uuid(), foundItem.user_id, match_id, `Someone is claiming the item you found: ${foundItem.name}`]
    );

    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [claimId]);
    return Response.json({ claim }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/claims — get current user's claims
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const claims = await query(
    `SELECT c.*, 
      m.score, m.confidence,
      li.name as lost_item_name, li.image_url as lost_image,
      fi.name as found_item_name, fi.image_url as found_image,
      u1.name as claimant_name, u2.name as respondent_name,
      ch.id as chat_id
     FROM claims c
     JOIN matches m ON c.match_id = m.id
     JOIN items li ON m.lost_item_id = li.id
     JOIN items fi ON m.found_item_id = fi.id
     JOIN users u1 ON c.claimant_id = u1.id
     JOIN users u2 ON c.respondent_id = u2.id
     LEFT JOIN chats ch ON ch.claim_id = c.id
     WHERE c.claimant_id = ? OR c.respondent_id = ?
     ORDER BY c.created_at DESC`,
    [decoded.id, decoded.id]
  );

  return Response.json({ claims });
}