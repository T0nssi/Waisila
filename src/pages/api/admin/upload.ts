import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), { status: 400 });
    }

    // Only ever write into a known asset folder. `folder` arrives from the
    // client, so "../../src" or an absolute path must not be able to escape
    // public/assets.
    const ALLOWED_FOLDERS = ['products', 'portfolio', 'services', 'pages', 'uploads'];
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return new Response(JSON.stringify({ error: 'Invalid folder' }), { status: 400 });
    }

    // Derive the extension from the validated MIME type rather than the
    // attacker-supplied filename, so an "image/png" can't land as .html.
    const EXT_BY_TYPE: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = EXT_BY_TYPE[file.type];
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'assets', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const buffer = await file.arrayBuffer();
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(buffer));

    // Return public URL
    const url = `/assets/${folder}/${filename}`;

    return new Response(JSON.stringify({ 
      success: true, 
      url,
      filename 
    }), { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
