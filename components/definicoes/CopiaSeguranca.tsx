'use client';

import { useRef, useState, useTransition } from 'react';
import { restaurarBackup } from '@/app/(app)/definicoes/acoes';

// Copias de seguranca: descarregar toda a informacao num ficheiro JSON e
// restaurar a partir de um ficheiro. Reservado ao admin.
export default function CopiaSeguranca() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nomeFicheiro, setNomeFicheiro] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [aRestaurar, iniciar] = useTransition();

  function submeter() {
    const ficheiro = inputRef.current?.files?.[0];
    if (!ficheiro) {
      setMensagem({ tipo: 'erro', texto: 'Escolhe primeiro um ficheiro de copia de seguranca.' });
      return;
    }
    if (!confirm('Restaurar a partir deste ficheiro? Os registos com o mesmo identificador vao ser atualizados.')) {
      return;
    }
    setMensagem(null);
    const formData = new FormData();
    formData.append('ficheiro', ficheiro);
    iniciar(async () => {
      try {
        const resumo = await restaurarBackup(formData);
        setMensagem({ tipo: 'ok', texto: resumo });
      } catch (e: any) {
        setMensagem({ tipo: 'erro', texto: e?.message ?? 'Nao foi possivel restaurar.' });
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <a href="/api/backup" className="botao">Descarregar copia de seguranca</a>
      <p style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.5, marginTop: -4 }}>
        Guarda num ficheiro JSON toda a informacao: eventos, contactos, equipa, escaloes, repertorio,
        recibos e definicoes. Guarda esse ficheiro num sitio seguro.
      </p>

      <div style={{ borderTop: '1px solid var(--linha)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Restaurar a partir de um ficheiro</span>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => setNomeFicheiro(e.target.files?.[0]?.name ?? '')}
          style={{ fontSize: 13, color: 'var(--texto-suave)' }}
        />
        {nomeFicheiro && <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>{nomeFicheiro}</span>}
        <button onClick={submeter} disabled={aRestaurar} className="botao botao-secundario" style={{ width: 'auto', alignSelf: 'flex-start' }}>
          {aRestaurar ? 'A restaurar...' : 'Restaurar'}
        </button>
        {mensagem && (
          <p style={{ fontSize: 13, color: mensagem.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)', lineHeight: 1.5 }}>
            {mensagem.texto}
          </p>
        )}
      </div>
    </div>
  );
}
