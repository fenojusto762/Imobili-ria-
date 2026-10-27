import Link from 'next/link';
import type { Settings } from '@/lib/types';
import { whatsappNumber } from '@/lib/format';

export default function Footer({ s }: { s: Settings }) {
  const socials = [
    ['Instagram', s.instagram], ['Facebook', s.facebook], ['YouTube', s.youtube], ['LinkedIn', s.linkedin],
  ].filter(([, u]) => u) as [string, string][];
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="cols">
          <div>
            <h3>{s.company_name}</h3>
            {s.description && <p>{s.description}</p>}
            {s.creci && <p>CRECI: {s.creci}</p>}
            {socials.length > 0 && (
              <ul aria-label="Redes sociais" style={{ gridAutoFlow: 'column', justifyContent: 'start', gap: 16 }}>
                {socials.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noopener noreferrer">{n}</a></li>)}
              </ul>
            )}
          </div>
          <div>
            <h3>Navegação</h3>
            <ul>
              <li><Link href="/imoveis">Imóveis</Link></li>
              <li><Link href="/anuncie">Anuncie seu imóvel</Link></li>
              <li><Link href="/sobre">Sobre nós</Link></li>
              <li><Link href="/contato">Contato</Link></li>
              <li><Link href="/privacidade">Política de privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h3>Contato</h3>
            <ul>
              {s.phone && <li>Telefone: <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a></li>}
              {whatsappNumber(s.whatsapp) && <li>WhatsApp: {s.whatsapp}</li>}
              {s.email && <li><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.address && <li>{s.address}</li>}
              {s.hours && <li>Atendimento: {s.hours}</li>}
              {s.cities && <li>Atendemos: {s.cities}</li>}
            </ul>
          </div>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} {s.company_name}. Todos os direitos reservados.
          {' · '}<Link href="/admin/login" rel="nofollow">Área administrativa</Link>
        </div>
      </div>
    </footer>
  );
}
