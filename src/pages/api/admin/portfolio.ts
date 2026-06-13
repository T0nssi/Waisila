import type { APIRoute } from 'astro';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';
import { generateId, generateSlug } from '../../../lib/utils';
import { getSession } from '../../../middleware/auth';

export const GET: APIRoute = async ({ cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  return new Response(JSON.stringify(data.portfolio || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  const portfolio = data.portfolio || [];

  const newItem = {
    id: generateId('pf'),
    slug: body.slug || generateSlug(body.title || 'portfolio'),
    title: body.title || '',
    category: body.category || 'general',
    description: body.description || '',
    image: body.image || '',
    images: body.images || [],
    type: body.type || 'stone',
    active: body.active !== false,
    sort: portfolio.length + 1,
  };

  if (portfolio.some((p: any) => p.slug === newItem.slug)) {
    newItem.slug = newItem.slug + '-' + Date.now().toString(36);
  }

  portfolio.push(newItem);
  writeJsonFile(getDataFile('portfolio.json'), { portfolio });

  return new Response(JSON.stringify(newItem), { status: 201 });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!getSession(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
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

  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  const portfolio = data.portfolio || [];
  const index = portfolio.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Portfolio item not found' }), { status: 404 });
  }

  portfolio.splice(index, 1);
  writeJsonFile(getDataFile('portfolio.json'), { portfolio });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
