/** @type {import('next').NextConfig} */
const nextConfig = {
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
