import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import SignOut from '@/components/admin/SignOut';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel administrativo', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  if (!sb) redirect('/admin/login');
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/admin/login');
  // Verificação no servidor: só quem está na tabela admins entra (o banco também aplica RLS).
  const { data: isAdmin } = await sb.rpc('is_admin');
  if (isAdmin !== true) {
    return (
      <div className="login">
        <h1 style={{ fontSize: '1.4rem' }}>Acesso não autorizado</h1>
        <p>A conta <strong>{user.email}</strong> não tem permissão administrativa.</p>
        <SignOut />
      </div>
    );
  }
  return (
    <div className="adm">
      <aside>
        <strong style={{ padding: '0 12px 10px' }}>Painel</strong>
        <Link href="/admin">Imóveis</Link>
        <Link href="/admin/imoveis/novo">Novo imóvel</Link>
        <Link href="/admin/contatos">Contatos</Link>
        <Link href="/admin/configuracoes">Configurações</Link>
        <Link href="/" target="_blank">Ver site ↗</Link>
        <div style={{ marginTop: 'auto', padding: 12 }}><SignOut /></div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
