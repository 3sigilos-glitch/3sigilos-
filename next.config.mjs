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
  // Cabecalhos para o service worker e o manifesto da PWA serem servidos corretamente
  async headers() {
    // A app so precisa de falar com ela propria e com o Supabase (base de dados,
    // sessao e storage). O resto e bloqueado pelo browser.
    //
    // IMPORTANTE: aqui vai SEMPRE o dominio generico do Supabase (*.supabase.co),
    // alem do endereco do projeto. Assim, mesmo que a variavel de ambiente nao
    // esteja disponivel na compilacao, o browser continua a deixar a app falar
    // com o Supabase (login incluido), em vez de bloquear tudo.
    const projeto = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const ligacoes = ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', projeto, projeto.replace(/^https:/, 'wss:')]
      .filter(Boolean)
      .join(' ');

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // As fotos dos elementos e dos contactos sao enderecos externos que cada
      // um cola (por exemplo do Google). Por isso, permite imagens de qualquer
      // origem segura (https), alem das locais e embutidas.
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src ${ligacoes}`,
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
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];

    return [
      { source: '/:caminho*', headers: seguranca },
      // No ecra do link magico, nao deixa sair referencia nenhuma.
      { source: '/auth/:caminho*', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
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
