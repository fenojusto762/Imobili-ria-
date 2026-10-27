export type Purpose = 'venda' | 'aluguel' | 'ambas';
export type Status = 'disponivel' | 'reservado' | 'vendido' | 'alugado';

export interface Property {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  purpose: Purpose;
  sale_price: number | null;
  rent_price: number | null;
  condo_fee: number | null;
  iptu: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  total_area: number | null;
  built_area: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking: number | null;
  features: string[];
  status: Status;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  cover_path?: string | null;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  path: string;
  alt: string | null;
  position: number;
}

export interface Settings {
  company_name: string;
  tagline: string | null;
  description: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  about_title: string | null;
  about_text: string | null;
  about_image_url: string | null;
  owner_cta_title: string | null;
  owner_cta_text: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  cities: string | null;
  hours: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
  creci: string | null;
}

export const TYPES: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  sala_comercial: 'Sala comercial',
  outros: 'Outros',
};
export const PURPOSES: Record<string, string> = { venda: 'Venda', aluguel: 'Aluguel', ambas: 'Venda e aluguel' };
export const STATUSES: Record<string, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
};
