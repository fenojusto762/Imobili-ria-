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

function Ico({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const BED = 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2';
const BATH = 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2';
const CAR = 'M5 16l1.5-5a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 16M4 16h16v3H4zM7 19v1M17 19v1';
const AREA = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5';

export default function PropertyCard({ p }: { p: Property }) {
  const lines = priceLines(p);
  const place = [p.neighborhood, p.city].filter(Boolean).join(', ');
  const area = p.built_area ?? p.total_area;
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
        <span className="meta">{TYPES[p.type] ?? p.type} · {p.code}</span>
        <h3>{p.title}</h3>
        {place && <span className="where">{place}{p.state ? `/${p.state}` : ''}</span>}
        {lines.map((l) => <div key={l} className="price">{l}</div>)}
        <div className="facts">
          {p.bedrooms != null && <span><Ico d={BED} />{p.bedrooms}</span>}
          {p.bathrooms != null && <span><Ico d={BATH} />{p.bathrooms}</span>}
          {p.parking != null && <span><Ico d={CAR} />{p.parking}</span>}
          {area != null && <span><Ico d={AREA} />{num(area)} m²</span>}
        </div>
      </div>
    </Link>
  );
}
