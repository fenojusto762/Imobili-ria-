import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Renova a sessão e bloqueia /admin para quem não está autenticado.
// A verificação de administrador (tabela admins + RLS) é feita no layout do painel e no banco.
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = req.nextUrl.pathname;
  const open = path === '/admin/login' || path === '/admin/redefinir';

  if (!url || !key) {
    return open ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', req.url));
  }

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user && !open) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
