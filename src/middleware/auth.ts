import type { APIRoute } from 'astro';

export const SESSION_COOKIE = 'admin_session';
export const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'waisira2567';

export function getSession(cookies: any): boolean {
  const session = cookies.get(SESSION_COOKIE);
  return session?.value === 'authenticated';
}

// Simple in-memory rate limiter for login attempts: ip -> { count, resetTime }
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
  const password = formData.get('password')?.toString();

  if (password === ADMIN_PASSWORD) {
    cookies.set(SESSION_COOKIE, 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' }), { status: 401 });
};

export const logoutHandler: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
