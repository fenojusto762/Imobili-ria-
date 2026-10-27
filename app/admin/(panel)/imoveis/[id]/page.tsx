import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import PropertyForm, { type FormProperty } from '@/components/admin/PropertyForm';
import ImagesManager from '@/components/admin/ImagesManager';

export const dynamic = 'force-dynamic';
const s = (v: unknown) => (v == null ? '' : String(v));

export default async function Editar({ params, searchParams }: { params: { id: string }; searchParams: { novo?: string } }) {
  const sb = supabaseServer();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { data: p } = await sb.from('properties').select('*').eq('id', params.id).maybeSingle();
  if (!p) notFound();
  const init: FormProperty = {
    id: p.id, code: p.code, slug: p.slug, title: p.title, description: s(p.description), type: p.type, purpose: p.purpose,
    sale_price: s(p.sale_price), rent_price: s(p.rent_price), condo_fee: s(p.condo_fee), iptu: s(p.iptu),
    address: s(p.address), show_address: !!p.show_address, neighborhood: s(p.neighborhood), city: s(p.city), state: s(p.state),
    total_area: s(p.total_area), built_area: s(p.built_area), bedrooms: s(p.bedrooms), suites: s(p.suites),
    bathrooms: s(p.bathrooms), parking: s(p.parking), features: (p.features ?? []).join('\n'), status: p.status,
    featured: !!p.featured, published: !!p.published, owner_name: s(p.owner_name), owner_phone: s(p.owner_phone), internal_notes: s(p.internal_notes),
  };
  return (
    <>
      <h1 style={{ fontSize: '1.8rem' }}>Editar imóvel</h1>
      {searchParams.novo && <div className="alert ok">Imóvel criado. Agora você pode enviar as fotografias abaixo.</div>}
      <PropertyForm initial={init} />
      <ImagesManager propertyId={p.id} />
    </>
  );
}
