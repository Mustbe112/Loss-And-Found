import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH — admin updates report status
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { status, admin_notes } = await req.json();
    const allowed = ['open', 'under_review', 'resolved'];
    if (!allowed.includes(status))
      return Response.json({ error: 'Invalid status' }, { status: 400 });

    await query(
      `UPDATE admin_reports SET status = ?, admin_notes = ? WHERE id = ?`,
      [status, admin_notes || null, id]
    );

    const [report] = await query('SELECT * FROM admin_reports WHERE id = ?', [id]);
    return Response.json({ report });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}