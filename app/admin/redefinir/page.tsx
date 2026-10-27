'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Redefinir() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    const { data: sub } = sb.auth.onAuthStateChange((ev, session) => { if (session && (ev === 'PASSWORD_RECOVERY' || ev === 'SIGNED_IN')) setReady(true); });
    sb.auth.getSession().then(({ data }) => setReady(!!data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p1 = String(fd.get('p1')), p2 = String(fd.get('p2'));
    if (p1.length < 10) return setMsg({ t: 'bad', m: 'Use ao menos 10 caracteres.' });
    if (p1 !== p2) return setMsg({ t: 'bad', m: 'As senhas não coincidem.' });
    setBusy(true); setMsg(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) setMsg({ t: 'bad', m: 'Não foi possível alterar a senha. Solicite um novo link.' });
    else { setMsg({ t: 'ok', m: 'Senha alterada. Redirecionando…' }); setTimeout(() => router.replace('/admin'), 1200); }
  }

  return (
    <div className="login">
      <h1 style={{ fontSize: '1.6rem' }}>Redefinir senha</h1>
      {ready === false && <div className="alert bad">Link inválido ou expirado. Volte ao <a href="/admin/login">login</a> e solicite outro.</div>}
      {ready && (
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="p1">Nova senha</label><input id="p1" name="p1" type="password" autoComplete="new-password" required minLength={10} /></div>
          <div className="field"><label htmlFor="p2">Repita a nova senha</label><input id="p2" name="p2" type="password" autoComplete="new-password" required /></div>
          {msg && <div className={`alert ${msg.t}`} role="alert">{msg.m}</div>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>Salvar nova senha</button>
        </form>
      )}
    </div>
  );
}
