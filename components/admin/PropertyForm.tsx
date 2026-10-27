'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { PURPOSES, STATUSES, TYPES } from '@/lib/types';

export interface FormProperty {
  id?: string; code?: string; slug?: string; title: string; description: string; type: string; purpose: string;
  sale_price: string; rent_price: string; condo_fee: string; iptu: string; address: string; show_address: boolean;
  neighborhood: string; city: string; state: string; total_area: string; built_area: string; bedrooms: string; suites: string;
  bathrooms: string; parking: string; features: string; status: string; featured: boolean; published: boolean;
  owner_name: string; owner_phone: string; internal_notes: string;
}

export const emptyProperty: FormProperty = {
  title: '', description: '', type: 'apartamento', purpose: 'venda', sale_price: '', rent_price: '', condo_fee: '', iptu: '',
  address: '', show_address: false, neighborhood: '', city: '', state: '', total_area: '', built_area: '', bedrooms: '', suites: '',
  bathrooms: '', parking: '', features: '', status: 'disponivel', featured: false, published: false,
  owner_name: '', owner_phone: '', internal_notes: '',
};

const numOrNull = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));
const intOrNull = (s: string) => (s.trim() === '' ? null : Math.trunc(Number(s)));
const strOrNull = (s: string) => (s.trim() === '' ? null : s.trim());

export default function PropertyForm({ initial }: { initial: FormProperty }) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [f, setF] = useState<FormProperty>(initial);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ t: 'ok' | 'bad'; m: string } | null>(null);
  const set = <K extends keyof FormProperty>(k: K, v: FormProperty[K]) => setF((x) => ({ ...x, [k]: v }));
  const editing = !!f.id;

  function validate() {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 3) e.title = 'Informe o título (mín. 3 caracteres).';
    const needSale = f.purpose === 'venda' || f.purpose === 'ambas';
    const needRent = f.purpose === 'aluguel' || f.purpose === 'ambas';
    for (const k of ['sale_price', 'rent_price', 'condo_fee', 'iptu', 'total_area', 'built_area', 'bedrooms', 'suites', 'bathrooms', 'parking'] as const) {
      const v = f[k].trim();
      if (v !== '' && (!Number.isFinite(Number(v.replace(',', '.'))) || Number(v.replace(',', '.')) < 0)) e[k] = 'Valor inválido.';
    }
    if (f.published) {
      if (needSale && !(Number(f.sale_price.replace(',', '.')) > 0)) e.sale_price = 'Obrigatório para publicar.';
      if (needRent && !(Number(f.rent_price.replace(',', '.')) > 0)) e.rent_price = 'Obrigatório para publicar.';
    }
    if (f.state.trim() && f.state.trim().length !== 2) e.state = 'Use a sigla com 2 letras (ex.: SP).';
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setMsg(null);
    if (!validate()) { setMsg({ t: 'bad', m: 'Corrija os campos destacados.' }); return; }
    const row = {
      title: f.title.trim(), description: strOrNull(f.description), type: f.type, purpose: f.purpose,
      sale_price: f.purpose === 'aluguel' ? null : numOrNull(f.sale_price),
      rent_price: f.purpose === 'venda' ? null : numOrNull(f.rent_price),
      condo_fee: numOrNull(f.condo_fee), iptu: numOrNull(f.iptu),
      address: strOrNull(f.address), show_address: f.show_address && !!strOrNull(f.address),
      neighborhood: strOrNull(f.neighborhood), city: strOrNull(f.city), state: f.state.trim() ? f.state.trim().toUpperCase() : null,
      total_area: numOrNull(f.total_area), built_area: numOrNull(f.built_area),
      bedrooms: intOrNull(f.bedrooms), suites: intOrNull(f.suites), bathrooms: intOrNull(f.bathrooms), parking: intOrNull(f.parking),
      features: f.features.split('\n').map((s) => s.trim()).filter(Boolean),
      status: f.status, featured: f.featured, published: f.published,
      owner_name: strOrNull(f.owner_name), owner_phone: strOrNull(f.owner_phone), internal_notes: strOrNull(f.internal_notes),
    };
    setBusy(true);
    try {
      if (editing) {
        const { error } = await sb.from('properties').update(row).eq('id', f.id!);
        if (error) throw error;
        setMsg({ t: 'ok', m: 'Alterações salvas.' });
        router.refresh();
      } else {
        const { data, error } = await sb.from('properties').insert({ ...row, slug: '' }).select('id').single();
        if (error) throw error;
        router.replace(`/admin/imoveis/${data.id}?novo=1`);
      }
    } catch (e) {
      const m = (e as { message?: string }).message || 'Erro desconhecido';
      setMsg({ t: 'bad', m: m.includes('price_required') ? 'Para publicar, informe o preço de venda e/ou aluguel conforme a finalidade.' : 'Não foi possível salvar: ' + m });
    } finally { setBusy(false); }
  }

  // Componente com identidade estável (evita remontar o <input> a cada tecla e perder o foco).
  const ctx = useRef({ f, errs, set });
  ctx.current = { f, errs, set };
  const [Fld] = useState(() => function Fld({ k, label, type = 'text', ...rest }: { k: keyof FormProperty; label: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    const { f, errs, set } = ctx.current;
    return (
      <div className="field">
        <label htmlFor={`p-${k}`}>{label}</label>
        <input id={`p-${k}`} type={type} value={String(f[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} aria-invalid={!!errs[k]} {...rest} />
        {errs[k] && <div className="err">{errs[k]}</div>}
      </div>
    );
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="panel">
        <h2 style={{ fontSize: '1.3rem' }}>Dados principais {f.code && <span className="badge">{f.code}</span>}</h2>
        <Fld k="title" label="Título *" maxLength={160} />
        <div className="field"><label htmlFor="p-description">Descrição completa</label><textarea id="p-description" value={f.description} onChange={(e) => set('description', e.target.value)} style={{ minHeight: 160 }} /></div>
        <div className="grid3">
          <div className="field"><label htmlFor="p-type">Tipo</label><select id="p-type" value={f.type} onChange={(e) => set('type', e.target.value)}>{Object.entries(TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="field"><label htmlFor="p-purpose">Finalidade</label><select id="p-purpose" value={f.purpose} onChange={(e) => set('purpose', e.target.value)}>{Object.entries(PURPOSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="field"><label htmlFor="p-status">Situação</label><select id="p-status" value={f.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: '1.3rem' }}>Valores</h2>
        <div className="grid4">
          {f.purpose !== 'aluguel' && <Fld k="sale_price" label="Preço de venda (R$)" inputMode="decimal" />}
          {f.purpose !== 'venda' && <Fld k="rent_price" label="Aluguel mensal (R$)" inputMode="decimal" />}
          <Fld k="condo_fee" label="Condomínio (R$)" inputMode="decimal" />
          <Fld k="iptu" label="IPTU (R$)" inputMode="decimal" />
        </div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: '1.3rem' }}>Localização</h2>
        <Fld k="address" label="Endereço (privado, salvo se marcar para exibir)" />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={f.show_address} onChange={(e) => set('show_address', e.target.checked)} />
          Autorizo exibir o endereço completo publicamente
        </label>
        <div className="grid3"><Fld k="neighborhood" label="Bairro" /><Fld k="city" label="Cidade" /><Fld k="state" label="UF" maxLength={2} /></div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: '1.3rem' }}>Características</h2>
        <div className="grid4">
          <Fld k="total_area" label="Área total (m²)" inputMode="decimal" /><Fld k="built_area" label="Área construída (m²)" inputMode="decimal" />
          <Fld k="bedrooms" label="Quartos" inputMode="numeric" /><Fld k="suites" label="Suítes" inputMode="numeric" />
          <Fld k="bathrooms" label="Banheiros" inputMode="numeric" /><Fld k="parking" label="Vagas" inputMode="numeric" />
        </div>
        <div className="field"><label htmlFor="p-features">Diferenciais (um por linha)</label><textarea id="p-features" value={f.features} onChange={(e) => set('features', e.target.value)} placeholder={'Piscina\nChurrasqueira\nPortaria 24h'} /></div>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: '1.3rem' }}>Dados internos (nunca aparecem no site)</h2>
        <div className="grid2"><Fld k="owner_name" label="Proprietário" /><Fld k="owner_phone" label="Telefone do proprietário" /></div>
        <div className="field"><label htmlFor="p-notes">Observações internas</label><textarea id="p-notes" value={f.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} /></div>
      </div>

      <div className="panel">
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}><input type="checkbox" style={{ width: 'auto' }} checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Imóvel em destaque</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" style={{ width: 'auto' }} checked={f.published} onChange={(e) => set('published', e.target.checked)} /> Publicar no site</label>
        {msg && <div className={`alert ${msg.t}`} role="alert">{msg.m}</div>}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar imóvel'}</button>
          {editing && <a className="btn btn-outline" href={`/admin/imoveis/${f.id}/preview`} target="_blank" rel="noopener">Pré-visualizar</a>}
        </div>
        {!editing && <p className="muted">As fotografias podem ser enviadas logo após criar o imóvel.</p>}
      </div>
    </form>
  );
}
