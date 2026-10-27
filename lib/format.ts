export const brl = (v: number | null | undefined) =>
  v == null ? '' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export const num = (v: number | null | undefined) =>
  v == null ? '' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

export const dateBR = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(iso)) : '';

export const dayBR = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(new Date(iso)) : '';

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const digits = (s: string) => s.replace(/\D/g, '');

/** Telefone brasileiro: 10 ou 11 dígitos (com DDD), aceitando prefixo 55. Retorna só dígitos ou null. */
export function normalizePhone(s: string): string | null {
  let d = digits(s);
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  return d.length === 10 || d.length === 11 ? d : null;
}

export const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

/** Número internacional do WhatsApp (somente dígitos, 10–15). Retorna null se inválido ou ausente. */
export function whatsappNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = digits(raw);
  if (d.length === 10 || d.length === 11) d = '55' + d; // número BR sem DDI
  return d.length >= 12 && d.length <= 15 ? d : null;
}

export function whatsappLink(raw: string | null | undefined, message: string): string | null {
  const n = whatsappNumber(raw);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}

export function propertyWhatsAppMessage(title: string, code: string) {
  return `Olá! Tenho interesse no imóvel ${title}, código ${code}. Gostaria de receber mais informações.`;
}
