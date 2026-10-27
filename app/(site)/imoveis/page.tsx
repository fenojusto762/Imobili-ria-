import Link from 'next/link';
import type { Metadata } from 'next';
import SearchForm from '@/components/SearchForm';
import PropertyCard from '@/components/PropertyCard';
import { PAGE_SIZE, searchProperties, type Filters } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Imóveis à venda e para alugar',
  description: 'Encontre casas, apartamentos, terrenos e salas comerciais para comprar ou alugar.',
  alternates: { canonical: '/imoveis' },
};

type SP = Record<string, string | string[] | undefined>;
const KEYS = ['finalidade', 'tipo', 'q', 'cidade', 'min', 'max', 'quartos', 'banheiros', 'vagas', 'ordem'] as const;

export default async function Imoveis({ searchParams }: { searchParams: SP }) {
  const f: Filters = {};
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  for (const k of KEYS) { const v = one(searchParams[k]); if (v) f[k] = v; }
  f.pagina = one(searchParams.pagina);

  const { items, total, page, error } = await searchProperties(f);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (n: number) => {
    const u = new URLSearchParams();
    for (const k of KEYS) if (f[k]) u.set(k, f[k]!);
    if (n > 1) u.set('pagina', String(n));
    const qs = u.toString();
    return qs ? `/imoveis?${qs}` : '/imoveis';
  };
  const hasFilter = KEYS.some((k) => f[k]);

  return (
    <>
      <div className="pagehead"><div className="wrap"><h1>Imóveis</h1><p className="muted" style={{ margin: 0 }}>{total} resultado{total === 1 ? '' : 's'}</p></div></div>
      <div className="wrap" style={{ padding: '28px 20px 56px' }}>
        <SearchForm v={f} compact />
        {error && <div className="alert bad" role="alert">{error}</div>}
        {!error && items.length === 0 && (
          <div className="empty">
            <h2>{hasFilter ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel publicado ainda'}</h2>
            <p className="muted">{hasFilter ? 'Tente ajustar ou limpar os filtros.' : 'Volte em breve ou fale com nossa equipe.'}</p>
            {hasFilter ? <Link href="/imoveis" className="btn btn-outline">Limpar filtros</Link> : <Link href="/contato" className="btn btn-primary">Falar com a equipe</Link>}
          </div>
        )}
        {items.length > 0 && <div className="cards">{items.map((p) => <PropertyCard key={p.id} p={p} />)}</div>}
        {pages > 1 && (
          <nav className="pager" aria-label="Paginação">
            {page > 1 && <Link href={link(page - 1)} rel="prev">Anterior</Link>}
            {Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2).map((n) =>
              n === page ? <span key={n} className="cur" aria-current="page">{n}</span> : <Link key={n} href={link(n)}>{n}</Link>)}
            {page < pages && <Link href={link(page + 1)} rel="next">Próxima</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
