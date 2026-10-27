import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      <Header s={s} />
      <main id="conteudo">{children}</main>
      <Footer s={s} />
      <WhatsAppFloat s={s} />
    </>
  );
}
