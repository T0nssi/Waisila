import type { APIRoute } from 'astro';
import { readJsonFile, writeJsonFile, getDataFile } from '../../../lib/apiHelpers';

export const GET: APIRoute = async () => {
  const settings = readJsonFile(getDataFile('settings.json'), {});
  // Never expose tokens in GET response
  const safe = { ...settings };
  delete safe.telegramBotToken;
  delete safe.telegramChatId;
  return new Response(JSON.stringify(safe), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const settings = readJsonFile(getDataFile('settings.json'), {});

    // Telegram settings — prefer env vars, allow override via API only if env not set
    if (body.telegramBotToken !== undefined) {
      settings.telegramBotToken = body.telegramBotToken || import.meta.env.TELEGRAM_BOT_TOKEN || '';
    }
    if (body.telegramChatId !== undefined) {
      settings.telegramChatId = body.telegramChatId || import.meta.env.TELEGRAM_CHAT_ID || '';
    }

    writeJsonFile(getDataFile('settings.json'), settings);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Settings save error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
  }
};
