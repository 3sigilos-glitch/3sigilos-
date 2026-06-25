import type { MetadataRoute } from 'next';

// Manifesto da PWA. Gera /manifest.webmanifest.
// Define a app como instalavel, em ecra inteiro e com o tema escuro.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "N'ASA Gestao",
    short_name: "N'ASA",
    description: 'Gestao interna dos N\'ASA: concertos, propostas, equipa e repertorio.',
    start_url: '/painel',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    lang: 'pt-PT',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
