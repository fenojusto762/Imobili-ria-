import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PropertyView from '@/components/PropertyView';
import { getPropertyBySlug, getSettings, getSimilar } from '@/lib/data';
import { publicUrl } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/format';
import { TYPES } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await getPropertyBySlug(params.slug);
  if (!r) return { title: 'Imóvel não encontrado', robots: { index: false } };
  const { property: p, images } = r;
  const place = [p.neighborhood, p.city].filter(Boolean).join(', ');
  const desc = (p.description || `${TYPES[p.type] ?? 'Imóvel'}${place ? ` em ${place}` : ''}. Código ${p.code}.`).replace(/\s+/g, ' ').slice(0, 160);
  const img = images[0] ? publicUrl(images[0].path) : undefined;
  return {
    title: p.title, description: desc,
    alternates: { canonical: `/imoveis/${p.slug}` },
    openGraph: { title: p.title, description: desc, type: 'website', url: `/imoveis/${p.slug}`, images: img ? [img] : undefined },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const r = await getPropertyBySlug(params.slug);
  if (!r) notFound();
  const [s, similar] = await Promise.all([getSettings(), getSimilar(r.property)]);
  const p = r.property;
  const price = p.purpose === 'aluguel' ? p.rent_price : p.sale_price;
  const ld = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: p.title, url: `${siteUrl()}/imoveis/${p.slug}`,
    ...(p.published_at ? { datePosted: p.published_at } : {}),
    ...(r.images[0] ? { image: publicUrl(r.images[0].path) } : {}),
    ...(price ? { offers: { '@type': 'Offer', price, priceCurrency: 'BRL' } } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <PropertyView p={p} images={r.images} s={s} similar={similar} />
    </>
  );
}
