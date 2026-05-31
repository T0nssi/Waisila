import type { APIRoute } from 'astro';

export const SESSION_COOKIE = 'admin_session';
export const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'waisira2567';

export function getSession(cookies: any): boolean {
  const session = cookies.get(SESSION_COOKIE);
  return session?.value === 'authenticated';
}

export const loginHandler: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString();

  if (password === ADMIN_PASSWORD) {
    cookies.set(SESSION_COOKIE, 'authenticated', {
      path: '/',
      httpOnly: true,
      secure: false,
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
