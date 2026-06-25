'use client';

import { useState, useTransition } from 'react';
import { arquivarProposta, enviarPropostaEmail } from '@/app/(app)/eventos/[id]/proposta/acoes';

// Accoes sobre a proposta ja gerada: copiar o texto, ver o PDF, arquivar no
// Storage e enviar por email (ou abrir o rascunho de email).
export default function AccoesProposta({
  eventoId,
  texto,
  pdfUrl,
  mailtoHref,
  temEmailContratante,
}: {
  eventoId: string;
  texto: string;
  pdfUrl: string;
  mailtoHref: string;
  temEmailContratante: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [aProcessar, iniciar] = useTransition();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Nao foi possivel copiar automaticamente. Seleciona e copia a mao.' });
    }
  }

  function correr(accao: () => Promise<void>, sucesso: string) {
    setMensagem(null);
    iniciar(async () => {
      try {
        await accao();
        setMensagem({ tipo: 'ok', texto: sucesso });
      } catch (e: any) {
        setMensagem({ tipo: 'erro', texto: e?.message ?? 'Ocorreu um erro.' });
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={copiar} className="botao">{copiado ? 'Copiado' : 'Copiar texto da proposta'}</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="botao botao-secundario">Ver PDF</a>
        <button onClick={() => correr(() => arquivarProposta(eventoId), 'Proposta arquivada no Storage.')} className="botao botao-secundario" disabled={aProcessar}>
          Arquivar PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a href={mailtoHref} className="botao botao-secundario" style={{ opacity: temEmailContratante ? 1 : 0.6 }}>
          Rascunho de email
        </a>
        <button onClick={() => correr(() => enviarPropostaEmail(eventoId), 'Email enviado ao contratante.')} className="botao botao-secundario" disabled={aProcessar}>
          {aProcessar ? 'A enviar...' : 'Enviar por email'}
        </button>
      </div>

      {mensagem && (
        <p style={{ fontSize: 13, color: mensagem.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)', lineHeight: 1.5 }}>
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
