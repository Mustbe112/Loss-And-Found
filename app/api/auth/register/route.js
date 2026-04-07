import { query } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return Response.json({ error: 'All fields required' }, { status: 400 });

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return Response.json({ error: 'Email already registered' }, { status: 409 });

    const id = uuid();
    const password_hash = await hashPassword(password);

    await query(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, name, email, password_hash]
    );

    const token = signToken({ id, email, role: 'user' });

    return Response.json({ token, user: { id, name, email, role: 'user' } }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}