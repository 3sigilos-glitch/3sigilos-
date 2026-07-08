'use client';

import { useTransition } from 'react';
import { definirCifraPorDefeito } from '@/app/(app)/repertorio/[id]/cifras/acoes';

// Marca uma cifra como versao por defeito da musica.
export default function BotaoPorDefeito({ musicaId, cifraId }: { musicaId: string; cifraId: string }) {
  const [aProcessar, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={aProcessar}
      onClick={() => iniciar(() => definirCifraPorDefeito(musicaId, cifraId))}
      className="botao botao-secundario"
      style={{ width: 'auto', minHeight: 36, fontSize: 12 }}
    >
      {aProcessar ? '...' : 'Tornar por defeito'}
    </button>
  );
}
