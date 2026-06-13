import type { APIRoute } from 'astro';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';

export const GET: APIRoute = async () => {
  const settings = readJsonFile(getDataFile('settings.json'), {});
  return new Response(JSON.stringify(settings), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const settings = readJsonFile(getDataFile('settings.json'), {});

    if (body.telegramBotToken !== undefined) {
      settings.telegramBotToken = body.telegramBotToken;
    }
    if (body.telegramChatId !== undefined) {
      settings.telegramChatId = body.telegramChatId;
    }

    writeJsonFile(getDataFile('settings.json'), settings);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Settings save error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
  }
};
