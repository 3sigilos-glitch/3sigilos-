'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ESTADO_EVENTO } from '@/lib/tipos';

// Filtros rapidos da lista de eventos: por estado (chips) e por mes.
// Mantem o resto do filtro ao mudar um deles.
export default function FiltrosEventos() {
  const router = useRouter();
  const params = useSearchParams();
  const estadoAtual = params.get('estado') ?? 'todos';
  const mesAtual = params.get('mes') ?? '';

  function navegar(novos: Record<string, string>) {
    const p = new URLSearchParams(params.toString());
    for (const [chave, valor] of Object.entries(novos)) {
      if (valor) p.set(chave, valor);
      else p.delete(chave);
    }
    router.push(`/eventos?${p.toString()}`);
  }

  const chips: { valor: string; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    ...Object.entries(ESTADO_EVENTO).map(([valor, { rotulo }]) => ({ valor, rotulo })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, margin: '0 -16px', padding: '0 16px 4px' }}>
        {chips.map(({ valor, rotulo }) => {
          const ativo = estadoAtual === valor;
          return (
            <button
              key={valor}
              onClick={() => navegar({ estado: valor === 'todos' ? '' : valor })}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: ativo ? 'var(--acento)' : 'var(--linha)',
                background: ativo ? 'var(--acento-suave)' : 'transparent',
                color: ativo ? 'var(--texto)' : 'var(--texto-suave)',
                fontSize: 13,
                fontWeight: ativo ? 700 : 500,
                minHeight: 38,
              }}
            >
              {rotulo}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="month"
          className="campo"
          value={mesAtual}
          onChange={(e) => navegar({ mes: e.target.value })}
          style={{ flex: 1 }}
          aria-label="Filtrar por mes"
        />
        {mesAtual && (
          <button className="botao botao-secundario" style={{ width: 'auto' }} onClick={() => navegar({ mes: '' })}>
            Limpar mes
          </button>
        )}
      </div>
    </div>
  );
}
