'use client';
import { useRef, useState } from 'react';

type Kind = 'comprar' | 'alugar' | 'anunciar' | 'geral';
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'subject' | 'message' | 'consent', string>>;

export default function ContactForm({
  kind, propertyId, propertyLabel, showSubject = false, messagePlaceholder, submitLabel = 'Enviar',
}: {
  kind: Kind; propertyId?: string; propertyLabel?: string; showSubject?: boolean; messagePlaceholder?: string; submitLabel?: string;
}) {
  // A mesma chave é reutilizada em novas tentativas: o servidor ignora reenvios duplicados.
  const key = useRef<string>('');
  if (!key.current) key.current = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [general, setGeneral] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      kind, propertyId, key: key.current,
      name: String(fd.get('name') || ''), phone: String(fd.get('phone') || ''), email: String(fd.get('email') || ''),
      subject: String(fd.get('subject') || ''), message: String(fd.get('message') || ''),
      consent: fd.get('consent') === 'on', website: String(fd.get('website') || ''),
    };
    setBusy(true); setGeneral(''); setErrors({});
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setDone(true); form.reset(); }
      else { setErrors(j.fields || {}); setGeneral(j.error || 'Não foi possível enviar. Seus dados foram mantidos; tente novamente.'); }
    } catch {
      setGeneral('Falha de conexão. Seus dados foram mantidos; verifique a internet e tente novamente.');
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="alert ok" role="status">
        <strong>Mensagem enviada!</strong> Recebemos seu contato e retornaremos em breve.
        <div><button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => { key.current = ''; setDone(false); }}>Enviar outra mensagem</button></div>
      </div>
    );
  }

  const [F] = useState(() => function F({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
    return <div className="field"><label htmlFor={`${kind}-${id}`}>{label}</label>{children}{err && <div className="err" id={`${kind}-${id}-e`}>{err}</div>}</div>;
  });

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy}>
      {propertyLabel && <p className="muted" style={{ marginTop: 0 }}>Imóvel de interesse: <strong>{propertyLabel}</strong></p>}
      <div className="hp" aria-hidden="true"><label>Não preencha<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <F id="name" label="Nome *" err={errors.name}><input id={`${kind}-name`} name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} /></F>
      <div className="grid2">
        <F id="phone" label="Telefone / WhatsApp *" err={errors.phone}><input id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" required aria-invalid={!!errors.phone} /></F>
        <F id="email" label="E-mail" err={errors.email}><input id={`${kind}-email`} name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} /></F>
      </div>
      {showSubject && <F id="subject" label="Assunto" err={errors.subject}><input id={`${kind}-subject`} name="subject" maxLength={160} /></F>}
      <F id="message" label="Mensagem" err={errors.message}><textarea id={`${kind}-message`} name="message" maxLength={3000} placeholder={messagePlaceholder} /></F>
      <div className="field">
        <label style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <input type="checkbox" name="consent" style={{ width: 'auto', marginTop: 4 }} required aria-invalid={!!errors.consent} />
          <span>Concordo com o uso dos meus dados para retorno deste contato, conforme a <a href="/privacidade" target="_blank">Política de Privacidade</a> (LGPD). *</span>
        </label>
        {errors.consent && <div className="err">{errors.consent}</div>}
      </div>
      {general && <div className="alert bad" role="alert">{general}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Enviando…' : submitLabel}</button>
    </form>
  );
}
