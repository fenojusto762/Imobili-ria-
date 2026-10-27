'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { STATUSES, TYPES } from '@/lib/types';
import { brl } from '@/lib/format';
import Confirm from './Confirm';

interface Row {
  id: string; code: string; slug: string; title: string; type: string; purpose: string; status: string;
  published: boolean; featured: boolean; sale_price: number | null; rent_price: number | null; city: string | null; neighborhood: string | null;
}

export default function PropertyList() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);
  const [q, setQ] = useState(''); const [pub, setPub] = useState(''); const [st, setSt] = useState(''); const [tp, setTp] = useState('');
  const [del, setDel] = useState<Row | null>(null); const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = sb.from('properties').select('id,code,slug,title,type,purpose,status,published,featured,sale_price,rent_price,city,neighborhood').order('created_at', { ascending: false }).limit(500);
    const t = q.replace(/[,()%*\\]/g, ' ').trim();
    if (t) query = query.or(`title.ilike.%${t}%,code.ilike.%${t}%,neighborhood.ilike.%${t}%,city.ilike.%${t}%`);
    if (pub) query = query.eq('published', pub === '1');
    if (st) query = query.eq('status', st);
    if (tp) query = query.eq('type', tp);
    const { data, error } = await query;
    if (error) setMsg({ t: 'bad', m: 'Erro ao carregar imóveis: ' + error.message }); else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [sb, q, pub, st, tp]);

  useEffect(() => { const h = setTimeout(load, 250); return () => clearTimeout(h); }, [load]);

  async function patch(r: Row, changes: Partial<Row>, okMsg: string) {
    setMsg(null);
    const { error } = await sb.from('properties').update(changes).eq('id', r.id);
    if (error) setMsg({ t: 'bad', m: error.message.includes('price_required') ? 'Para publicar, informe o(s) preço(s) conforme a finalidade (edite o imóvel).' : 'Erro: ' + error.message });
    else { setMsg({ t: 'ok', m: okMsg }); setRows((x) => x.map((y) => (y.id === r.id ? { ...y, ...changes } : y))); }
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { data: imgs } = await sb.from('property_images').select('path').eq('property_id', del.id);
    const paths = (imgs ?? []).map((i: { path: string }) => i.path);
    if (paths.length) await sb.storage.from('media').remove(paths);
    const { error } = await sb.from('properties').delete().eq('id', del.id);
    setBusy(false);
    if (error) setMsg({ t: 'bad', m: 'Não foi possível excluir: ' + error.message });
    else { setMsg({ t: 'ok', m: `Imóvel ${del.code} excluído.` }); setRows((x) => x.filter((y) => y.id !== del.id)); }
    setDel(null);
  }

  return (
    <>
      <div className="panel">
        <div className="grid4">
          <div className="field"><label htmlFor="aq">Buscar</label><input id="aq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, código, bairro, cidade" /></div>
          <div className="field"><label htmlFor="ap">Publicação</label><select id="ap" value={pub} onChange={(e) => setPub(e.target.value)}><option value="">Todos</option><option value="1">Publicados</option><option value="0">Rascunhos</option></select></div>
          <div className="field"><label htmlFor="as">Situação</label><select id="as" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todas</option>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="field"><label htmlFor="at">Tipo</label><select id="at" value={tp} onChange={(e) => setTp(e.target.value)}><option value="">Todos</option>{Object.entries(TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        </div>
        <Link href="/admin/imoveis/novo" className="btn btn-primary btn-sm">+ Novo imóvel</Link>
      </div>
      {msg && <div className={`alert ${msg.t}`} role="status">{msg.m}</div>}
      <div className="panel tablewrap">
        {loading ? <p>Carregando…</p> : rows.length === 0 ? <p>Nenhum imóvel encontrado.</p> : (
          <table className="t">
            <thead><tr><th>Código</th><th>Imóvel</th><th>Valor</th><th>Situação</th><th>Publicado</th><th>Destaque</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.code}</td>
                  <td><strong>{r.title}</strong><br /><span className="muted">{TYPES[r.type]} · {[r.neighborhood, r.city].filter(Boolean).join(', ')}</span></td>
                  <td>{r.sale_price ? brl(r.sale_price) : ''}{r.sale_price && r.rent_price ? <br /> : ''}{r.rent_price ? `${brl(r.rent_price)}/mês` : ''}</td>
                  <td>
                    <select aria-label={`Situação de ${r.code}`} value={r.status} onChange={(e) => patch(r, { status: e.target.value }, 'Situação atualizada.')}>
                      {Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </td>
                  <td><button className={`badge ${r.published ? 'ok' : 'warn'}`} style={{ border: 0, cursor: 'pointer' }} onClick={() => patch(r, { published: !r.published }, r.published ? 'Anúncio despublicado.' : 'Anúncio publicado.')}>{r.published ? 'Publicado' : 'Rascunho'}</button></td>
                  <td><input type="checkbox" style={{ width: 'auto' }} aria-label={`Destaque ${r.code}`} checked={r.featured} onChange={() => patch(r, { featured: !r.featured }, r.featured ? 'Destaque removido.' : 'Marcado como destaque.')} /></td>
                  <td><div className="row">
                    <Link className="btn btn-outline btn-sm" href={`/admin/imoveis/${r.id}`}>Editar</Link>
                    <Link className="btn btn-outline btn-sm" href={`/admin/imoveis/${r.id}/preview`} target="_blank">Prévia</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => setDel(r)}>Excluir</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {del && <Confirm title="Excluir imóvel?" text={`“${del.title}” (${del.code}) e todas as suas fotografias serão removidos definitivamente. Esta ação não pode ser desfeita.`} onConfirm={remove} onCancel={() => setDel(null)} busy={busy} />}
    </>
  );
}
