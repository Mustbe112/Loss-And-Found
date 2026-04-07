import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

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

    const messages = await query(
      `SELECT m.*, u.name as sender_name FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    await query(
      `UPDATE messages SET is_read = true WHERE chat_id = ? AND sender_id != ?`,
      [id, decoded.id]
    );

    return Response.json({ messages });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [chat] = await query('SELECT * FROM chats WHERE id = ?', [id]);
    if (!chat) return Response.json({ error: 'Chat not found' }, { status: 404 });
    if (!chat.is_active) return Response.json({ error: 'Chat is closed' }, { status: 400 });

    if (chat.user1_id !== decoded.id && chat.user2_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { content } = await req.json();
    if (!content) return Response.json({ error: 'Message cannot be empty' }, { status: 400 });

    const msgId = uuid();
    await query(
      `INSERT INTO messages (id, chat_id, sender_id, content) VALUES (?, ?, ?, ?)`,
      [msgId, id, decoded.id, content]
    );

    const otherId = chat.user1_id === decoded.id ? chat.user2_id : chat.user1_id;
    await query(
      `INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, 'chat_message', ?)`,
      [uuid(), otherId, 'You have a new message']
    );

    const [message] = await query(
      `SELECT m.*, u.name as sender_name FROM messages m
       JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
      [msgId]
    );

    return Response.json({ message }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}