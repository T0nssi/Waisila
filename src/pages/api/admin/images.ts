import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { getSession } from '../../../middleware/auth';
import { readdirSync } from 'fs';
import { join } from 'path';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

// GET - list images (local files or library URLs)
export const GET: APIRoute = async ({ cookies, request }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const folder = url.searchParams.get('folder');
  const tab = url.searchParams.get('tab') || 'local';

  // If folder specified or tab=local with no folder, list local files
  if (folder !== null || tab === 'local') {
    try {
      const folderPath = folder || '';
      const publicPath = join(process.cwd(), 'public', 'assets', folderPath);
      const files = readdirSync(publicPath, { withFileTypes: true });
      const images = files.map(entry => ({
        name: entry.name,
        // For subfolders: return relative path for navigation
        // For files: return full URL
        url: entry.isDirectory() 
          ? (folderPath ? folderPath + '/' : '') + entry.name
          : `/assets/${folderPath ? folderPath + '/' : ''}${entry.name}`,
        isFolder: entry.isDirectory(),
        isLibrary: false
      }));
      // Sort: folders first, then files, both alphabetically
      images.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      return new Response(JSON.stringify({ images }), { status: 200 });
    } catch (error) {
      console.error('Error reading folder:', error);
      return new Response(JSON.stringify({ images: [], error: 'Folder not found' }), { status: 200 });
    }
  }

  // tab=library = return images from separate IMAGES collection
  if (USE_MONGODB) {
    try {
      const collection = await getCollection(COLLECTIONS.IMAGES);
      const images = await collection.find({}).toArray();
      const result = images.map((img: any) => ({
        url: img.url,
        name: img.url.split('/').pop() || img.url,
        isFolder: false,
        isLibrary: true
      }));
      return new Response(JSON.stringify({ images: result }), { status: 200 });
    } catch (error) {
      console.error('MongoDB images error:', error);
    }
  }

  // Fallback to settings.json.imagesLibrary
  const { readJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
  const settings = readJsonFile(getDataFile('settings.json'), {});
  const imagesLibrary = settings.imagesLibrary || [];
  const images = imagesLibrary.map((imgUrl: string) => ({
    url: imgUrl,
    name: imgUrl.split('/').pop() || imgUrl,
    isFolder: false,
    isLibrary: true
  }));
  return new Response(JSON.stringify({ images }), { status: 200 });
};

// POST - add image to library
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), { status: 400 });
    }

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.IMAGES);
      // Check if already exists
      const existing = await collection.findOne({ url });
      if (existing) {
        return new Response(JSON.stringify({ success: true, url, message: 'Already exists' }), { status: 200 });
      }
      const newImage = {
        url,
        name: url.split('/').pop() || url,
        addedAt: new Date()
      };
      await collection.insertOne(newImage);
      return new Response(JSON.stringify({ success: true, url }), { status: 200 });
    }

    // Fallback to settings.json.imagesLibrary
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const settings = readJsonFile(getDataFile('settings.json'), { imagesLibrary: [] });
    if (!settings.imagesLibrary.includes(url)) {
      settings.imagesLibrary.push(url);
    }
    writeJsonFile(getDataFile('settings.json'), settings);
    return new Response(JSON.stringify({ success: true, url }), { status: 200 });

  } catch (error) {
    console.error('Images POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add image' }), { status: 500 });
  }
};

// DELETE - remove image from library
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const url = new URL(request.url).searchParams.get('url');

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), { status: 400 });
    }

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.IMAGES);
      await collection.deleteOne({ url });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Fallback to settings.json.imagesLibrary
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const settings = readJsonFile(getDataFile('settings.json'), { imagesLibrary: [] });
    settings.imagesLibrary = settings.imagesLibrary.filter((u: string) => u !== url);
    writeJsonFile(getDataFile('settings.json'), settings);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Images DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete image' }), { status: 500 });
  }
};
