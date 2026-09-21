import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const SESSION_COOKIE = 'admin_session';
export const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

const SESSION_MAX_AGE_S = 60 * 60 * 24;

/**
 * Secret used to sign session cookies. Set ADMIN_SESSION_SECRET in the host's
 * environment so sessions survive a redeploy; otherwise we derive one from the
 * password, and fall back to a per-process random value (which simply logs
 * everyone out on restart — never to a value an attacker could guess).
 */
const SESSION_SECRET =
  import.meta.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  (ADMIN_PASSWORD ? `derived:${ADMIN_PASSWORD}` : randomBytes(32).toString('hex'));

function sign(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

/** Constant-time compare that does not leak length via an early return. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) {
    // Still burn a comparison so the timing profile stays flat.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

function issueToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE_S * 1000;
  const payload = `${expires}.${randomBytes(12).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * A session is valid only if the cookie carries a signature this server
 * produced and has not expired. The previous implementation accepted the
 * literal string "authenticated", which any visitor could set by hand.
 */
export function getSession(cookies: any): boolean {
  const raw = cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return false;

  const parts = raw.split('.');
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;
  if (!safeEqual(signature, sign(`${expires}.${nonce}`))) return false;

  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

// Simple in-memory rate limiter for login attempts: ip -> { count, resetTime }
// Note: serverless instances do not share this map, so it slows down a single
// attacker but is not a substitute for a strong password.
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const LOGIN_RATE_LIMIT = 5; // max attempts
const LOGIN_RATE_WINDOW_MS = 5 * 60 * 1000; // per 5 minutes

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= LOGIN_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export const loginHandler: APIRoute = async ({ request, cookies }) => {
  // No password configured means no way in — safer than shipping a default.
  if (!ADMIN_PASSWORD) {
    console.error('[auth] ADMIN_PASSWORD is not set; refusing all logins.');
    return new Response(
      JSON.stringify({ success: false, error: 'ระบบยังไม่ได้ตั้งค่ารหัสผ่านผู้ดูแล' }),
      { status: 503 }
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')?.trim()
    || 'unknown';

  if (!checkLoginRateLimit(ip)) {
    return new Response(
      JSON.stringify({ success: false, error: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }),
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const password = formData.get('password')?.toString() || '';

  if (safeEqual(password, ADMIN_PASSWORD)) {
    cookies.set(SESSION_COOKIE, issueToken(), {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE_S,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' }), { status: 401 });
};

export const logoutHandler: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
