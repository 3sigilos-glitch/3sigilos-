'use client';

import { useState, useTransition } from 'react';

// Botao que importa um concerto do calendario Google para a agenda. A accao
// volta a verificar no servidor se o concerto ja existe antes de criar.
export default function BotaoImportarCalendario({
  acao,
  etiqueta = 'Importar',
  secundario = false,
  confirmacao,
}: {
  acao: () => Promise<{ erro: string } | void>;
  etiqueta?: string;
  secundario?: boolean;
  confirmacao?: string;
}) {
  const [aProcessar, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
      <button
        type="button"
        disabled={aProcessar}
        onClick={() => {
          if (confirmacao && !confirm(confirmacao)) return;
          setErro(null);
          iniciar(async () => {
            const resultado = await acao();
            if (resultado && 'erro' in resultado) setErro(resultado.erro);
          });
        }}
        className={secundario ? 'botao botao-secundario' : 'botao'}
        style={{ width: 'auto', minHeight: 40, fontSize: 13, whiteSpace: 'nowrap' }}
      >
        {aProcessar ? 'A importar...' : etiqueta}
      </button>
      {erro && <span style={{ fontSize: 12, color: 'var(--estado-recusado)', textAlign: 'right' }}>{erro}</span>}
    </span>
  );
}
