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

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = cookies.get('admin_session');
  // Allow public access for viewing pages
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  
  if (!key) {
    return new Response(JSON.stringify({ error: 'Key required' }), { status: 400 });
  }
  
  const data = readPages();
  const page = data.pages.find((p: any) => p.key === key);
  
  if (!page) {
    return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
  }
  
  return new Response(JSON.stringify(page), { status: 200 });
};