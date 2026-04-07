import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

// POST — found user sets a verification question
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { claim_id, question, answer } = await req.json();
    if (!claim_id || !question || !answer)
      return Response.json({ error: 'All fields required' }, { status: 400 });

    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [claim_id]);
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

    // Only respondent (found item owner) can set the question
    if (claim.respondent_id !== decoded.id)
      return Response.json({ error: 'Only the found item owner can set the question' }, { status: 403 });

    // Check if already exists
    const existing = await query('SELECT id FROM verification_questions WHERE claim_id = ?', [claim_id]);
    if (existing.length > 0)
      return Response.json({ error: 'Verification question already set' }, { status: 409 });

    const answer_hash = await bcrypt.hash(answer.toLowerCase().trim(), 10);

    await query(
      `INSERT INTO verification_questions (id, claim_id, question, answer_hash)
       VALUES (?, ?, ?, ?)`,
      [uuid(), claim_id, question, answer_hash]
    );

    // Update claim status to verifying
    await query('UPDATE claims SET status = ? WHERE id = ?', ['verifying', claim_id]);

    // Notify claimant
    await query(
      `INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, 'chat_message', ?)`,
      [uuid(), claim.claimant_id, 'The found user has set a verification question. Please answer it to proceed.']
    );

    return Response.json({ message: 'Verification question set successfully' }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}