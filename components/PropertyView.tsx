import Link from 'next/link';
import type { Property, PropertyImage, Settings } from '@/lib/types';
import { STATUSES, TYPES } from '@/lib/types';
import { brl, dayBR, num, propertyWhatsAppMessage, whatsappLink } from '@/lib/format';
import { publicUrl } from '@/lib/supabase/client';
import Gallery from './Gallery';
import ShareButton from './ShareButton';
import ContactForm from './ContactForm';
import PropertyCard from './PropertyCard';

export default function PropertyView({
  p, images, s, similar = [], preview = false,
}: { p: Property; images: PropertyImage[]; s: Settings; similar?: Property[]; preview?: boolean }) {
  const wa = whatsappLink(s.whatsapp, propertyWhatsAppMessage(p.title, p.code));
  const urls = images.map((i) => publicUrl(i.path));
  const place = [p.neighborhood, p.city].filter(Boolean).join(', ') + (p.state ? ` – ${p.state}` : '');
  const kind = p.purpose === 'aluguel' ? 'alugar' : 'comprar';
  const spec: [string, string][] = [];
  if (p.bedrooms != null) spec.push(['Quartos', String(p.bedrooms)]);
  if (p.suites != null) spec.push(['Suítes', String(p.suites)]);
  if (p.bathrooms != null) spec.push(['Banheiros', String(p.bathrooms)]);
  if (p.parking != null) spec.push(['Vagas', String(p.parking)]);
  if (p.total_area != null) spec.push(['Área total', `${num(p.total_area)} m²`]);
  if (p.built_area != null) spec.push(['Área construída', `${num(p.built_area)} m²`]);

  return (
    <div className="wrap">
      {preview && <div className="alert info" style={{ marginTop: 16 }}>Pré-visualização administrativa — {p.published_at ? 'imóvel publicado' : 'este imóvel ainda não está publicado'}.</div>}
      <nav className="crumbs" aria-label="Você está em">
        <Link href="/imoveis">← Voltar à listagem</Link>
      </nav>
      <Gallery urls={urls} title={p.title} />
      <div className="pgrid">
        <article>
          <span className="eyebrow">{TYPES[p.type] ?? p.type} · Código {p.code}{p.status !== 'disponivel' ? ` · ${STATUSES[p.status]}` : ''}</span>
          <h1 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)' }}>{p.title}</h1>
          {place.trim() !== '' && place.trim() !== '–' && <p className="muted">{place}</p>}
          {p.address && <p className="muted">{p.address}</p>}
          <div className="spec">{spec.map(([k, v]) => <div key={k}><span className="muted">{k}</span><b>{v}</b></div>)}</div>
          {p.description && (<><h2>Descrição</h2><p style={{ whiteSpace: 'pre-line' }}>{p.description}</p></>)}
          {p.features?.length > 0 && (<><h2>Características e diferenciais</h2><ul className="chips">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></>)}
          {p.published_at && <p className="muted" style={{ fontSize: '.85rem' }}>Publicado em {dayBR(p.published_at)}</p>}
        </article>
        <aside className="side" aria-label="Valores e contato">
          {(p.purpose === 'venda' || p.purpose === 'ambas') && p.sale_price != null && <div><span className="muted">Venda</span><div className="price">{brl(p.sale_price)}</div></div>}
          {(p.purpose === 'aluguel' || p.purpose === 'ambas') && p.rent_price != null && <div><span className="muted">Aluguel</span><div className="price">{brl(p.rent_price)}/mês</div></div>}
          {p.condo_fee != null && <p className="muted" style={{ margin: '6px 0' }}>Condomínio: {brl(p.condo_fee)}</p>}
          {p.iptu != null && <p className="muted" style={{ margin: '6px 0' }}>IPTU: {brl(p.iptu)}</p>}
          <div className="row" style={{ margin: '14px 0' }}>
            {wa && <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer">Consultar pelo WhatsApp</a>}
            <ShareButton title={p.title} />
          </div>
          {!preview && p.status === 'disponivel' && (
            <>
              <h3 id="info">Solicitar mais informações</h3>
              <ContactForm kind={kind} propertyId={p.id} propertyLabel={`${p.title} (${p.code})`}
                messagePlaceholder="Gostaria de agendar uma visita ou saber mais detalhes…" submitLabel="Solicitar informações" />
            </>
          )}
          {!preview && p.status !== 'disponivel' && <div className="alert info">Este imóvel está {STATUSES[p.status].toLowerCase()}. <Link href="/imoveis">Veja outros imóveis</Link>.</div>}
        </aside>
      </div>
      {similar.length > 0 && (
        <section style={{ padding: '48px 0' }}>
          <h2>Imóveis semelhantes</h2>
          <div className="cards">{similar.map((x) => <PropertyCard key={x.id} p={x} />)}</div>
        </section>
      )}
    </div>
  );
}
