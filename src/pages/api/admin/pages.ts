import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/pages.json');

function readPages() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { pages: [] };
  }
}

function writePages(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const GET: APIRoute = async ({ cookies }) => {
  const session = cookies.get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = readPages();
  return new Response(JSON.stringify(data.pages), { status: 200 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = cookies.get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readPages();
  
  const index = data.pages.findIndex((p: any) => p.id === body.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
  }
  
  data.pages[index] = { ...data.pages[index], ...body };
  writePages(data);
  
  return new Response(JSON.stringify(data.pages[index]), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = cookies.get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const body = await request.json();
  const data = readPages();
  
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
    contact: body.contact || ''
  };
  
  data.pages.push(newPage);
  writePages(data);
  
  return new Response(JSON.stringify(newPage), { status: 201 });
};