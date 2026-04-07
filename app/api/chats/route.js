import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { claim_id } = await req.json();
    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [claim_id]);
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

    if (claim.claimant_id !== decoded.id && claim.respondent_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await query('SELECT * FROM chats WHERE claim_id = ?', [claim_id]);
    if (existing.length > 0) return Response.json({ chat: existing[0] });

    const chatId = uuid();
    await query(
      `INSERT INTO chats (id, claim_id, user1_id, user2_id) VALUES (?, ?, ?, ?)`,
      [chatId, claim_id, claim.claimant_id, claim.respondent_id]
    );

    const [chat] = await query('SELECT * FROM chats WHERE id = ?', [chatId]);
    return Response.json({ chat }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const chats = await query(
      `SELECT c.*, cl.status as claim_status
       FROM chats c
       JOIN claims cl ON c.claim_id = cl.id
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY c.created_at DESC`,
      [decoded.id, decoded.id]
    );

    return Response.json({ chats });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}