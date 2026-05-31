import type { APIRoute } from 'astro';
import { readJson, writeJson } from '../../../lib/jsonDb';
import { getSession } from '../../../middleware/auth';

function generateId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = readJson();
  return new Response(JSON.stringify(data.products), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readJson();
  
  const newProduct = {
    id: generateId(),
    slug: body.slug || generateSlug(body.name || 'product'),
    name: body.name || '',
    en: body.en || '',
    category: body.category || 'marble',
    image: body.image || '',
    origin: body.origin || '',
    finish: body.finish || 'Polish',
    usage: body.usage || '',
    active: body.active !== false,
    sort: data.products.filter((p: any) => p.category === body.category).length + 1,
  };
  
  if (data.products.some((p: any) => p.slug === newProduct.slug)) {
    newProduct.slug = newProduct.slug + '-' + Date.now().toString(36);
  }
  
  data.products.push(newProduct);
  writeJson(data);
  
  return new Response(JSON.stringify(newProduct), { status: 201 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readJson();
  
  const index = data.products.findIndex((p: any) => p.id === body.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }
  
  if (body.slug && body.slug !== data.products[index].slug) {
    if (data.products.some((p: any) => p.slug === body.slug && p.id !== body.id)) {
      body.slug = body.slug + '-' + Date.now().toString(36);
    }
  }
  
  data.products[index] = { ...data.products[index], ...body };
  writeJson(data);
  
  return new Response(JSON.stringify(data.products[index]), { status: 200 });
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  }
  
  const data = readJson();
  const index = data.products.findIndex((p: any) => p.id === id);
  
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }
  
  data.products.splice(index, 1);
  writeJson(data);
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
