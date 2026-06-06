import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/settings.json');

interface Settings {
  telegramBotToken?: string;
  telegramChatId?: string;
}

function getSettings(): Settings {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;
    
    if (!name || !phone || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    
    const settings = getSettings();
    
    // If Telegram is configured, send message
    if (settings.telegramBotToken && settings.telegramChatId) {
      const text = `📩 ข้อความจากเว็บไซต์

👤 ชื่อ: ${name}
📞 โทร: ${phone}
📧 อีเมล: ${email || '-'}
💬 ข้อความ: ${message}

⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;
      
      await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text,
          parse_mode: 'HTML'
        })
      });
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
