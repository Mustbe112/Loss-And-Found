import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [chat] = await query('SELECT * FROM chats WHERE id = ?', [id]);
    if (!chat) return Response.json({ error: 'Chat not found' }, { status: 404 });

    if (chat.user1_id !== decoded.id && chat.user2_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    return Response.json({ chat });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [chat] = await query('SELECT * FROM chats WHERE id = ?', [id]);
    if (!chat) return Response.json({ error: 'Chat not found' }, { status: 404 });

    if (chat.user1_id !== decoded.id && chat.user2_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    await query('DELETE FROM messages WHERE chat_id = ?', [id]);
    await query('DELETE FROM chats WHERE id = ?', [id]);

    return Response.json({ message: 'Chat deleted' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}