'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { dateBR } from '@/lib/format';
import Confirm from './Confirm';

interface C {
  id: string; kind: string; name: string; phone: string; email: string | null; subject: string | null; message: string | null;
  property_code: string | null; status: string; created_at: string;
}
const KIND: Record<string, string> = { comprar: 'Comprar', alugar: 'Alugar', anunciar: 'Anunciar imóvel', geral: 'Geral' };
const ST: Record<string, string> = { novo: 'Novo', em_atendimento: 'Em atendimento', concluido: 'Concluído', spam: 'Spam' };

export default function ContactsAdmin() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);
  const [st, setSt] = useState(''); const [kd, setKd] = useState(''); const [q, setQ] = useState('');
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);
  const [del, setDel] = useState<C | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = sb.from('contacts').select('id,kind,name,phone,email,subject,message,property_code,status,created_at').order('created_at', { ascending: false }).limit(300);
    if (st) query = query.eq('status', st);
    if (kd) query = query.eq('kind', kd);
    const t = q.replace(/[,()%*\\]/g, ' ').trim();
    if (t) query = query.or(`name.ilike.%${t}%,phone.ilike.%${t}%,email.ilike.%${t}%,property_code.ilike.%${t}%`);
    const { data, error } = await query;
    if (error) setMsg({ t: 'bad', m: 'Erro ao carregar: ' + error.message }); else setRows((data ?? []) as C[]);
    setLoading(false);
  }, [sb, st, kd, q]);
  useEffect(() => { const h = setTimeout(load, 250); return () => clearTimeout(h); }, [load]);

  async function setStatus(c: C, status: string) {
    const { error } = await sb.from('contacts').update({ status }).eq('id', c.id);
    if (error) setMsg({ t: 'bad', m: 'Erro: ' + error.message }); else { setMsg(null); setRows((x) => x.map((y) => (y.id === c.id ? { ...y, status } : y))); }
  }
  async function remove() {
    if (!del) return;
    const { error } = await sb.from('contacts').delete().eq('id', del.id);
    if (error) setMsg({ t: 'bad', m: 'Erro ao excluir: ' + error.message }); else { setMsg({ t: 'ok', m: 'Contato excluído.' }); setRows((x) => x.filter((y) => y.id !== del.id)); }
    setDel(null);
  }

  return (
    <>
      <div className="panel grid3">
        <div className="field"><label htmlFor="cq">Buscar</label><input id="cq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, telefone, e-mail, código" /></div>
        <div className="field"><label htmlFor="cs">Estado</label><select id="cs" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todos</option>{Object.entries(ST).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="ck">Assunto</label><select id="ck" value={kd} onChange={(e) => setKd(e.target.value)}><option value="">Todos</option>{Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </div>
      {msg && <div className={`alert ${msg.t}`} role="status">{msg.m}</div>}
      <div className="panel tablewrap">
        {loading ? <p>Carregando…</p> : rows.length === 0 ? <p>Nenhum contato encontrado.</p> : (
          <table className="t">
            <thead><tr><th>Data</th><th>Contato</th><th>Assunto / mensagem</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{dateBR(c.created_at)}</td>
                  <td><strong>{c.name}</strong><br /><a href={`tel:+${c.phone}`}>+{c.phone}</a>{c.email && <><br /><a href={`mailto:${c.email}`}>{c.email}</a></>}</td>
                  <td><span className="badge">{KIND[c.kind]}</span>{c.property_code && <> <span className="badge">Imóvel {c.property_code}</span></>}
                    {c.subject && <div><strong>{c.subject}</strong></div>}{c.message && <div style={{ whiteSpace: 'pre-line' }}>{c.message}</div>}</td>
                  <td><select aria-label={`Estado do contato de ${c.name}`} value={c.status} onChange={(e) => setStatus(c, e.target.value)}>{Object.entries(ST).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => setDel(c)}>Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {del && <Confirm title="Excluir contato?" text={`O contato de ${del.name} será removido definitivamente.`} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  );
}
