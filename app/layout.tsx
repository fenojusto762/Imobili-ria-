import type { Metadata } from 'next';
import './globals.css';
import { getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const desc = s.description || `${s.company_name}: imóveis para venda e aluguel.`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.company_name, template: `%s | ${s.company_name}` },
    description: desc,
    openGraph: { siteName: s.company_name, type: 'website', locale: 'pt_BR', title: s.company_name, description: desc, images: s.hero_image_url ? [s.hero_image_url] : undefined },
    twitter: { card: 'summary_large_image' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
