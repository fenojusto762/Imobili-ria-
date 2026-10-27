'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) });
      if (error) setMsg({ t: 'bad', m: 'E-mail ou senha incorretos.' });
      else { router.replace('/admin'); router.refresh(); }
    } catch { setMsg({ t: 'bad', m: 'Falha de conexão. Tente novamente.' }); }
    finally { setBusy(false); }
  }

  async function forgot() {
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    if (!email) { setMsg({ t: 'bad', m: 'Digite seu e-mail acima para receber o link.' }); return; }
    setBusy(true); setMsg(null);
    try {
      const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/redefinir` });
      // Mensagem neutra: não revela se o e-mail existe.
      setMsg(error && error.status === 429 ? { t: 'bad', m: 'Aguarde alguns minutos antes de solicitar novamente.' } : { t: 'ok', m: 'Se o e-mail estiver cadastrado, enviaremos um link de redefinição.' });
    } catch { setMsg({ t: 'bad', m: 'Falha de conexão. Tente novamente.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="login">
      <h1 style={{ fontSize: '1.6rem' }}>Área administrativa</h1>
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        {msg && <div className={`alert ${msg.t}`} role="alert">{msg.m}</div>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Aguarde…' : 'Entrar'}</button>
      </form>
      <p style={{ textAlign: 'center' }}><button type="button" className="btn btn-sm" style={{ background: 'none', color: 'var(--navy-2)', textDecoration: 'underline' }} onClick={forgot} disabled={busy}>Esqueci minha senha</button></p>
    </div>
  );
}
