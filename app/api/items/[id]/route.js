import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [item] = await query('SELECT * FROM items WHERE id = ?', [id]);
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({ item });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [item] = await query('SELECT * FROM items WHERE id = ?', [id]);
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
  if (item.user_id !== decoded.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { name, description, category, location, date_occurred, status } = await req.json();

  await query(
    `UPDATE items SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      location = COALESCE(?, location),
      date_occurred = COALESCE(?, date_occurred),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [name || null, description || null, category || null, location || null, date_occurred || null, status || null, id]
  );

  const [updated] = await query('SELECT * FROM items WHERE id = ?', [id]);
  return Response.json({ item: updated });
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [item] = await query('SELECT * FROM items WHERE id = ?', [id]);
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    if (item.user_id !== decoded.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (item.status === 'resolved')
      return Response.json({ error: 'Cannot delete a resolved item' }, { status: 400 });

    await query('DELETE FROM items WHERE id = ?', [id]);
    return Response.json({ message: 'Deleted' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}