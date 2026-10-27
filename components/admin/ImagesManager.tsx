'use client';
import { useCallback, useEffect, useState } from 'react';
import { publicUrl, supabaseBrowser } from '@/lib/supabase/client';
import type { PropertyImage } from '@/lib/types';
import Confirm from './Confirm';

const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX = 8 * 1024 * 1024;

export default function ImagesManager({ propertyId }: { propertyId: string }) {
  const sb = supabaseBrowser();
  const [imgs, setImgs] = useState<PropertyImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);
  const [del, setDel] = useState<PropertyImage | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('property_images').select('*').eq('property_id', propertyId).order('position').order('created_at');
    if (error) setMsg({ t: 'bad', m: 'Erro ao carregar fotos: ' + error.message }); else setImgs((data ?? []) as PropertyImage[]);
  }, [sb, propertyId]);
  useEffect(() => { load(); }, [load]);

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true); setMsg(null);
    let pos = imgs.reduce((m, i) => Math.max(m, i.position), -1) + 1;
    const errors: string[] = []; let okCount = 0;
    for (const f of Array.from(files)) {
      if (!OK_TYPES.includes(f.type)) { errors.push(`${f.name}: formato não aceito (use JPG, PNG, WebP ou AVIF)`); continue; }
      if (f.size > MAX) { errors.push(`${f.name}: maior que 8 MB`); continue; }
      const ext = f.type === 'image/jpeg' ? 'jpg' : f.type.split('/')[1];
      const path = `properties/${propertyId}/${crypto.randomUUID()}.${ext}`;
      const up = await sb.storage.from('media').upload(path, f, { contentType: f.type, cacheControl: '31536000' });
      if (up.error) { errors.push(`${f.name}: ${up.error.message}`); continue; }
      const ins = await sb.from('property_images').insert({ property_id: propertyId, path, position: pos++ });
      if (ins.error) { await sb.storage.from('media').remove([path]); errors.push(`${f.name}: ${ins.error.message}`); continue; }
      okCount++;
    }
    setBusy(false);
    setMsg(errors.length ? { t: 'bad', m: `${okCount} enviada(s). Problemas: ${errors.join('; ')}` } : { t: 'ok', m: `${okCount} foto(s) enviada(s).` });
    load();
  }

  async function move(i: number, d: number) {
    const a = imgs[i], b = imgs[i + d];
    if (!a || !b) return;
    setBusy(true);
    // Reatribui posições sequenciais para evitar empates.
    const order = [...imgs]; order[i] = b; order[i + d] = a;
    const results = await Promise.all(order.map((im, n) => sb.from('property_images').update({ position: n }).eq('id', im.id)));
    setBusy(false);
    const err = results.find((r) => r.error);
    if (err?.error) setMsg({ t: 'bad', m: 'Erro ao reordenar: ' + err.error.message }); else setMsg({ t: 'ok', m: 'Ordem atualizada. A primeira foto é a capa.' });
    load();
  }

  async function saveAlt(im: PropertyImage, alt: string) {
    if ((im.alt ?? '') === alt) return;
    const { error } = await sb.from('property_images').update({ alt: alt || null }).eq('id', im.id);
    if (error) setMsg({ t: 'bad', m: 'Erro ao salvar texto alternativo: ' + error.message });
    else setImgs((x) => x.map((y) => (y.id === im.id ? { ...y, alt } : y)));
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await sb.from('property_images').delete().eq('id', del.id);
    if (error) setMsg({ t: 'bad', m: 'Erro ao excluir: ' + error.message });
    else { await sb.storage.from('media').remove([del.path]); setMsg({ t: 'ok', m: 'Foto excluída.' }); }
    setBusy(false); setDel(null); load();
  }

  return (
    <div className="panel">
      <h2 style={{ fontSize: '1.3rem' }}>Fotografias</h2>
      <p className="muted">A primeira foto é a capa do anúncio. JPG, PNG, WebP ou AVIF, até 8 MB cada.</p>
      <input type="file" accept={OK_TYPES.join(',')} multiple disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} aria-label="Enviar fotografias" />
      {busy && <p>Processando…</p>}
      {msg && <div className={`alert ${msg.t}`} role="status">{msg.m}</div>}
      {imgs.length === 0 ? <p className="muted">Nenhuma fotografia enviada.</p> : (
        <div className="imgs" style={{ marginTop: 14 }}>
          {imgs.map((im, i) => (
            <div className="im" key={im.id}>
              <img src={publicUrl(im.path)} alt={im.alt || `Foto ${i + 1}`} loading="lazy" />
              <div className="ac">
                {i === 0 && <span className="badge ok">Capa</span>}
                <button className="btn btn-outline btn-sm" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Mover para antes">←</button>
                <button className="btn btn-outline btn-sm" disabled={busy || i === imgs.length - 1} onClick={() => move(i, 1)} aria-label="Mover para depois">→</button>
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => setDel(im)}>Excluir</button>
                <input defaultValue={im.alt ?? ''} placeholder="Texto alternativo" aria-label={`Texto alternativo da foto ${i + 1}`} onBlur={(e) => saveAlt(im, e.target.value.trim())} style={{ fontSize: '.8rem', padding: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {del && <Confirm title="Excluir fotografia?" text="A foto será removida definitivamente do anúncio e do armazenamento." onConfirm={remove} onCancel={() => setDel(null)} busy={busy} />}
    </div>
  );
}
