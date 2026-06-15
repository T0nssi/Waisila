import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  
  if (!key) {
    return new Response(JSON.stringify({ error: 'Key required' }), { status: 400 });
  }
  
  try {
    const collection = await getCollection(COLLECTIONS.PAGES);
    const page = await collection.findOne({ key });
    
    if (!page) {
      return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
    }
    
    return new Response(JSON.stringify(page), { status: 200 });
  } catch (error) {
    console.error('Page GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch page' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    const collection = await getCollection(COLLECTIONS.PAGES);
    
    const existing = await collection.findOne({ key: body.key });
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
    }
    
    const { key, ...updates } = body;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    await collection.updateOne({ key: body.key }, { $set: updated });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Page PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update page' }), { status: 500 });
  }
};
