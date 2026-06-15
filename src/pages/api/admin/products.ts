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
      const collection = await getCollection(COLLECTIONS.PRODUCTS);
      const products = await collection.find({}).toArray();
      return new Response(JSON.stringify(products), { status: 200 });
    } catch (error) {
      console.error('MongoDB error, falling back to JSON:', error);
    }
  }
  
  // Fallback to JSON
  const data = readJsonFile(getDataFile('products.json'), { products: [] });
  return new Response(JSON.stringify(data.products || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PRODUCTS);
      const slug = body.slug || generateSlug(body.name || 'product');
      const finalSlug = await collection.findOne({ slug }) 
        ? slug + '-' + Date.now().toString(36) 
        : slug;
      const count = await collection.countDocuments({ category: body.category || 'marble' });
      
      const newProduct = {
        id: generateId('p'),
        slug: finalSlug,
        name: body.name || '',
        en: body.en || '',
        category: body.category || 'marble',
        image: body.image || '',
        images: body.images || [],
        origin: body.origin || '',
        finish: body.finish || 'Polish',
        usage: body.usage || '',
        active: body.active !== false,
        sort: count + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(newProduct);
      return new Response(JSON.stringify(newProduct), { status: 201 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('products.json'), { products: [] });
    const products = data.products || [];
    const slug = body.slug || generateSlug(body.name || 'product');
    const finalSlug = products.some((p: any) => p.slug === slug) 
      ? slug + '-' + Date.now().toString(36) 
      : slug;
    
    const newProduct = {
      id: generateId('p'),
      slug: finalSlug,
      name: body.name || '',
      en: body.en || '',
      category: body.category || 'marble',
      image: body.image || '',
      images: body.images || [],
      origin: body.origin || '',
      finish: body.finish || 'Polish',
      usage: body.usage || '',
      active: body.active !== false,
      sort: products.filter((p: any) => p.category === body.category).length + 1,
    };

    products.push(newProduct);
    writeJsonFile(getDataFile('products.json'), { products });
    return new Response(JSON.stringify(newProduct), { status: 201 });
    
  } catch (error) {
    console.error('Products POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (USE_MONGODB) {
      const collection = await getCollection(COLLECTIONS.PRODUCTS);
      const existing = await collection.findOne({ id: body.id });
      if (!existing) {
        return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
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
    const data = readJsonFile(getDataFile('products.json'), { products: [] });
    const products = data.products || [];
    const index = products.findIndex((p: any) => p.id === body.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    if (body.slug && body.slug !== products[index].slug) {
      if (products.some((p: any) => p.slug === body.slug && p.id !== body.id)) {
        body.slug = body.slug + '-' + Date.now().toString(36);
      }
    }

    products[index] = { ...products[index], ...body };
    writeJsonFile(getDataFile('products.json'), { products });
    return new Response(JSON.stringify(products[index]), { status: 200 });
    
  } catch (error) {
    console.error('Products PUT error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
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
      const collection = await getCollection(COLLECTIONS.PRODUCTS);
      const result = await collection.deleteOne({ id });
      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    
    // Fallback to JSON
    const data = readJsonFile(getDataFile('products.json'), { products: [] });
    const products = data.products || [];
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    products.splice(index, 1);
    writeJsonFile(getDataFile('products.json'), { products });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    
  } catch (error) {
    console.error('Products DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete product' }), { status: 500 });
  }
};
