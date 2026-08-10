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
  );
}
