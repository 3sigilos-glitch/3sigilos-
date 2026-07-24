'use client';

import { useEffect, useState } from 'react';

// Dica de utilizacao: uma nota curta e discreta no topo de uma seccao. Pode ser
// fechada e fica escondida a partir dai (guardado no proprio dispositivo, por
// id). Comeca escondida ate confirmar no cliente que nao foi dispensada, para
// nao piscar uma dica que a pessoa ja fechou.
export default function Dica({ id, children }: { id: string; children: React.ReactNode }) {
  const chave = `nasa-dica-${id}`;
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    try {
      setVisivel(localStorage.getItem(chave) !== 'oculta');
    } catch {
      setVisivel(true);
    }
  }, [chave]);

  if (!visivel) return null;

  function fechar() {
    try {
      localStorage.setItem(chave, 'oculta');
    } catch {
      // Sem armazenamento: a dica volta na proxima visita, sem problema.
    }
    setVisivel(false);
  }

  return (
    <div
      className="entra"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 12px 12px 14px',
        borderRadius: 'var(--raio-pequeno)',
        background: 'var(--acento-suave)',
        border: '1px solid var(--linha-quente)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--acento-forte)" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2.5h6c0-1.3.5-2 1-2.5A6 6 0 0 0 12 3z" />
      </svg>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: 'var(--texto-suave)' }}>{children}</div>
      <button
        type="button"
        onClick={fechar}
        aria-label="Esconder dica"
        style={{ flexShrink: 0, background: 'transparent', border: 'none', color: 'var(--texto-fraco)', padding: 2, lineHeight: 1, cursor: 'pointer' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}
