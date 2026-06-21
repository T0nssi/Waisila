import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (USE_MONGODB) {
    try {
      const collection = await getCollection(COLLECTIONS.SETTINGS);
      const settings = await collection.findOne({});
      return new Response(JSON.stringify(settings || {}), { status: 200 });
    } catch (error) {
      console.error('MongoDB settings error:', error);
    }
  }

  // Fallback to JSON
  const { readJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
  const settings = readJsonFile(getDataFile('settings.json'), {});
  return new Response(JSON.stringify(settings), { status: 200 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();

    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.SETTINGS);
      const existing = await collection.findOne({});
      const updated = { ...existing, ...body, updatedAt: new Date() };
      
      if (existing) {
        await collection.replaceOne({ _id: existing._id }, updated);
      } else {
        await collection.insertOne({ ...body, createdAt: new Date(), updatedAt: new Date() });
      }
      return new Response(JSON.stringify(updated), { status: 200 });
    }

    // Fallback to JSON
    const { readJsonFile, writeJsonFile, getDataFile } = await import('../../../lib/apiHelpers');
    const settings = readJsonFile(getDataFile('settings.json'), {});
    const updated = { ...settings, ...body };
    writeJsonFile(getDataFile('settings.json'), updated);
    return new Response(JSON.stringify(updated), { status: 200 });

  } catch (error) {
    console.error('Settings PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update settings' }), { status: 500 });
  }
};
