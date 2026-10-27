import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Anuncie seu imóvel', description: 'Proprietário? Envie os dados do seu imóvel para venda ou aluguel.', alternates: { canonical: '/anuncie' } };

export default async function Anuncie() {
  const s = await getSettings();
  return (
    <div className="wrap" style={{ padding: '40px 20px 64px' }}>
      <h1>{s.owner_cta_title || 'Anuncie seu imóvel'}</h1>
      <p className="muted" style={{ maxWidth: 680 }}>{s.owner_cta_text || 'Conte um pouco sobre o imóvel (tipo, localização, valor pretendido) e nossa equipe entrará em contato.'}</p>
      <div className="panel" style={{ maxWidth: 680 }}>
        <ContactForm kind="anunciar" showSubject messagePlaceholder="Tipo do imóvel, bairro/cidade, finalidade (venda/aluguel) e valor pretendido" submitLabel="Quero anunciar" />
      </div>
    </div>
  );
}
