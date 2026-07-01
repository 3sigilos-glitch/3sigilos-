// Digital Asset Links da app Android (TWA).
//
// Serve o conteudo de /.well-known/assetlinks.json (via reescrita no next.config),
// que o Android usa para confirmar que esta app Android pertence a este site.
// So assim a app abre em ecra inteiro, sem a barra de endereco do browser.
//
// Configura no Vercel (Environment Variables), com os valores que o PWABuilder
// (ou o Bubblewrap) te da ao gerar o APK:
//  - ANDROID_PACKAGE_NAME: o nome do pacote, por exemplo pt.nasa.gestao
//  - ANDROID_CERT_SHA256: a impressao digital SHA256 do certificado de assinatura
//    (se houver mais do que uma, separa por virgulas)
export const runtime = 'nodejs';
// Le as variaveis de ambiente em cada pedido (nao fica em cache no build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const pacote = process.env.ANDROID_PACKAGE_NAME ?? '';
  const fingerprints = (process.env.ANDROID_CERT_SHA256 ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  // Sem configuracao ainda: devolve uma lista vazia (valido e inofensivo).
  const corpo =
    pacote && fingerprints.length > 0
      ? [
          {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'android_app',
              package_name: pacote,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return new Response(JSON.stringify(corpo, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
