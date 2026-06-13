import type { APIRoute } from 'astro';
import { readJsonFile, getDataFile } from '../../lib/apiHelpers';

const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID;

// Simple in-memory rate limiter: ip → { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW_MS = 60 * 1000; // per 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')?.trim()
    || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    if (!name || !phone || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Sanitize inputs
    const sanitize = (str: string) => String(str).replace(/[<>&'"]/g, '');
    const safeName = sanitize(name);
    const safePhone = sanitize(phone);
    const safeEmail = sanitize(email || '-');
    const safeMessage = sanitize(message);

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `📩 ข้อความจากเว็บไซต์

👤 ชื่อ: ${safeName}
📞 โทร: ${safePhone}
📧 อีเมล: ${safeEmail}
💬 ข้อความ: ${safeMessage}

⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
