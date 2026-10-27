import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import PropertyCard from '@/components/PropertyCard';
import HeroModel from '@/components/HeroModel';
import CategoryIcon from '@/components/CategoryIcon';
import { getCategoryCounts, getFeatured, getRecent, getSettings } from '@/lib/data';
import { TYPES } from '@/lib/types';
import { whatsappLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
);

export default async function Home() {
  const [s, featured, recent, counts] = await Promise.all([getSettings(), getFeatured(6), getRecent(6), getCategoryCounts()]);
  const featuredIds = new Set(featured.map((p) => p.id));
  const recentOnly = recent.filter((p) => !featuredIds.has(p.id));
  const wa = whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.company_name} e gostaria de falar com um corretor.`);
  const hasAny = featured.length + recent.length > 0;

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>{s.hero_title || 'Encontre o imóvel certo para o seu momento'}</h1>
            <p className="lead">{s.hero_subtitle || 'Compre ou alugue com atendimento próximo, transparente e orientação em cada etapa.'}</p>
            <div className="hero-cta">
              <Link href="/imoveis" className="btn btn-gold">Ver imóveis</Link>
              <Link href="/anuncie" className="btn btn-ghost">Anunciar meu imóvel</Link>
            </div>
          </div>
          <div className="hero-art">
            {s.hero_image_url ? (
              <div className="arch"><img src={s.hero_image_url} alt={s.company_name} /></div>
            ) : (
              <HeroModel />
            )}
          </div>
        </div>
      </section>
      <div className="wrap searchwrap"><SearchForm /></div>

      <section className="s" style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <div className="paths">
            <Link href="/imoveis?finalidade=venda" className="path p1">
              <div><h3>Comprar</h3><p>Casas, apartamentos, terrenos e salas à venda.</p></div>
              <span className="go"><Chevron /></span>
            </Link>
            <Link href="/imoveis?finalidade=aluguel" className="path p2">
              <div><h3>Alugar</h3><p>Imóveis para morar ou trabalhar, prontos para uso.</p></div>
              <span className="go"><Chevron /></span>
            </Link>
            <Link href="/anuncie" className="path p3">
              <div><h3>Anunciar</h3><p>Proprietário? Conte com a nossa equipe para vender ou alugar.</p></div>
              <span className="go"><Chevron /></span>
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="s">
          <div className="wrap">
            <div className="sechead"><h2>Imóveis em destaque</h2><Link className="link" href="/imoveis">Ver todos os imóveis</Link></div>
            <div className="cards">{featured.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      {recentOnly.length > 0 && (
        <section className={`s ${featured.length ? 'alt' : ''}`}>
          <div className="wrap">
            <div className="sechead"><h2>Chegaram agora</h2><Link className="link" href="/imoveis">Ver todos os imóveis</Link></div>
            <div className="cards">{recentOnly.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      {!hasAny && (
        <section className="s">
          <div className="wrap">
            <div className="empty">
              <h2>Em breve, novos imóveis por aqui</h2>
              <p className="muted" style={{ margin: '0 auto 22px' }}>Ainda não há imóveis publicados. Fale com nossa equipe para conhecer as oportunidades disponíveis.</p>
              <Link href="/contato" className="btn btn-primary">Falar com a equipe</Link>
            </div>
          </div>
        </section>
      )}

      <section className="s alt">
        <div className="wrap">
          <div className="sechead"><h2>Explore por tipo de imóvel</h2></div>
          <div className="cats">
            {Object.entries(TYPES).map(([k, l]) => (
              <Link key={k} className="cat" href={`/imoveis?tipo=${k}`}>
                <CategoryIcon type={k} />
                <span><b>{l}</b><small>{counts[k] ? `${counts[k]} anúncio${counts[k] > 1 ? 's' : ''}` : 'Ver imóveis'}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap split">
          <div>
            <h2>{s.about_title || s.company_name}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{s.about_text || s.description || 'Atuamos na intermediação de compra, venda e locação de imóveis, com foco em atendimento de confiança.'}</p>
            <p style={{ marginTop: 26 }}><Link href="/sobre" className="btn btn-outline">Conheça a imobiliária</Link></p>
          </div>
          <div>
            {s.about_image_url ? (
              <img className="about-img" src={s.about_image_url} alt={`Equipe ${s.company_name}`} loading="lazy" />
            ) : (
              <div className="diffs col1">
                <div className="diff"><h3>Atendimento personalizado</h3><p>Entendemos o que você procura antes de indicar opções.</p></div>
                <div className="diff"><h3>Informação clara</h3><p>Valores, características e situação do imóvel apresentados com transparência.</p></div>
                <div className="diff"><h3>Apoio até a conclusão</h3><p>Acompanhamento em visitas, negociação e orientação sobre as etapas.</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="s alt">
        <div className="wrap">
          <div className="sechead"><h2>Como trabalhamos</h2></div>
          <div className="diffs">
            <div className="diff"><h3>Atendimento direto</h3><p>Converse com a equipe pelo WhatsApp ou pelo formulário, sem intermediários.</p></div>
            <div className="diff"><h3>Imóveis selecionados</h3><p>Anúncios organizados por finalidade, tipo e região para você comparar rápido.</p></div>
            <div className="diff"><h3>Compra e locação</h3><p>Soluções para quem quer comprar, alugar ou anunciar um imóvel.</p></div>
            <div className="diff"><h3>Processo acompanhado</h3><p>Orientação do primeiro contato até a entrega das chaves.</p></div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="band">
            <svg className="deco" viewBox="-100 -120 200 240" fill="none" stroke="#fff" strokeWidth="1.2" aria-hidden="true">
              <polygon points="0,-110 86,-60 86,40 0,90 -86,40 -86,-60" />
              <polyline points="-86,-60 0,-10 86,-60" />
              <line x1="0" y1="-10" x2="0" y2="90" />
              <polygon points="0,-60 43,-35 0,-10 -43,-35" />
            </svg>
            <div>
              <h2>{s.owner_cta_title || 'Quer anunciar seu imóvel?'}</h2>
              <p>{s.owner_cta_text || 'Envie os dados do seu imóvel e nossa equipe entrará em contato para apresentar como podemos ajudar na venda ou locação.'}</p>
            </div>
            <div><Link href="/anuncie" className="btn btn-gold">Anunciar meu imóvel</Link></div>
          </div>
        </div>
      </section>

      {wa && (
        <section className="s alt" style={{ padding: '56px 0' }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <h2>Prefere falar agora?</h2>
            <p className="muted" style={{ margin: '0 auto 22px' }}>Tire suas dúvidas diretamente com a nossa equipe.</p>
            <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </section>
      )}
    </>
  );
}
