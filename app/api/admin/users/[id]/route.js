// app/api/admin/users/[id]/route.js
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET — full activity for one user
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // User info
    const [user] = await query(
      `SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?`,
      [id]
    );
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    // Items posted by this user
    const items = await query(
      `SELECT id, type, name, category, location, status, date_occurred, image_url, created_at
       FROM items WHERE user_id = ? ORDER BY created_at DESC`,
      [id]
    );

    // Claims made by this user (as claimant)
    const claimsAsClaimant = await query(
      `SELECT cl.id, cl.status, cl.created_at,
              fi.name AS found_item_name, fi.id AS found_item_id,
              li.name AS lost_item_name,  li.id AS lost_item_id
       FROM claims cl
       JOIN matches m  ON cl.match_id     = m.id
       JOIN items  fi  ON m.found_item_id = fi.id
       JOIN items  li  ON m.lost_item_id  = li.id
       WHERE cl.claimant_id = ?
       ORDER BY cl.created_at DESC`,
      [id]
    );

    // Claims responded to by this user (as respondent / finder)
    const claimsAsRespondent = await query(
      `SELECT cl.id, cl.status, cl.created_at,
              fi.name AS found_item_name, fi.id AS found_item_id,
              li.name AS lost_item_name,  li.id AS lost_item_id
       FROM claims cl
       JOIN matches m  ON cl.match_id     = m.id
       JOIN items  fi  ON m.found_item_id = fi.id
       JOIN items  li  ON m.lost_item_id  = li.id
       WHERE cl.respondent_id = ?
       ORDER BY cl.created_at DESC`,
      [id]
    );

    // Reports filed by this user
    const reports = await query(
      `SELECT r.id, r.reason, r.status, r.admin_notes, r.created_at,
              cl.id AS claim_id
       FROM admin_reports r
       LEFT JOIN claims cl ON r.claim_id = cl.id
       WHERE r.reporter_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return Response.json({
      user,
      items:               Array.isArray(items)              ? items              : [],
      claimsAsClaimant:    Array.isArray(claimsAsClaimant)   ? claimsAsClaimant   : [],
      claimsAsRespondent:  Array.isArray(claimsAsRespondent) ? claimsAsRespondent : [],
      reports:             Array.isArray(reports)            ? reports            : [],
    });
  } catch (err) {
    console.error('admin user GET error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — edit user name, email, or password
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { name, email, password } = await req.json();

    // Check email uniqueness if changing
    if (email) {
      const existing = await query(
        `SELECT id FROM users WHERE email = ? AND id != ?`,
        [email, id]
      );
      if ((Array.isArray(existing) ? existing : []).length > 0)
        return Response.json({ error: 'Email already in use by another account' }, { status: 400 });
    }

    // Hash new password if provided
    let passwordHash = null;
    if (password) {
      const bcrypt = await import('bcryptjs');
      passwordHash = await bcrypt.hash(password, 10);
    }

    await query(
      `UPDATE users SET
        name          = COALESCE(?, name),
        email         = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        updated_at    = NOW()
       WHERE id = ?`,
      [name || null, email || null, passwordHash, id]
    );

    const [updated] = await query(
      `SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?`,
      [id]
    );
    return Response.json({ user: updated });
  } catch (err) {
    console.error('admin user PATCH error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove user and all their data
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Prevent deleting yourself
    if (decoded.id === id)
      return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });

    await query(`DELETE FROM users WHERE id = ?`, [id]);
    return Response.json({ success: true });
  } catch (err) {
    console.error('admin user DELETE error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}