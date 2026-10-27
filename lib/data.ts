import { supabaseServer } from './supabase/server';
import type { Property, PropertyImage, Settings } from './types';

export const PAGE_SIZE = 12;

const EMPTY_SETTINGS: Settings = {
  company_name: 'Conceito Soluções Imobiliárias',
  tagline: null, description: null, hero_title: null, hero_subtitle: null, hero_image_url: null,
  logo_url: null, about_title: null, about_text: null, about_image_url: null, owner_cta_title: null,
  owner_cta_text: null, whatsapp: null, phone: null, email: null, address: null, cities: null,
  hours: null, instagram: null, facebook: null, youtube: null, linkedin: null, creci: null,
};

export async function getSettings(): Promise<Settings> {
  const sb = supabaseServer();
  if (!sb) return EMPTY_SETTINGS;
  const { data } = await sb.from('site_settings').select('*').eq('id', 1).maybeSingle();
  return { ...EMPTY_SETTINGS, ...(data ?? {}) } as Settings;
}

export interface Filters {
  finalidade?: string; tipo?: string; q?: string; cidade?: string; min?: string; max?: string;
  quartos?: string; banheiros?: string; vagas?: string; ordem?: string; pagina?: string;
}

const clean = (s: string) => s.replace(/[,()%*\\]/g, ' ').trim();
const toNum = (s?: string) => { const n = Number(s); return s && Number.isFinite(n) && n >= 0 ? n : null; };

export async function searchProperties(f: Filters): Promise<{ items: Property[]; total: number; page: number; error?: string }> {
  const sb = supabaseServer();
  const page = Math.max(1, parseInt(f.pagina || '1', 10) || 1);
  if (!sb) return { items: [], total: 0, page, error: 'Banco de dados não configurado.' };

  let q = sb.from('public_properties').select('*', { count: 'exact' });
  if (f.finalidade === 'venda') q = q.in('purpose', ['venda', 'ambas']);
  if (f.finalidade === 'aluguel') q = q.in('purpose', ['aluguel', 'ambas']);
  if (f.tipo) q = q.eq('type', f.tipo);
  if (f.cidade) q = q.ilike('city', `%${clean(f.cidade)}%`);
  if (f.q) {
    const t = clean(f.q);
    if (t) q = q.or(`title.ilike.%${t}%,description.ilike.%${t}%,neighborhood.ilike.%${t}%,city.ilike.%${t}%,code.ilike.%${t}%`);
  }
  const priceCol = f.finalidade === 'aluguel' ? 'rent_price' : 'sale_price';
  const min = toNum(f.min), max = toNum(f.max);
  if (min != null) q = q.gte(priceCol, min);
  if (max != null) q = q.lte(priceCol, max);
  const bq = toNum(f.quartos), bb = toNum(f.banheiros), bv = toNum(f.vagas);
  if (bq != null) q = q.gte('bedrooms', bq);
  if (bb != null) q = q.gte('bathrooms', bb);
  if (bv != null) q = q.gte('parking', bv);

  switch (f.ordem) {
    case 'menor': q = q.order(priceCol, { ascending: true, nullsFirst: false }); break;
    case 'maior': q = q.order(priceCol, { ascending: false, nullsFirst: false }); break;
    case 'antigos': q = q.order('published_at', { ascending: true }); break;
    default: q = q.order('published_at', { ascending: false });
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1);
  if (error) return { items: [], total: 0, page, error: 'Não foi possível carregar os imóveis agora.' };
  return { items: (data ?? []) as Property[], total: count ?? 0, page };
}

export async function getFeatured(limit = 6): Promise<Property[]> {
  const sb = supabaseServer();
  if (!sb) return [];
  const { data } = await sb.from('public_properties').select('*').eq('featured', true)
    .order('published_at', { ascending: false }).limit(limit);
  return (data ?? []) as Property[];
}

export async function getRecent(limit = 6): Promise<Property[]> {
  const sb = supabaseServer();
  if (!sb) return [];
  const { data } = await sb.from('public_properties').select('*').order('published_at', { ascending: false }).limit(limit);
  return (data ?? []) as Property[];
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const sb = supabaseServer();
  if (!sb) return {};
  const { data } = await sb.from('public_properties').select('type');
  const out: Record<string, number> = {};
  (data ?? []).forEach((r: { type: string }) => { out[r.type] = (out[r.type] || 0) + 1; });
  return out;
}

export async function getPropertyBySlug(slug: string): Promise<{ property: Property; images: PropertyImage[] } | null> {
  const sb = supabaseServer();
  if (!sb) return null;
  const { data } = await sb.from('public_properties').select('*').eq('slug', slug).maybeSingle();
  if (!data) return null;
  const { data: imgs } = await sb.from('property_images').select('*').eq('property_id', data.id).order('position');
  return { property: data as Property, images: (imgs ?? []) as PropertyImage[] };
}

export async function getSimilar(p: Property, limit = 3): Promise<Property[]> {
  const sb = supabaseServer();
  if (!sb) return [];
  let q = sb.from('public_properties').select('*').neq('id', p.id).eq('type', p.type);
  if (p.city) q = q.eq('city', p.city);
  const { data } = await q.order('published_at', { ascending: false }).limit(limit);
  return (data ?? []) as Property[];
}

export async function getAllSlugs(): Promise<{ slug: string; updated: string | null }[]> {
  const sb = supabaseServer();
  if (!sb) return [];
  const { data } = await sb.from('public_properties').select('slug, published_at').order('published_at', { ascending: false }).limit(5000);
  return (data ?? []).map((r: { slug: string; published_at: string | null }) => ({ slug: r.slug, updated: r.published_at }));
}
