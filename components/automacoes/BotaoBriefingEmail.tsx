'use client';

import { useState, useTransition } from 'react';
import { enviarBriefingEmail } from '@/app/(app)/automacoes/acoes';
import type { Periodo } from '@/lib/automacoes';

// Envia o briefing por email a toda a banda, com feedback no proprio botao.
export default function BotaoBriefingEmail({ periodo }: { periodo: Periodo }) {
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [aEnviar, iniciar] = useTransition();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={() => {
          setMensagem(null);
          iniciar(async () => {
            try {
              await enviarBriefingEmail(periodo);
              setMensagem({ tipo: 'ok', texto: 'Briefing enviado a banda.' });
            } catch (e: any) {
              setMensagem({ tipo: 'erro', texto: e?.message ?? 'Erro ao enviar.' });
            }
          });
        }}
        disabled={aEnviar}
        className="botao botao-secundario"
        style={{ width: 'auto', alignSelf: 'flex-start', minHeight: 40, fontSize: 13 }}
      >
        {aEnviar ? 'A enviar...' : 'Enviar por email a banda'}
      </button>
      {mensagem && (
        <span style={{ fontSize: 12, color: mensagem.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)' }}>
          {mensagem.texto}
        </span>
      )}
    </div>
  );
}
