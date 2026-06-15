import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  if (USE_MONGODB) {
    try {
      const collection = await getCollection(COLLECTIONS.PAGES);
      const pages = await collection.find({}).toArray();
      return new Response(JSON.stringify(pages), { status: 200 });
    } catch (error) {
      console.error('MongoDB error, falling back to JSON:', error);
    }
  }
  
  // Fallback to JSON
  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
  return new Response(JSON.stringify(data.pages || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PAGES);
      const existing = await collection.findOne({ key: body.key });
      if (existing) {
        return new Response(JSON.stringify({ error: 'Page key already exists' }), { status: 400 });
      }
      
      const newPage = {
        id: 'page_' + Date.now().toString(36),
        key: body.key,
        name: body.name || '',
        active: body.active !== false,
        images: body.images || [],
        colorStyle: body.colorStyle || '',
        sizeText: body.sizeText || '',
        information: body.information || '',
        contact: body.contact || '',
        social: body.social || {},
        services: body.services || [],
        portfolio: body.portfolio || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await collection.insertOne(newPage);
      return new Response(JSON.stringify(newPage), { status: 201 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
    const existing = data.pages.find((p: any) => p.key === body.key);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Page key already exists' }), { status: 400 });
    }

    const newPage = {
      id: 'page_' + Date.now().toString(36),
      key: body.key,
      name: body.name || '',
      active: body.active !== false,
      images: body.images || [],
      colorStyle: body.colorStyle || '',
      sizeText: body.sizeText || '',
      information: body.information || '',
      contact: body.contact || '',
    };

    data.pages.push(newPage);
    writeJsonFile(getDataFile('pages.json'), data);
    return new Response(JSON.stringify(newPage), { status: 201 });
    
  } catch (error) {
    console.error('Pages POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create page' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PAGES);
      const existing = await collection.findOne({ id: body.id });
      if (!existing) {
        return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
      }
      
      const updated = {
        ...existing,
        ...body,
        updatedAt: new Date(),
      };
      
      await collection.updateOne({ id: body.id }, { $set: updated });
      return new Response(JSON.stringify(updated), { status: 200 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
    const index = data.pages.findIndex((p: any) => p.id === body.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
    }

    data.pages[index] = { ...data.pages[index], ...body };
    writeJsonFile(getDataFile('pages.json'), data);
    return new Response(JSON.stringify(data.pages[index]), { status: 200 });
    
  } catch (error) {
    console.error('Pages PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update page' }), { status: 500 });
  }
};
