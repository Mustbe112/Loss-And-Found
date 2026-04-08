import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/matches/[id] — get a single match with full found & lost item details
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [match] = await query(
      `SELECT 
        m.*,
        -- Lost item fields
        li.id           AS lost_item_id,
        li.name         AS lost_item_name,
        li.category     AS lost_item_category,
        li.location     AS lost_item_location,
        li.date_occurred AS lost_item_date,
        li.description  AS lost_item_description,
        li.image_url    AS lost_item_image_url,
        li.user_id      AS lost_user_id,

        -- Found item fields
        fi.id           AS found_item_id,
        fi.name         AS found_item_name,
        fi.category     AS found_item_category,
        fi.location     AS found_item_location,
        fi.date_occurred AS found_item_date,
        fi.description  AS found_item_description,
        fi.image_url    AS found_item_image_url,
        fi.user_id      AS found_user_id,

        -- User names
        ul.name AS lost_user_name,
        uf.name AS found_user_name

       FROM matches m
       JOIN items li ON m.lost_item_id  = li.id
       JOIN items fi ON m.found_item_id = fi.id
       JOIN users ul ON li.user_id = ul.id
       JOIN users uf ON fi.user_id = uf.id
       WHERE m.id = ?`,
      [id]
    );

    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });

    // Only the lost or found item owner can view this match
    if (match.lost_user_id !== decoded.id && match.found_user_id !== decoded.id)
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const result = {
      id: match.id,
      score: match.score,
      confidence: match.confidence,
      status: match.status,
      explanation: match.explanation,
      lost_user_name: match.lost_user_name,
      found_user_name: match.found_user_name,
      lost_item: {
        id: match.lost_item_id,
        name: match.lost_item_name,
        category: match.lost_item_category,
        location: match.lost_item_location,
        date: match.lost_item_date,
        description: match.lost_item_description,
        image_url: match.lost_item_image_url,
      },
      found_item: {
        id: match.found_item_id,
        name: match.found_item_name,
        category: match.found_item_category,
        location: match.found_item_location,
        date: match.found_item_date,
        description: match.found_item_description,
        image_url: match.found_item_image_url,
      },
    };

    return Response.json({ match: result });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}