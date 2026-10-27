import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseServer } from '@/lib/supabase/server';
import { isEmail, normalizePhone } from '@/lib/format';

const KINDS = ['comprar', 'alugar', 'anunciar', 'geral'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }

  // Honeypot: robôs preenchem; respondemos "ok" sem gravar.
  if (typeof b.website === 'string' && b.website.trim() !== '') return NextResponse.json({ ok: true });

  const s = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const kind = s(b.kind, 20);
  const name = s(b.name, 120);
  const phoneRaw = s(b.phone, 30);
  const email = s(b.email, 160);
  const subject = s(b.subject, 160);
  const message = s(b.message, 3000);
  const key = s(b.key, 80);
  const propertyId = typeof b.propertyId === 'string' && UUID.test(b.propertyId) ? b.propertyId : null;

  const fields: Record<string, string> = {};
  if (!KINDS.includes(kind)) return NextResponse.json({ error: 'Tipo de contato inválido.' }, { status: 400 });
  if (name.length < 2) fields.name = 'Informe seu nome.';
  const phone = normalizePhone(phoneRaw);
  if (!phone) fields.phone = 'Informe um telefone válido com DDD.';
  if (email && !isEmail(email)) fields.email = 'E-mail inválido.';
  if (b.consent !== true) fields.consent = 'É necessário concordar para enviar.';
  if (Object.keys(fields).length) return NextResponse.json({ error: 'Corrija os campos destacados.', fields }, { status: 422 });

  const sb = supabaseServer();
  if (!sb) return NextResponse.json({ error: 'Serviço indisponível no momento. Tente mais tarde.' }, { status: 503 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const ipHash = createHash('sha256').update(ip + (process.env.IP_HASH_SALT || '')).digest('hex');

  const { error } = await sb.rpc('submit_contact', {
    p_kind: kind, p_name: name, p_phone: `55${phone}`, p_email: email || null, p_subject: subject || null,
    p_message: message || null, p_property_id: propertyId, p_consent: true, p_key: key || null, p_ip_hash: ipHash,
  });

  if (error) {
    if (error.message.includes('rate_limited')) return NextResponse.json({ error: 'Muitos envios em pouco tempo. Tente novamente mais tarde.' }, { status: 429 });
    return NextResponse.json({ error: 'Não foi possível registrar sua mensagem. Tente novamente.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
