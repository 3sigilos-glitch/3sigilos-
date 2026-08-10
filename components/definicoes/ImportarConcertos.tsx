'use client';

import { useState, useTransition } from 'react';
import { importarConcertos } from '@/app/(app)/definicoes/acoes';

// Importador da folha do Drive: cola as colunas (Data, Local, Recibo passado,
// Valor) e cria os concertos e os recibos passados de uma vez. So admin.
export default function ImportarConcertos() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);
  const [aProcessar, iniciar] = useTransition();

  function importar() {
    if (!texto.trim()) return;
    setResultado(null);
    iniciar(async () => {
      try {
        const msg = await importarConcertos(texto);
        setResultado({ tipo: 'ok', msg });
        setTexto('');
      } catch (e: any) {
        setResultado({ tipo: 'erro', msg: e?.message ?? 'Nao foi possivel importar.' });
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--texto-suave)', lineHeight: 1.6 }}>
        Na folha do Drive, seleciona e copia as colunas <strong style={{ color: 'var(--texto)' }}>Data, Local, Recibo passado e Valor</strong> (com ou sem
        cabecalho) e cola aqui. A app cria os concertos em falta e, para as linhas com nome, marca o recibo como passado
        com esse musico. Nao duplica o que ja existe, e podes voltar a colar sem medo.
      </p>

      <textarea
        className="campo"
        rows={8}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={'2026-05-10\tFesta da Barreira\tKevin\t250\n2026-06-14\tLerias Bar\t\t'}
        style={{ paddingTop: 12, height: 'auto', resize: 'vertical', minHeight: 140, fontFamily: 'var(--fonte-mono), monospace', fontSize: 13 }}
      />

      <button type="button" className="botao" onClick={importar} disabled={aProcessar || !texto.trim()}>
        {aProcessar ? 'A importar...' : 'Importar'}
      </button>

      {resultado && (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: resultado.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)' }}>
          {resultado.msg}
        </p>
      )}
    </div>
  );
}
