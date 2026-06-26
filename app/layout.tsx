import type { Metadata, Viewport } from 'next';
import { Oswald, Inter } from 'next/font/google';
import './globals.css';
import RegistoServiceWorker from '@/components/RegistoServiceWorker';

// Tipografia com garra: condensada e forte para titulos.
const fonteTitulo = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--fonte-titulo',
  display: 'swap',
});

// Sans limpo e legivel para o corpo.
const fonteCorpo = Inter({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "N'ASA | Gestao",
  description: 'Gestao interna dos N\'ASA, concertos, propostas, equipa e repertorio.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "N'ASA",
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Permite que a app ocupe o ecra todo, por baixo do entalhe.
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}>
      <body>
        {children}
        <RegistoServiceWorker />
      </body>
    </html>
  );
}
