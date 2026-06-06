import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'src/data/settings.json');

function getSettings(): any {
  try {
    const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export const GET: APIRoute = async () => {
  const settings = getSettings();
  return new Response(JSON.stringify(settings), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const settings = getSettings();
    
    if (body.telegramBotToken !== undefined) {
      settings.telegramBotToken = body.telegramBotToken;
    }
    if (body.telegramChatId !== undefined) {
      settings.telegramChatId = body.telegramChatId;
    }
    
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Settings save error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
  }
};
