'use client';

import { useState } from 'react';

// Bloco de texto pronto a copiar, com botao de copiar. Reutilizavel nas
// automacoes (follow-up, lembretes e briefings).
export default function CopiarBloco({ texto, etiqueta = 'Copiar' }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Em caso de falha, o utilizador pode selecionar o texto manualmente.
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <pre
        style={{
          background: 'var(--superficie-2)',
          border: '1px solid var(--linha)',
          borderRadius: 'var(--raio-pequeno)',
          padding: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--fonte-corpo)',
          fontSize: 13,
          lineHeight: 1.55,
          color: 'var(--texto)',
          margin: 0,
        }}
      >
        {texto}
      </pre>
      <button onClick={copiar} className="botao botao-secundario" style={{ width: 'auto', alignSelf: 'flex-start', minHeight: 40, fontSize: 13 }}>
        {copiado ? 'Copiado' : etiqueta}
      </button>
    </div>
  );
}
