import type { APIRoute } from 'astro';
import { readJsonFile, getDataFile } from '../../../lib/apiHelpers';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key required' }), { status: 400 });
  }

  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
  const page = data.pages.find((p: any) => p.key === key);

  if (!page) {
    return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(page), { status: 200 });
};
