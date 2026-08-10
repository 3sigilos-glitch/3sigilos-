/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve o ficheiro de verificacao da app Android (TWA) a partir da rota
  // configuravel por variaveis de ambiente.
  async rewrites() {
    return [
      { source: '/.well-known/assetlinks.json', destination: '/api/assetlinks' },
    ];
  },
  // Cabecalhos para o service worker e o manifesto da PWA serem servidos corretamente
  async headers() {
    // A app so fala com ela propria e com o Supabase (base de dados, sessao e
    // storage). Tudo o resto e bloqueado pelo browser.
    //
    // IMPORTANTE: aqui vai sempre o dominio generico do Supabase, alem do
    // endereco do projeto. Se a variavel de ambiente nao estiver disponivel na
    // altura da compilacao, o browser continua a deixar a app falar com o
    // Supabase, em vez de bloquear tudo (login incluido).
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseWs = supabase.replace(/^https:/, 'wss:');
    const ligacoes = ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', supabase, supabaseWs]
      .filter(Boolean)
      .join(' ');

    const csp = [
      "default-src 'self'",
      // O Next precisa de scripts em linha para arrancar a pagina.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src ${ligacoes}`,
      // Ninguem pode embeber esta app dentro de outro site (anti-clickjacking).
      "frame-ancestors 'none'",
      "base-uri 'self'",
      // Os formularios so podem ser enviados para a propria app.
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ');

    const seguranca = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Impede que o endereco (que no login leva o codigo do link magico) va
      // parar a sites de terceiros pelo cabecalho de origem.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];

    return [
      { source: '/:caminho*', headers: seguranca },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      // No ecra de confirmacao do link magico, nao deixa sair referencia nenhuma.
      { source: '/auth/:caminho*', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
    ];
  },
};

export default nextConfig;
