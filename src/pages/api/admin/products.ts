import type { APIRoute } from 'astro';
import { readProducts } from '../../../lib/jsonDb';
import { getSession } from '../../../middleware/auth';
import fs from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');

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
  const data = readProducts();
  return new Response(JSON.stringify(data.products || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readProducts();
  const products = data.products || [];
  
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
    sort: products.filter((p: any) => p.category === body.category).length + 1,
  };
  
  if (products.some((p: any) => p.slug === newProduct.slug)) {
    newProduct.slug = newProduct.slug + '-' + Date.now().toString(36);
  }
  
  products.push(newProduct);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  
  return new Response(JSON.stringify(newProduct), { status: 201 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readProducts();
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
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  
  return new Response(JSON.stringify(products[index]), { status: 200 });
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
  
  const data = readProducts();
  const products = data.products || [];
  const index = products.findIndex((p: any) => p.id === id);
  
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }
  
  products.splice(index, 1);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
