import { query } from '@/lib/db';

export async function GET() {
  try {
    await query('SELECT 1');
    return Response.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    return Response.json({ status: 'error', message: err.message }, { status: 500 });
  }
}