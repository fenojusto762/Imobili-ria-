import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import PropertyCard from '@/components/PropertyCard';
import { getCategoryCounts, getFeatured, getRecent, getSettings } from '@/lib/data';
import { TYPES } from '@/lib/types';
import { whatsappLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [s, featured, recent, counts] = await Promise.all([getSettings(), getFeatured(6), getRecent(6), getCategoryCounts()]);
  const featuredIds = new Set(featured.map((p) => p.id));
  const recentOnly = recent.filter((p) => !featuredIds.has(p.id));
  const wa = whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.company_name} e gostaria de falar com um corretor.`);
  const hasAny = featured.length + recent.length > 0;

  return (
    <>
      <section className="hero" style={s.hero_image_url ? { backgroundImage: `url(${s.hero_image_url})` } : undefined}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: '#e3c88f' }}>{s.company_name}</span>
          <h1>{s.hero_title || 'Encontre o imóvel certo para o seu momento'}</h1>
          <p>{s.hero_subtitle || 'Compre ou alugue com atendimento próximo, transparente e orientação em cada etapa.'}</p>
          <Link href="/imoveis" className="btn btn-gold">Ver todos os imóveis</Link>
        </div>
      </section>
      <div className="wrap"><SearchForm /></div>

      {featured.length > 0 && (
        <section className="s">
          <div className="wrap">
            <span className="eyebrow">Seleção</span><h2>Imóveis em destaque</h2>
            <div className="cards">{featured.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      {recentOnly.length > 0 && (
        <section className={`s ${featured.length ? 'alt' : ''}`}>
          <div className="wrap">
            <span className="eyebrow">Novidades</span><h2>Imóveis recentes</h2>
            <div className="cards">{recentOnly.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
            <p style={{ marginTop: 24 }}><Link className="btn btn-outline" href="/imoveis">Ver todos</Link></p>
          </div>
        </section>
      )}

      {!hasAny && (
        <section className="s">
          <div className="wrap">
            <div className="empty">
              <h2>Em breve, novos imóveis por aqui</h2>
              <p className="muted">Ainda não há imóveis publicados. Fale com nossa equipe para conhecer as oportunidades disponíveis.</p>
              <Link href="/contato" className="btn btn-primary">Entrar em contato</Link>
            </div>
          </div>
        </section>
      )}

      <section className="s alt">
        <div className="wrap">
          <span className="eyebrow">Categorias</span><h2>Explore por tipo de imóvel</h2>
          <div className="cats">
            {Object.entries(TYPES).map(([k, l]) => (
              <Link key={k} className="cat" href={`/imoveis?tipo=${k}`}>{l}<small>{counts[k] ? `${counts[k]} anúncio${counts[k] > 1 ? 's' : ''}` : 'Ver imóveis'}</small></Link>
            ))}
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap split">
          <div>
            <span className="eyebrow">Sobre nós</span>
            <h2>{s.about_title || s.company_name}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{s.about_text || s.description || 'Atuamos na intermediação de compra, venda e locação de imóveis, com foco em atendimento de confiança.'}</p>
            <Link href="/sobre" className="btn btn-outline">Conheça a imobiliária</Link>
          </div>
          <div>
            {s.about_image_url ? <img src={s.about_image_url} alt={`Equipe ${s.company_name}`} loading="lazy" style={{ borderRadius: 12, width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} /> : (
              <div className="diffs" style={{ gridTemplateColumns: '1fr' }}>
                <div className="diff"><h3>Atendimento personalizado</h3><p className="muted">Entendemos o que você procura antes de indicar opções.</p></div>
                <div className="diff"><h3>Informação clara</h3><p className="muted">Valores, características e situação do imóvel apresentados com transparência.</p></div>
                <div className="diff"><h3>Apoio até a conclusão</h3><p className="muted">Acompanhamento em visitas, negociação e orientação sobre as etapas.</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="s alt">
        <div className="wrap">
          <span className="eyebrow">Por que escolher</span><h2>Nossos diferenciais</h2>
          <div className="diffs">
            <div className="diff"><h3>Atendimento direto</h3><p className="muted">Converse com a equipe pelo WhatsApp ou formulário.</p></div>
            <div className="diff"><h3>Imóveis selecionados</h3><p className="muted">Anúncios organizados por finalidade, tipo e região.</p></div>
            <div className="diff"><h3>Compra e locação</h3><p className="muted">Soluções para quem quer comprar, alugar ou anunciar.</p></div>
            <div className="diff"><h3>Processo acompanhado</h3><p className="muted">Orientação do primeiro contato à entrega das chaves.</p></div>
          </div>
        </div>
      </section>

      <section className="s">
        <div className="wrap">
          <div className="band">
            <div>
              <h2>{s.owner_cta_title || 'Quer anunciar seu imóvel?'}</h2>
              <p>{s.owner_cta_text || 'Envie os dados do seu imóvel e nossa equipe entrará em contato para apresentar como podemos ajudar na venda ou locação.'}</p>
            </div>
            <Link href="/anuncie" className="btn btn-gold">Anunciar meu imóvel</Link>
          </div>
        </div>
      </section>

      {wa && (
        <section className="s alt">
          <div className="wrap" style={{ textAlign: 'center' }}>
            <h2>Prefere falar agora?</h2>
            <p className="muted">Tire suas dúvidas diretamente com nossa equipe.</p>
            <a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </section>
      )}
    </>
  );
}
