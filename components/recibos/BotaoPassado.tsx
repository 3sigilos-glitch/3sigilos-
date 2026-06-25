'use client';

import { useTransition } from 'react';
import { alternarPassado } from '@/app/(app)/recibos/acoes';

// Alterna o estado de um recibo entre "por passar" e "passado", no proprio sitio.
export default function BotaoPassado({ id, passado }: { id: string; passado: boolean }) {
  const [aProcessar, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={aProcessar}
      onClick={() => iniciar(() => alternarPassado(id, !passado))}
      className="botao botao-secundario"
      style={{
        width: 'auto',
        minHeight: 40,
        fontSize: 13,
        color: passado ? 'var(--estado-confirmado)' : 'var(--texto)',
        borderColor: passado ? 'var(--estado-confirmado)' : 'var(--linha)',
      }}
    >
      {aProcessar ? '...' : passado ? 'Passado' : 'Marcar passado'}
    </button>
  );
}
