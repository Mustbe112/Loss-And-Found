import { query } from '@/lib/db';

export async function GET(req) {
  // This route is called by a cron job or manually
  const secret = req.headers.get('x-cleanup-secret');
  if (secret !== process.env.CLEANUP_SECRET)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Find resolved claims older than 24 hours
    const resolvedClaims = await query(
      `SELECT c.id, ch.id as chat_id 
       FROM claims c
       JOIN chats ch ON ch.claim_id = c.id
       WHERE c.status IN ('confirmed', 'rejected')
       AND c.updated_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    for (const claim of resolvedClaims) {
      // Get images to delete from Cloudinary
      const images = await query(
        `SELECT image_url FROM messages WHERE chat_id = ? AND image_url IS NOT NULL`,
        [claim.chat_id]
      );

      // Delete Cloudinary images
      if (images.length > 0) {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        for (const img of images) {
          const publicId = img.image_url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`lost-and-found/${publicId}`);
        }
      }

      // Delete messages
      await query('DELETE FROM messages WHERE chat_id = ?', [claim.chat_id]);

      // Delete verification data
      await query('DELETE FROM verification_questions WHERE claim_id = ?', [claim.id]);

      // Close chat
      await query('UPDATE chats SET is_active = false WHERE id = ?', [claim.chat_id]);
    }

    return Response.json({ cleaned: resolvedClaims.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}