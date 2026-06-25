import { Suspense } from 'react';
import Link from 'next/link';
import FiltrosEventos from '@/components/eventos/FiltrosEventos';
import CartaoEvento from '@/components/eventos/CartaoEvento';
import { listarEventos } from '@/lib/consultas';
import { mesAno } from '@/lib/formatar';
import type { Evento } from '@/lib/tipos';

// Agrupa os eventos por mes, para uma vista de agenda legivel no telemovel.
function agruparPorMes(eventos: Evento[]) {
  const grupos = new Map<string, Evento[]>();
  for (const ev of eventos) {
    const chave = ev.data ? mesAno(ev.data) : 'Sem data';
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(ev);
  }
  return Array.from(grupos.entries());
}

export default async function PaginaEventos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; mes?: string }>;
}) {
  const filtros = await searchParams;
  const eventos = await listarEventos(filtros);
  const grupos = agruparPorMes(eventos);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Eventos</h1>
        <Link href="/eventos/novo" className="botao" style={{ width: 'auto' }}>
          Novo
        </Link>
      </div>

      <Suspense>
        <FiltrosEventos />
      </Suspense>

      {eventos.length === 0 ? (
        <div className="cartao" style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>
          <p style={{ lineHeight: 1.6 }}>Sem eventos para mostrar. Toca em <strong style={{ color: 'var(--texto)' }}>Novo</strong> para criar o primeiro.</p>
        </div>
      ) : (
        grupos.map(([mes, lista]) => (
          <div key={mes} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>{mes}</h2>
            {lista.map((ev) => (
              <CartaoEvento key={ev.id} evento={ev} />
            ))}
          </div>
        ))
      )}
    </section>
  );
}
