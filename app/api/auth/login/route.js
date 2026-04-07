import { query } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: 'All fields required' }, { status: 400 });

    const [user] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user)
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const valid = await comparePassword(password, user.password_hash);
    if (!valid)
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return Response.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}