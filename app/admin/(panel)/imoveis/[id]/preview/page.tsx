import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { getSettings } from '@/lib/data';
import PropertyView from '@/components/PropertyView';
import type { Property, PropertyImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Preview({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { data: p } = await sb.from('properties').select('*').eq('id', params.id).maybeSingle();
  if (!p) notFound();
  const { data: imgs } = await sb.from('property_images').select('*').eq('property_id', p.id).order('position');
  const s = await getSettings();
  // A pré-visualização mostra o endereço apenas se autorizado, igual ao site público.
  const view = { ...p, address: p.show_address ? p.address : null } as Property;
  return (
    <div style={{ background: '#fff', borderRadius: 12 }}>
      <PropertyView p={view} images={(imgs ?? []) as PropertyImage[]} s={s} preview />
    </div>
  );
}
