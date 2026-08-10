'use client';

// Ultima rede de seguranca: apanha erros que aconteçam no layout de raiz, onde
// nenhum outro ecra de erro chega. Sem isto, o utilizador via a pagina branca
// "500 Internal Server Error" do servidor, sem saber o que fazer.
export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-PT">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#0a0a0b',
          color: '#f2f0ea',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Alguma coisa falhou</h1>
          <p style={{ color: '#b3b1aa', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Nao foi possivel carregar a app. Tenta outra vez. Se continuar, sai da sessao e volta a entrar.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: 48,
                padding: '0 20px',
                borderRadius: 10,
                border: 'none',
                background: '#f5811e',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Tentar de novo
            </button>
            <a
              href="/auth/sair"
              style={{
                minHeight: 48,
                padding: '0 20px',
                borderRadius: 10,
                border: '1px solid #3a2e1c',
                color: '#b3b1aa',
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              Sair da sessao
            </a>
          </div>

          {error?.digest && (
            <p style={{ color: '#8a887f', fontSize: 12, marginTop: 8, fontFamily: 'ui-monospace, monospace' }}>
              Codigo do erro: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
