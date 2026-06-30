import { Suspense } from 'react';
import Link from 'next/link';
import FiltrosRepertorio from '@/components/repertorio/FiltrosRepertorio';
import { listarRepertorio } from '@/lib/consultas';

export default async function PaginaRepertorio({
  searchParams,
}: {
  searchParams: Promise<{ decada?: string; ativo?: string }>;
}) {
  const filtros = await searchParams;
  const musicas = await listarRepertorio(filtros);
  const ativas = musicas.filter((m) => m.ativo).length;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Repertorio</h1>
        <Link href="/repertorio/novo" className="botao" style={{ width: 'auto' }}>Nova</Link>
      </div>

      <Suspense>
        <FiltrosRepertorio />
      </Suspense>

      <p style={{ fontSize: 13, color: 'var(--texto-fraco)' }}>{musicas.length} musicas, {ativas} ativas</p>

      {musicas.length === 0 ? (
        <div className="cartao" style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>
          <p>Sem musicas para mostrar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {musicas.map((m) => (
            <Link key={m.id} href={`/repertorio/${m.id}/editar`} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, opacity: m.ativo ? 1 : 0.55 }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <strong style={{ fontSize: 16 }}>{m.musica}</strong>
                <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{m.artista_original ?? 'Sem artista'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--texto-fraco)', fontSize: 12 }}>
                {m.decada && <span>anos {m.decada}</span>}
                {m.duracao && <span className="carimbo">{m.duracao}</span>}
                {!m.ativo && <span style={{ color: 'var(--estado-recusado)' }}>inativa</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
