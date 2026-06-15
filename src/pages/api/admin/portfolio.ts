import type { APIRoute } from 'astro';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';
import { generateId, generateSlug } from '../../../lib/utils';
import { getSession } from '../../../middleware/auth';

export const prerender = false;

const USE_MONGODB = !!process.env.MONGODB_URI;

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  if (USE_MONGODB) {
    try {
      const collection = await getCollection(COLLECTIONS.PORTFOLIO);
      const portfolio = await collection.find({}).toArray();
      return new Response(JSON.stringify(portfolio), { status: 200 });
    } catch (error) {
      console.error('MongoDB error, falling back to JSON:', error);
    }
  }
  
  // Fallback to JSON
  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  return new Response(JSON.stringify(data.portfolio || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PORTFOLIO);
      const slug = body.slug || generateSlug(body.title || 'portfolio');
      const finalSlug = await collection.findOne({ slug })
        ? slug + '-' + Date.now().toString(36)
        : slug;
      const count = await collection.countDocuments({});
      
      const newItem = {
        id: generateId('pf'),
        slug: finalSlug,
        title: body.title || '',
        category: body.category || 'general',
        description: body.description || '',
        image: body.image || '',
        images: body.images || [],
        type: body.type || 'stone',
        active: body.active !== false,
        sort: count + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await collection.insertOne(newItem);
      return new Response(JSON.stringify(newItem), { status: 201 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
    const portfolio = data.portfolio || [];
    const slug = body.slug || generateSlug(body.title || 'portfolio');
    const finalSlug = portfolio.some((p: any) => p.slug === slug) 
      ? slug + '-' + Date.now().toString(36) 
      : slug;
    
    const newItem = {
      id: generateId('pf'),
      slug: finalSlug,
      title: body.title || '',
      category: body.category || 'general',
      description: body.description || '',
      image: body.image || '',
      images: body.images || [],
      type: body.type || 'stone',
      active: body.active !== false,
      sort: portfolio.length + 1,
    };

    portfolio.push(newItem);
    writeJsonFile(getDataFile('portfolio.json'), { portfolio });
    return new Response(JSON.stringify(newItem), { status: 201 });
    
  } catch (error) {
    console.error('Portfolio POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create portfolio item' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PORTFOLIO);
      const existing = await collection.findOne({ id: body.id });
      if (!existing) {
        return new Response(JSON.stringify({ error: 'Portfolio item not found' }), { status: 404 });
      }
      
      let slug = body.slug || existing.slug;
      if (body.slug && body.slug !== existing.slug) {
        const conflict = await collection.findOne({ slug: body.slug, id: { $ne: body.id } });
        if (conflict) {
          slug = body.slug + '-' + Date.now().toString(36);
        }
      }
      
      const updated = {
        ...existing,
        ...body,
        slug,
        updatedAt: new Date(),
      };
      
      await collection.updateOne({ id: body.id }, { $set: updated });
      return new Response(JSON.stringify(updated), { status: 200 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
    const portfolio = data.portfolio || [];
    const index = portfolio.findIndex((p: any) => p.id === body.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Portfolio item not found' }), { status: 404 });
    }

    if (body.slug && body.slug !== portfolio[index].slug) {
      if (portfolio.some((p: any) => p.slug === body.slug && p.id !== body.id)) {
        body.slug = body.slug + '-' + Date.now().toString(36);
      }
    }

    portfolio[index] = { ...portfolio[index], ...body };
    writeJsonFile(getDataFile('portfolio.json'), { portfolio });
    return new Response(JSON.stringify(portfolio[index]), { status: 200 });
    
  } catch (error) {
    console.error('Portfolio PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update portfolio item' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
    }
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PORTFOLIO);
      const result = await collection.deleteOne({ id });
      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Portfolio item not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
    const portfolio = data.portfolio || [];
    const index = portfolio.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Portfolio item not found' }), { status: 404 });
    }

    portfolio.splice(index, 1);
    writeJsonFile(getDataFile('portfolio.json'), { portfolio });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete portfolio item' }), { status: 500 });
  }
};
