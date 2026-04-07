import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

// GET — get the question only (not the answer)
export async function GET(req, { params }) {
  const { claim_id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [claim] = await query('SELECT * FROM claims WHERE id = ?', [claim_id]);
  if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

  if (claim.claimant_id !== decoded.id && claim.respondent_id !== decoded.id)
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  const [vq] = await query(
    'SELECT id, claim_id, question, is_passed, created_at FROM verification_questions WHERE claim_id = ?',
    [claim_id]
  );
  if (!vq) return Response.json({ error: 'No verification question set yet' }, { status: 404 });

  return Response.json({ verification: vq });
}

// POST — claimant submits their answer
export async function POST(req, { params }) {
  try {
    const { claim_id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [claim] = await query('SELECT * FROM claims WHERE id = ?', [claim_id]);
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });

    // Only claimant can submit answer
    if (claim.claimant_id !== decoded.id)
      return Response.json({ error: 'Only the claimant can submit an answer' }, { status: 403 });

    const { answer } = await req.json();
    if (!answer) return Response.json({ error: 'Answer required' }, { status: 400 });

    const [vq] = await query(
      'SELECT * FROM verification_questions WHERE claim_id = ?',
      [claim_id]
    );
    if (!vq) return Response.json({ error: 'No verification question found' }, { status: 404 });

    const isCorrect = await bcrypt.compare(answer.toLowerCase().trim(), vq.answer_hash);

    // Save submitted answer and result
    await query(
      `UPDATE verification_questions SET submitted_answer = ?, is_passed = ? WHERE claim_id = ?`,
      [answer, isCorrect, claim_id]
    );

    if (isCorrect) {
      // Notify respondent
      await query(
        `INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, 'chat_message', ?)`,
        [uuid(), claim.respondent_id, 'The claimant answered the verification question correctly!']
      );

      return Response.json({ passed: true, message: 'Correct! You can proceed with the handover.' });
    } else {
      // Notify respondent
      await query(
        `INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, 'chat_message', ?)`,
        [uuid(), claim.respondent_id, 'The claimant answered the verification question incorrectly.']
      );

      return Response.json({ passed: false, message: 'Incorrect answer. Please try again or contact admin.' });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}