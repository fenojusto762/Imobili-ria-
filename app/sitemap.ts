import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/data';
import { siteUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const slugs = await getAllSlugs();
  const fixed = ['', '/imoveis', '/anuncie', '/sobre', '/contato', '/privacidade'].map((p) => ({ url: `${base}${p}` }));
  return [...fixed, ...slugs.map((s) => ({ url: `${base}/imoveis/${s.slug}`, ...(s.updated ? { lastModified: new Date(s.updated) } : {}) }))];
}
