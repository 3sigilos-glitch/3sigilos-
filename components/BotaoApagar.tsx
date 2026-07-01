'use client';

import { useTransition } from 'react';

// Botao de apagar com confirmacao. A accao corre no servidor (server action).
export default function BotaoApagar({
  acao,
  confirmacao = 'Tens a certeza? Esta acção não se pode desfazer.',
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
      className="botao-secundario border-estado-repor text-estado-repor hover:border-estado-repor"
    >
      {aProcessar ? 'A apagar...' : etiqueta}
    </button>
  );
}
