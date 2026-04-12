// app/api/admin/management/resolve/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

// POST — two actions:
//   action: 'checkin_existing'  → found item already posted → mark at_office
//                                  if it was matched to a lost item → also resolve that lost item
//   action: 'checkin_new'       → found item not posted yet → admin creates it → mark at_office
//   action: 'walkin_no_account' → finder has no account → admin creates found item → mark at_office
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── 1. Existing found item posted by user ──────────────────────────────
    if (action === 'checkin_existing') {
      const { item_id } = body;
      if (!item_id) return Response.json({ error: 'item_id required' }, { status: 400 });

      // Mark found item as at_office
      await query(
        `UPDATE items SET status = 'at_office', updated_at = NOW() WHERE id = ? AND type = 'found'`,
        [item_id]
      );

      // If this found item is part of a match that has a lost item → resolve the lost item too
      await query(
        `UPDATE items SET status = 'resolved', updated_at = NOW()
         WHERE id IN (
           SELECT lost_item_id FROM matches WHERE found_item_id = ?
         )`,
        [item_id]
      );

      return Response.json({ success: true, message: 'Found item checked in to office.' });
    }

    // ── 2. User has account but hasn't posted the found item yet ───────────
    if (action === 'checkin_new') {
      const { user_id, name, category, location, date_occurred, description, image_url } = body;
      if (!user_id || !name || !category || !location)
        return Response.json({ error: 'user_id, name, category, location are required' }, { status: 400 });

      const newId = uuid();
      await query(
        `INSERT INTO items (id, user_id, type, name, category, location, date_occurred, description, image_url, status)
         VALUES (?, ?, 'found', ?, ?, ?, ?, ?, ?, 'at_office')`,
        [newId, user_id, name, category, location, date_occurred || null, description || null, image_url || null]
      );

      return Response.json({ success: true, message: 'New found item created and checked in.', item_id: newId });
    }

    // ── 3. Finder has NO account — admin fills everything ──────────────────
    if (action === 'walkin_no_account') {
      const { finder_name, finder_email, finder_phone, name, category, location, date_occurred, description, image_url } = body;
      if (!finder_name || !name || !category || !location)
        return Response.json({ error: 'finder_name, name, category, location are required' }, { status: 400 });

      // Store as a found item under a special admin-owned record
      // We use the admin's own user id as owner since there's no real account
      const newId = uuid();
      await query(
        `INSERT INTO items (id, user_id, type, name, category, location, date_occurred, description, image_url, status)
         VALUES (?, ?, 'found', ?, ?, ?, ?, ?, ?, 'at_office')`,
        [newId, decoded.id, name, category, location, date_occurred || null,
         `[Walk-in] Finder: ${finder_name}${finder_email ? ` (${finder_email})` : ''}${finder_phone ? ` Tel: ${finder_phone}` : ''}. ${description || ''}`.trim(),
         image_url || null]
      );

      return Response.json({ success: true, message: 'Walk-in item saved to registry.', item_id: newId });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('management resolve error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}