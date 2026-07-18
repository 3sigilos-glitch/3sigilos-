/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve o ficheiro de verificacao da app Android (TWA) a partir da rota
  // configuravel por variaveis de ambiente.
  async rewrites() {
    return [
      { source: '/.well-known/assetlinks.json', destination: '/api/assetlinks' },
      // URL limpo para a app estatica do Ponto Riscado servida a partir de public/.
      { source: '/pontoriscado', destination: '/pontoriscado/index.html' },
    ];
  },
  // Cabecalhos para o service worker e o manifesto da PWA serem servidos corretamente
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
