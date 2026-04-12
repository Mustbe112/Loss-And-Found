// app/api/upload/route.js
import { verifyToken } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string')
      return Response.json({ error: 'No file provided' }, { status: 400 });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type))
      return Response.json({ error: 'Only JPEG, PNG, WebP or GIF images are allowed' }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return Response.json({ error: 'Image must be under 5MB' }, { status: 400 });

    const bytes   = await file.arrayBuffer();
    const base64  = Buffer.from(bytes).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const url = await uploadImage(dataUri);
    return Response.json({ url });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}