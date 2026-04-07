import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { v4 as uuid } from 'uuid';

// GET /api/items — get current user's items
export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // lost | found

  let sql = 'SELECT * FROM items WHERE user_id = ?';
  const params = [decoded.id];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY created_at DESC';

  const items = await query(sql, params);
  return Response.json({ items });
}

// POST /api/items — report new item
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, category, location, date_occurred, image_base64, type } = body;

    if (!name || !category || !location || !date_occurred || !type)
      return Response.json({ error: 'Missing required fields' }, { status: 400 });

    let image_url = null;
    if (image_base64) {
      image_url = await uploadImage(image_base64);
    }

    const id = uuid();
    await query(
      `INSERT INTO items (id, user_id, type, name, description, category, location, date_occurred, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, decoded.id, type, name, description, category, location, date_occurred, image_url]
    );

    const [item] = await query('SELECT * FROM items WHERE id = ?', [id]);
    return Response.json({ item }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}