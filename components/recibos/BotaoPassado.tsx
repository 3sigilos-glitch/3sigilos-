'use client';

import { useTransition } from 'react';
import { alternarPassado } from '@/app/(app)/recibos/acoes';
import { mostrarToast } from '@/lib/toast';

// Alterna o estado de um recibo entre "por passar" e "passado", no proprio sitio.
export default function BotaoPassado({ id, passado }: { id: string; passado: boolean }) {
  const [aProcessar, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={aProcessar}
      onClick={() =>
        iniciar(async () => {
          try {
            await alternarPassado(id, !passado);
            mostrarToast('ok', !passado ? 'Recibo marcado como passado' : 'Recibo por passar');
          } catch {
            mostrarToast('erro', 'Nao foi possivel atualizar o recibo');
          }
        })
      }
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
