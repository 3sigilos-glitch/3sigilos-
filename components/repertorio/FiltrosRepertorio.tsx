'use client';

import { useRouter, useSearchParams } from 'next/navigation';

// Filtros do repertorio: por decada e por estado (ativa ou nao).
const DECADAS = ['60', '70', '80', '90', '2000'];

export default function FiltrosRepertorio() {
  const router = useRouter();
  const params = useSearchParams();
  const decada = params.get('decada') ?? '';
  const ativo = params.get('ativo') ?? '';

  function navegar(novos: Record<string, string>) {
    const p = new URLSearchParams(params.toString());
    for (const [chave, valor] of Object.entries(novos)) {
      if (valor) p.set(chave, valor);
      else p.delete(chave);
    }
    router.push(`/repertorio?${p.toString()}`);
  }

  const chip = (ativoChip: boolean) => ({
    whiteSpace: 'nowrap' as const,
    padding: '8px 14px',
    borderRadius: 999,
    border: '1px solid',
    borderColor: ativoChip ? 'var(--acento)' : 'var(--linha)',
    background: ativoChip ? 'var(--acento-suave)' : 'transparent',
    color: ativoChip ? 'var(--texto)' : 'var(--texto-suave)',
    fontSize: 13,
    fontWeight: ativoChip ? 700 : 500,
    minHeight: 38,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }}>
        <button onClick={() => navegar({ decada: '' })} style={chip(decada === '')}>Todas</button>
        {DECADAS.map((d) => (
          <button key={d} onClick={() => navegar({ decada: d })} style={chip(decada === d)}>Anos {d}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navegar({ ativo: '' })} style={chip(ativo === '')}>Todas</button>
        <button onClick={() => navegar({ ativo: 'sim' })} style={chip(ativo === 'sim')}>So ativas</button>
        <button onClick={() => navegar({ ativo: 'nao' })} style={chip(ativo === 'nao')}>So inativas</button>
      </div>
    </div>
  );
}
