import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';

const onest = Onest({ subsets: ['latin'], variable: '--font-onest' });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CK Sushi | Rodízio Japonês em Votorantim',
    template: '%s | CK Sushi',
  },
  description: 'Rodízio japonês em Votorantim, no Connect Two, próximo ao Alphaville Nova Esplanada. Peixes frescos, ambiente elegante e reservas pelo WhatsApp.',
  applicationName: 'CK Sushi',
  authors: [{ name: 'CK Sushi' }],
  creator: 'CK Sushi',
  keywords: ['CK Sushi', 'rodízio japonês', 'restaurante japonês em Votorantim', 'sushi Votorantim', 'Nova Esplanada', 'Connect Two'],
  alternates: { canonical: '/' },
  icons: { icon: '/ck-logo.png', shortcut: '/ck-logo.png', apple: '/ck-logo.png' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'CK Sushi',
    title: 'CK Sushi | Rodízio Japonês em Votorantim',
    description: 'Uma experiência completa de rodízio japonês, com frescor, variedade e ambiente elegante em Votorantim.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CK Sushi — Rodízio japonês em Votorantim' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CK Sushi | Rodízio Japonês em Votorantim',
    description: 'Uma experiência completa de rodízio japonês em Votorantim.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'CK Sushi',
  image: `${siteUrl}/og.png`,
  url: siteUrl,
  telephone: '+55 15 99184-3232',
  servesCuisine: 'Japonesa',
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida Júlio Cassola, 1405 — Connect Two',
    addressLocality: 'Votorantim',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={onest.variable}>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }} />
      </body>
    </html>
  );
}
