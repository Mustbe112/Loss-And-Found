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
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// GET — admin only: view all reports
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const reports = await query(
    `SELECT r.*, u.name as reporter_name, u.email as reporter_email
     FROM admin_reports r
     JOIN users u ON r.reporter_id = u.id
     ORDER BY r.created_at DESC`
  );

  return Response.json({ reports });
}