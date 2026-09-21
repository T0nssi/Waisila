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

    // Without a delivery channel the message goes nowhere. Say so instead of
    // reporting success — a lead that silently vanishes is worse than an error.
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('[contact] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set; message not delivered.');
      return new Response(
        JSON.stringify({ error: 'ระบบรับข้อความยังไม่พร้อมใช้งาน กรุณาติดต่อทางโทรศัพท์หรือ LINE' }),
        { status: 503 }
      );
    }

    {
      const text = `📩 ข้อความจากเว็บไซต์

👤 ชื่อ: ${safeName}
📞 โทร: ${safePhone}
📧 อีเมล: ${safeEmail}
💬 ข้อความ: ${safeMessage}

⏰ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
        }),
      });

      if (!tgRes.ok) {
        console.error('[contact] Telegram rejected the message:', tgRes.status, await tgRes.text());
        return new Response(
          JSON.stringify({ error: 'ส่งข้อความไม่สำเร็จ กรุณาติดต่อทางโทรศัพท์หรือ LINE' }),
          { status: 502 }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
