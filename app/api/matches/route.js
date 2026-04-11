import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { matchItems } from '@/lib/gemini';
import { v4 as uuid } from 'uuid';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { item_id } = await req.json();

    const [item] = await query('SELECT * FROM items WHERE id = ?', [item_id]);
    if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
    if (item.user_id !== decoded.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    const candidates = await query(
      `SELECT * FROM items WHERE type = ? AND status = 'active' AND user_id != ?`,
      [oppositeType, decoded.id]
    );

    if (candidates.length === 0)
      return Response.json({ message: 'No candidates to match against', matches: [] });

    const results = [];

    for (const candidate of candidates) {
      const lostItem  = item.type === 'lost' ? item : candidate;
      const foundItem = item.type === 'found' ? item : candidate;

      const existing = await query(
        `SELECT id FROM matches WHERE lost_item_id = ? AND found_item_id = ?`,
        [lostItem.id, foundItem.id]
      );
      if (existing.length > 0) continue;

      let aiResult;
      try {
        aiResult = await matchItems(lostItem, foundItem);
        console.log(`[match] ${lostItem.name} ↔ ${foundItem.name}: score=${aiResult.score}`);
      } catch (err) {
        console.error('[match] matchItems failed:', err.message);
        continue;
      }

      if (aiResult?.score >= 50) {
        const matchId = uuid();
        await query(
          `INSERT INTO matches (id, lost_item_id, found_item_id, score, confidence, explanation)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [matchId, lostItem.id, foundItem.id, aiResult.score, aiResult.confidence, aiResult.explanation]
        );

        await query(
          `INSERT INTO notifications (id, user_id, match_id, type, message)
           VALUES (?, ?, ?, 'match_found', ?)`,
          [uuid(), lostItem.user_id, matchId, `We found a possible match for your lost item: ${lostItem.name}`]
        );

        await query(
          `INSERT INTO notifications (id, user_id, match_id, type, message)
           VALUES (?, ?, ?, 'match_found', ?)`,
          [uuid(), foundItem.user_id, matchId, `Someone may be looking for the item you found: ${foundItem.name}`]
        );

        results.push({ match_id: matchId, candidate_id: candidate.id, ...aiResult });
      }
    }

    return Response.json({ matches: results });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/matches
// - Filters out 'rejected' matches (no reason to show them)
// - Keeps 'resolved' matches visible so users can see completed ones
// - LEFT JOINs claims so notifications page knows claim_status per match
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const matches = await query(
    `SELECT
       m.*,
       li.name      AS lost_item_name,
       li.category  AS lost_category,
       li.image_url AS lost_image,
       li.user_id   AS lost_user_id,
       fi.name      AS found_item_name,
       fi.category  AS found_category,
       fi.image_url AS found_image,
       fi.user_id   AS found_user_id,
       lu.name      AS lost_user_name,
       fu.name      AS found_user_name,
       c.id         AS claim_id,
       c.status     AS claim_status
     FROM matches m
     JOIN  items li ON m.lost_item_id  = li.id
     JOIN  items fi ON m.found_item_id = fi.id
     JOIN  users lu ON li.user_id = lu.id
     JOIN  users fu ON fi.user_id = fu.id
     LEFT JOIN claims c ON c.match_id = m.id
     WHERE (li.user_id = ? OR fi.user_id = ?)
     ORDER BY m.created_at DESC`,
    [decoded.id, decoded.id]
  );

  return Response.json({ matches });
}