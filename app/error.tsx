'use client';

// Ecra de erro ao nivel da raiz. Apanha as falhas que acontecem nos esqueletos
// (layouts) das zonas da app, que o ecra de erro de cada zona nao alcanca.
// Sem isto, essas falhas apareciam como a pagina nua "500 Internal Server Error".
export default function ErroRaiz({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 44 }} aria-hidden>⚠</div>
        <h1 style={{ fontSize: 24 }}>Alguma coisa falhou</h1>
        <p style={{ color: 'var(--texto-suave)', fontSize: 15, lineHeight: 1.6 }}>
          Nao foi possivel carregar a app. Tenta outra vez. Se continuar, sai da sessao e volta a entrar.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
          <button type="button" onClick={() => reset()} className="botao" style={{ width: 'auto', minWidth: 150 }}>
            Tentar de novo
          </button>
          <a href="/auth/sair" className="botao botao-secundario" style={{ width: 'auto', minWidth: 150, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            Sair da sessao
          </a>
        </div>

        {error?.digest && (
          <p style={{ color: 'var(--texto-fraco)', fontSize: 12, marginTop: 6, fontFamily: 'var(--fonte-mono), monospace' }}>
            Codigo do erro: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
