import type { Metadata, Viewport } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import RegistoServiceWorker from '@/components/RegistoServiceWorker';

// Serif mistica e elegante para os titulos, a remeter para o esoterico.
const fonteTitulo = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--fonte-titulo',
  display: 'swap',
});

// Sans limpo e legivel para o corpo, para a app ser leve e funcional.
const fonteCorpo = Inter({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '3 Sigilos | Organização',
  description: 'Organização da 3 Sigilos: stock, desenhos, clientes, encomendas e faturação.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '3 Sigilos',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a090d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Permite que a app ocupe o ecra todo, por baixo do entalhe do telemovel.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}>
      <body>
        {children}
        <RegistoServiceWorker />
      </body>
    </html>
  );
}
