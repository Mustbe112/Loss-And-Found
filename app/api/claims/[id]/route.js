import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { matchItems } from '@/lib/gemini';
import { v4 as uuid } from 'uuid';

// PATCH /api/claims/[id] — update claim status
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [id]);
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

    if (claim.claimant_id !== decoded.id && claim.respondent_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { status } = await req.json();
    const allowed = ['pending', 'verifying', 'confirmed', 'rejected', 'disputed'];
    if (!allowed.includes(status))
      return Response.json({ error: 'Invalid status' }, { status: 400 });

    await query('UPDATE claims SET status = ? WHERE id = ?', [status, id]);

    // ── CONFIRMED: mark everything resolved ──────────────────────────────
    if (status === 'confirmed') {
      const [match] = await query('SELECT * FROM matches WHERE id = ?', [claim.match_id]);
      await query('UPDATE items SET status = ? WHERE id = ?', ['resolved', match.lost_item_id]);
      await query('UPDATE items SET status = ? WHERE id = ?', ['resolved', match.found_item_id]);
      await query('UPDATE matches SET status = ? WHERE id = ?', ['resolved', claim.match_id]);
    }

    // ── REJECTED: mark match rejected, reset items, re-run AI matching ───
    if (status === 'rejected') {
      const [match] = await query('SELECT * FROM matches WHERE id = ?', [claim.match_id]);

      // 1. Mark the rejected match as 'rejected' — NOT back to pending.
      //    This is the key fix: notifications page reads match.status,
      //    so keeping it 'pending' is what caused the button to stay visible.
      await query(`UPDATE matches SET status = 'rejected' WHERE id = ?`, [match.id]);

      // 2. Reset both items back to active so they can be rematched
      await query(
        `UPDATE items SET status = 'active' WHERE id = ? OR id = ?`,
        [match.lost_item_id, match.found_item_id]
      );

      // 3. Get the lost item to re-match against all active found items
      const [lostItem] = await query('SELECT * FROM items WHERE id = ?', [match.lost_item_id]);

      const candidates = await query(
        `SELECT * FROM items WHERE type = 'found' AND status = 'active' AND user_id != ?`,
        [lostItem.user_id]
      );

      // 4. Notify claimant the claim was rejected
      await query(
        `INSERT INTO notifications (id, user_id, match_id, type, message)
         VALUES (?, ?, ?, 'claim_rejected', ?)`,
        [uuid(), claim.claimant_id, claim.match_id,
          `Your claim for "${lostItem.name}" was rejected. We'll keep searching for matches.`]
      );

      // 5. Re-run AI matching — each new match gets its OWN fresh record
      for (const candidate of candidates) {
        if (candidate.id === match.found_item_id) continue;

        // Skip if a non-rejected match already exists between these two
        const existing = await query(
          `SELECT id FROM matches WHERE lost_item_id = ? AND found_item_id = ? AND status != 'rejected'`,
          [lostItem.id, candidate.id]
        );
        if (existing.length > 0) continue;

        let aiResult;
        try {
          aiResult = await matchItems(lostItem, candidate);
          console.log(`[rematch] ${lostItem.name} ↔ ${candidate.name}: score=${aiResult.score}`);
        } catch (err) {
          console.error('[rematch] matchItems failed:', err.message);
          continue;
        }

        if (aiResult?.score >= 50) {
          const matchId = uuid();
          await query(
            `INSERT INTO matches (id, lost_item_id, found_item_id, score, confidence, explanation, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [matchId, lostItem.id, candidate.id, aiResult.score, aiResult.confidence, aiResult.explanation]
          );

          await query(
            `INSERT INTO notifications (id, user_id, match_id, type, message)
             VALUES (?, ?, ?, 'match_found', ?)`,
            [uuid(), lostItem.user_id, matchId,
              `New match found for your lost item: ${lostItem.name}`]
          );

          await query(
            `INSERT INTO notifications (id, user_id, match_id, type, message)
             VALUES (?, ?, ?, 'match_found', ?)`,
            [uuid(), candidate.user_id, matchId,
              `Someone may be looking for the item you found: ${candidate.name}`]
          );
        }
      }
    }

    const [updated] = await query('SELECT * FROM claims WHERE id = ?', [id]);
    return Response.json({ claim: updated });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}