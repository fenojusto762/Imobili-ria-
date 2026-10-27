import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/data';
import { whatsappLink } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Contato', description: 'Fale com a nossa equipe.', alternates: { canonical: '/contato' } };

export default async function Contato() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.company_name} e gostaria de mais informações.`);
  return (
    <div className="wrap" style={{ padding: '40px 20px 64px' }}>
      <h1>Fale conosco</h1>
      <div className="split" style={{ alignItems: 'start' }}>
        <div className="panel">
          <ContactForm kind="geral" showSubject submitLabel="Enviar mensagem" />
        </div>
        <div>
          <h2>Canais de atendimento</h2>
          {wa && <p><a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a></p>}
          {s.phone && <p>Telefone: <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a></p>}
          {s.email && <p>E-mail: <a href={`mailto:${s.email}`}>{s.email}</a></p>}
          {s.address && <p>Endereço: {s.address}</p>}
          {s.hours && <p>Horário: {s.hours}</p>}
          {!wa && !s.phone && !s.email && !s.address && <p className="muted">Use o formulário ao lado e retornaremos o contato.</p>}
        </div>
      </div>
    </div>
  );
}
