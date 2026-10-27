import Link from 'next/link';
import type { Property } from '@/lib/types';
import { STATUSES, TYPES } from '@/lib/types';
import { brl, num } from '@/lib/format';
import { publicUrl } from '@/lib/supabase/client';

export function priceLines(p: Property) {
  const out: string[] = [];
  if ((p.purpose === 'venda' || p.purpose === 'ambas') && p.sale_price) out.push(brl(p.sale_price));
  if ((p.purpose === 'aluguel' || p.purpose === 'ambas') && p.rent_price) out.push(`${brl(p.rent_price)}/mês`);
  return out;
}

export default function PropertyCard({ p }: { p: Property }) {
  const lines = priceLines(p);
  const place = [p.neighborhood, p.city].filter(Boolean).join(', ');
  return (
    <Link href={`/imoveis/${p.slug}`} className="card">
      <div className="ph">
        {p.cover_path ? (
          <img src={publicUrl(p.cover_path)} alt={`${p.title} — foto principal`} loading="lazy" width={640} height={480} />
        ) : (
          <div className="noimg">Sem fotografia</div>
        )}
        {p.featured && <span className="tag gold">Destaque</span>}
        {p.status !== 'disponivel' && <span className="tag r">{STATUSES[p.status]}</span>}
      </div>
      <div className="bd">
        <span className="muted" style={{ fontSize: '.8rem' }}>{TYPES[p.type] ?? p.type} · {p.code}</span>
        <h3 style={{ margin: 0 }}>{p.title}</h3>
        {place && <span className="muted">{place}{p.state ? `/${p.state}` : ''}</span>}
        {lines.map((l) => <div key={l} className="price">{l}</div>)}
        <div className="facts">
          {p.bedrooms != null && <span>{p.bedrooms} quarto{p.bedrooms === 1 ? '' : 's'}</span>}
          {p.bathrooms != null && <span>{p.bathrooms} banh.</span>}
          {p.parking != null && <span>{p.parking} vaga{p.parking === 1 ? '' : 's'}</span>}
          {(p.built_area ?? p.total_area) != null && <span>{num(p.built_area ?? p.total_area)} m²</span>}
        </div>
      </div>
    </Link>
  );
}
