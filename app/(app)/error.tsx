'use client';

import { useEffect } from 'react';

// Ecra de erro amigavel para toda a zona autenticada, em vez do ecra preto
// generico. Da para tentar de novo sem perder a sessao.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e4)', alignItems: 'center', textAlign: 'center', paddingTop: 'var(--e12)' }}>
      <div style={{ fontSize: 44 }} aria-hidden>⚠</div>
      <h1 className="t-subtitulo">Algo correu mal</h1>
      <p className="t-corpo" style={{ color: 'var(--texto-suave)', maxWidth: 340 }}>
        Nao foi possivel carregar este ecra. Tenta de novo. Se continuar, avisa o Kevin.
      </p>
      <button onClick={reset} className="botao" style={{ width: 'auto', minWidth: 160 }}>Tentar de novo</button>
    </section>
  );
}
