import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sobre', description: 'Conheça a imobiliária.', alternates: { canonical: '/sobre' } };

export default async function Sobre() {
  const s = await getSettings();
  return (
    <div className="wrap" style={{ padding: '40px 20px 64px' }}>
      <h1>{s.about_title || `Sobre a ${s.company_name}`}</h1>
      <div className="split" style={{ alignItems: 'start' }}>
        <div>
          <p style={{ whiteSpace: 'pre-line' }}>{s.about_text || s.description || 'Informações institucionais em breve.'}</p>
          {s.cities && <p><strong>Regiões atendidas:</strong> {s.cities}</p>}
          {s.creci && <p><strong>CRECI:</strong> {s.creci}</p>}
          <Link className="btn btn-primary" href="/contato">Fale conosco</Link>
        </div>
        {s.about_image_url && <img src={s.about_image_url} alt={s.company_name} style={{ borderRadius: 12, width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} loading="lazy" />}
      </div>
    </div>
  );
}
