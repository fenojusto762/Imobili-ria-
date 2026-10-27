import type { Settings } from '@/lib/types';
import { whatsappLink } from '@/lib/format';

export default function WhatsAppFloat({ s }: { s: Settings }) {
  const href = whatsappLink(s.whatsapp, `Olá! Vim pelo site da ${s.company_name} e gostaria de mais informações.`);
  if (!href) return null;
  return (
    <a className="wafloat" href={href} target="_blank" rel="noopener noreferrer" aria-label="Falar pelo WhatsApp">
      WhatsApp
    </a>
  );
}
