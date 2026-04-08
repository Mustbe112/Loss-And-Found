// /api/verification/[claimId]/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const MAX_ATTEMPTS = 3;

// GET — fetch verification for a claim
export async function GET(req, { params }) {
  try {
    const { claim_id: claimId } = await Promise.resolve(params);
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query(
      'SELECT id, claim_id, question, is_passed, is_locked, attempts FROM verification_questions WHERE claim_id = ?',
      [claimId]
    );

    // Safely handle whatever query() returns
    const verification = Array.isArray(rows) ? (rows[0] ?? null) : null;
    return Response.json({ verification });
  } catch (err) {
    console.error('GET /api/verification error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST — submit an answer (lost person / claimant only)
export async function POST(req, { params }) {
  try {
    const { claim_id: claimId } = await Promise.resolve(params);
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Must be the claimant (lost person)
    const claimRows = await query('SELECT * FROM claims WHERE id = ?', [claimId]);
    const claim = Array.isArray(claimRows) ? claimRows[0] : null;
    if (!claim) return Response.json({ error: 'Claim not found' }, { status: 404 });
    if (claim.claimant_id !== decoded.id)
      return Response.json({ error: 'Only the claimant can answer verification' }, { status: 403 });

    const vRows = await query(
      'SELECT * FROM verification_questions WHERE claim_id = ?',
      [claimId]
    );
    const verification = Array.isArray(vRows) ? vRows[0] : null;
    if (!verification)
      return Response.json({ error: 'No verification question set' }, { status: 404 });

    if (verification.is_locked) {
      return Response.json(
        { passed: false, locked: true, message: 'Chat is permanently closed.' },
        { status: 403 }
      );
    }

    const { answer } = await req.json();

    const correct = await bcrypt.compare(answer.trim().toLowerCase(), verification.answer_hash);

    if (correct) {
      await query(
        'UPDATE verification_questions SET is_passed = 1 WHERE claim_id = ?',
        [claimId]
      );
      return Response.json({ passed: true, message: 'Correct! Chat is now unlocked.' });
    }

    const newAttempts = (verification.attempts || 0) + 1;
    const isNowLocked = newAttempts >= MAX_ATTEMPTS;

    await query(
      'UPDATE verification_questions SET attempts = ?, is_locked = ? WHERE claim_id = ?',
      [newAttempts, isNowLocked ? 1 : 0, claimId]
    );

    if (isNowLocked) {
      return Response.json({
        passed: false,
        locked: true,
        message: 'You have exceeded the maximum attempts. This chat is now permanently closed.',
      });
    }

    return Response.json({
      passed: false,
      locked: false,
      attemptsLeft: MAX_ATTEMPTS - newAttempts,
      message: 'Incorrect answer. Please try again.',
    });
  } catch (err) {
    console.error('POST /api/verification/[claimId] error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}