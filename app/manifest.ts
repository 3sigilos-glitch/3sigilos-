import type { MetadataRoute } from 'next';

// Manifesto da PWA. Gera /manifest.webmanifest.
// Define a app como instalavel, em ecra inteiro e com o tema escuro.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "N'ASA Backoffice",
    short_name: "N'ASA",
    description: 'Backoffice dos N\'ASA: concertos, propostas, equipa, repertorio e setlists.',
    start_url: '/painel',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    lang: 'pt-PT',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
