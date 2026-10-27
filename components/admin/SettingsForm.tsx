'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Settings } from '@/lib/types';
import { isEmail, whatsappNumber } from '@/lib/format';

type S = { [K in keyof Settings]: string };
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

export default function SettingsForm({ initial }: { initial: Settings }) {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [f, setF] = useState<S>(Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ''])) as S);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);
  const set = (k: keyof S, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function uploadImg(k: 'logo_url' | 'hero_image_url' | 'about_image_url', file?: File) {
    if (!file) return;
    if (!OK_TYPES.includes(file.type) || file.size > 8 * 1024 * 1024) { setMsg({ t: 'bad', m: 'Use imagem JPG, PNG, WebP, AVIF ou SVG de até 8 MB.' }); return; }
    setBusy(true); setMsg(null);
    // SVG não é aceito pelo bucket por segurança; logotipo deve ser PNG/WebP/JPG.
    if (file.type === 'image/svg+xml') { setBusy(false); setMsg({ t: 'bad', m: 'SVG não é permitido por segurança. Envie PNG, JPG ou WebP.' }); return; }
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `site/${k.replace('_url', '')}-${Date.now()}.${ext}`;
    const up = await sb.storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    if (up.error) { setBusy(false); setMsg({ t: 'bad', m: 'Falha no envio: ' + up.error.message }); return; }
    const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    set(k, url);
    setBusy(false);
    setMsg({ t: 'ok', m: 'Imagem enviada. Clique em “Salvar configurações” para aplicar.' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.company_name.trim()) er.company_name = 'Informe o nome comercial.';
    if (f.whatsapp.trim() && !whatsappNumber(f.whatsapp)) er.whatsapp = 'Número inválido. Use DDI+DDD+número, ex.: 5511999998888.';
    if (f.email.trim() && !isEmail(f.email.trim())) er.email = 'E-mail inválido.';
    for (const k of ['instagram', 'facebook', 'youtube', 'linkedin'] as const) if (f[k].trim() && !/^https?:\/\//i.test(f[k].trim())) er[k] = 'Use o link completo (https://…).';
    setErrs(er);
    if (Object.keys(er).length) { setMsg({ t: 'bad', m: 'Corrija os campos destacados.' }); return; }
    const row: Record<string, string | null> = {};
    (Object.keys(f) as (keyof S)[]).forEach((k) => { row[k] = f[k].trim() === '' ? null : f[k].trim(); });
    row.company_name = f.company_name.trim();
    if (row.whatsapp) row.whatsapp = whatsappNumber(row.whatsapp);
    setBusy(true); setMsg(null);
    const { error } = await sb.from('site_settings').update({ ...row, updated_at: new Date().toISOString() }).eq('id', 1);
    setBusy(false);
    if (error) setMsg({ t: 'bad', m: 'Não foi possível salvar: ' + error.message });
    else { if (row.whatsapp) set('whatsapp', row.whatsapp); setMsg({ t: 'ok', m: 'Configurações salvas.' }); router.refresh(); }
  }

  // Componentes com identidade estável (evita perder o foco ao digitar).
  const ctx = useRef({ f, errs, busy, set, uploadImg });
  ctx.current = { f, errs, busy, set, uploadImg };
  const [T] = useState(() => function T({ k, label, hint, ...r }: { k: keyof S; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    const { f, errs, set } = ctx.current;
    return (
      <div className="field"><label htmlFor={`s-${k}`}>{label}</label>
        <input id={`s-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errs[k]} {...r} />
        {hint && <div className="muted" style={{ fontSize: '.8rem' }}>{hint}</div>}{errs[k] && <div className="err">{errs[k]}</div>}</div>
    );
  });
  const [A] = useState(() => function A({ k, label }: { k: keyof S; label: string }) {
    const { f, set } = ctx.current;
    return (
      <div className="field"><label htmlFor={`s-${k}`}>{label}</label>
        <textarea id={`s-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} /></div>
    );
  });
  const [Img] = useState(() => function Img({ k, label }: { k: 'logo_url' | 'hero_image_url' | 'about_image_url'; label: string }) {
    const { f, busy, set, uploadImg } = ctx.current;
    return (
      <div className="field"><label htmlFor={`s-${k}`}>{label}</label>
        {f[k] && <img src={f[k]} alt="" style={{ maxHeight: 90, marginBottom: 6, borderRadius: 6 }} />}
        <input id={`s-${k}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(e) => { uploadImg(k, e.target.files?.[0]); e.target.value = ''; }} />
        {f[k] && <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={() => set(k, '')}>Remover</button>}</div>
    );
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="panel"><h2 style={{ fontSize: '1.3rem' }}>Identidade</h2>
        <T k="company_name" label="Nome comercial *" /><A k="description" label="Descrição institucional" />
        <T k="creci" label="CRECI" />
        <Img k="logo_url" label="Logotipo" />
      </div>
      <div className="panel"><h2 style={{ fontSize: '1.3rem' }}>Página inicial</h2>
        <T k="hero_title" label="Título do banner" /><T k="hero_subtitle" label="Subtítulo do banner" />
        <Img k="hero_image_url" label="Imagem do banner" />
        <T k="owner_cta_title" label="Chamada para proprietários — título" /><A k="owner_cta_text" label="Chamada para proprietários — texto" />
        <T k="about_title" label="Seção institucional — título" /><A k="about_text" label="Seção institucional — texto" />
        <Img k="about_image_url" label="Imagem institucional" />
      </div>
      <div className="panel"><h2 style={{ fontSize: '1.3rem' }}>Contato</h2>
        <div className="grid2"><T k="whatsapp" label="WhatsApp (formato internacional)" hint="Ex.: 5511999998888 (55 + DDD + número). Sem número válido, os botões de WhatsApp ficam ocultos." inputMode="tel" /><T k="phone" label="Telefone" type="tel" /></div>
        <T k="email" label="E-mail" type="email" /><T k="address" label="Endereço comercial" /><T k="cities" label="Cidades e regiões atendidas" /><T k="hours" label="Horário de atendimento" />
      </div>
      <div className="panel"><h2 style={{ fontSize: '1.3rem' }}>Redes sociais</h2>
        <div className="grid2"><T k="instagram" label="Instagram (link)" /><T k="facebook" label="Facebook (link)" /><T k="youtube" label="YouTube (link)" /><T k="linkedin" label="LinkedIn (link)" /></div>
      </div>
      {msg && <div className={`alert ${msg.t}`} role="alert">{msg.m}</div>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Aguarde…' : 'Salvar configurações'}</button>
    </form>
  );
}
