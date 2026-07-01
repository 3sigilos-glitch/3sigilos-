import type { MetadataRoute } from 'next';

// Manifesto da PWA. Gera /manifest.webmanifest.
// Define a app como instalavel, em ecra inteiro e com o tema escuro da marca.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '3 Sigilos | Organização',
    short_name: '3 Sigilos',
    description: 'Organização da 3 Sigilos: stock, desenhos, clientes, encomendas e faturação.',
    start_url: '/painel',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a090d',
    theme_color: '#0a090d',
    lang: 'pt-PT',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
