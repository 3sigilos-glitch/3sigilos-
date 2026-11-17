/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve o ficheiro de verificacao da app Android (TWA) a partir da rota
  // configuravel por variaveis de ambiente.
  async rewrites() {
    return [
      { source: '/.well-known/assetlinks.json', destination: '/api/assetlinks' },
      // URL limpo para a app estatica do Ponto Riscado servida a partir de public/.
      { source: '/assistente-ponto-riscado', destination: '/assistente-ponto-riscado/index.html' },
    ];
  },
  // Cabecalhos de seguranca e do service worker.
  async headers() {
    // TUDO aqui e texto fixo, de proposito: nenhum cabecalho usa variaveis de
    // ambiente. Um valor com um caracter invisivel (por exemplo uma quebra de
    // linha colada sem querer no Vercel) torna o cabecalho invalido e deita
    // abaixo todos os pedidos. Com texto fixo isso nao pode acontecer.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Fotos dos elementos e contactos sao enderecos externos colados a mao.
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // A app so fala com ela propria e com o Supabase (login, dados, storage).
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'", // ninguem embebe esta app dentro de outro site
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ');

    const seguranca = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    ]
      // Rede de seguranca: um cabecalho que nao seja texto simples nunca sai.
      .filter((c) => /^[\x20-\x7E]+$/.test(c.value));

    return [
      // Aplica-se a app dos N'ASA. Fica de fora a app do Ponto Riscado (pagina
      // e API proprias), que tem necessidades diferentes e nao e alterada.
      { source: '/((?!assistente-ponto-riscado|api/assistente).*)', headers: seguranca },
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
