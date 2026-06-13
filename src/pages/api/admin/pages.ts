import type { APIRoute } from 'astro';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';
import { getSession } from '../../../middleware/auth';

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
  return new Response(JSON.stringify(data.pages), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
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
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });

  const index = data.pages.findIndex((p: any) => p.id === body.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
  }

  data.pages[index] = { ...data.pages[index], ...body };
  writeJsonFile(getDataFile('pages.json'), data);

  return new Response(JSON.stringify(data.pages[index]), { status: 200 });
};
