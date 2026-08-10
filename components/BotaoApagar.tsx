'use client';

import { useTransition } from 'react';

// Botao de apagar com confirmacao. So aparece para o admin (decidido por quem
// o renderiza). A accao em si esta protegida pelo RLS no servidor.
export default function BotaoApagar({
  acao,
  confirmacao = 'Tens a certeza? Esta accao nao se pode desfazer.',
  etiqueta = 'Apagar',
}: {
  acao: () => Promise<void>;
  confirmacao?: string;
  etiqueta?: string;
}) {
  const [aProcessar, iniciar] = useTransition();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <button
        type="button"
        disabled={aProcessar}
        onClick={() => {
          if (confirm(confirmacao)) {
            iniciar(() => acao());
          }
        }}
        className="botao botao-secundario"
        style={{ color: 'var(--estado-recusado)', borderColor: 'var(--estado-recusado)' }}
      >
        {aProcessar ? 'A apagar...' : etiqueta}
      </button>
      <span style={{ fontSize: 11, color: 'var(--admin-forte)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        So tu ves este botao (admin)
      </span>
    </div>
  );
}
