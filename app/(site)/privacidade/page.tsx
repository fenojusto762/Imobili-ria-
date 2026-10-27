import type { Metadata } from 'next';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Política de Privacidade', alternates: { canonical: '/privacidade' } };

export default async function Privacidade() {
  const s = await getSettings();
  return (
    <div className="wrap" style={{ padding: '40px 20px 64px', maxWidth: 820 }}>
      <h1>Política de Privacidade</h1>
      <p className="muted">Modelo informativo em conformidade com a LGPD (Lei nº 13.709/2018). Recomenda-se revisão por assessoria jurídica antes da publicação definitiva.</p>
      <h2>Quais dados coletamos</h2>
      <p>Nos formulários do site coletamos nome, telefone, e-mail (opcional), assunto, mensagem e, quando aplicável, o imóvel de interesse. Para proteção contra spam, guardamos um código irreversível (hash) derivado do endereço IP, sem armazenar o IP em si.</p>
      <h2>Para que usamos</h2>
      <p>Somente para responder à sua solicitação, apresentar imóveis compatíveis e dar andamento a negociações de compra, venda ou locação.</p>
      <h2>Compartilhamento e armazenamento</h2>
      <p>Os dados ficam em banco de dados protegido, com acesso restrito à equipe autorizada de {s.company_name}. Não vendemos seus dados.</p>
      <h2>Seus direitos</h2>
      <p>Você pode solicitar confirmação, acesso, correção, anonimização ou exclusão dos seus dados e revogar o consentimento a qualquer momento{s.email ? <> pelo e-mail <a href={`mailto:${s.email}`}>{s.email}</a></> : ' pelos canais de contato desta página'}.</p>
    </div>
  );
}
