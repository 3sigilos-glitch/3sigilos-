import Link from 'next/link';
import BotaoPassado from '@/components/recibos/BotaoPassado';
import { listarRecibos, resumirPorMembro } from '@/lib/consultas';
import { euros, dataExtenso } from '@/lib/formatar';

export default async function PaginaRecibos({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>;
}) {
  const { ano: anoParam } = await searchParams;
  const ano = Number(anoParam) || new Date().getFullYear();
  const recibos = await listarRecibos(ano);
  const resumo = resumirPorMembro(recibos);
  const porEmitir = recibos.filter((r) => !r.passado);
  const totalAno = recibos.reduce((s, r) => s + Number(r.valor ?? 0), 0);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Recibos</h1>
        <Link href="/recibos/novo" className="botao" style={{ width: 'auto' }}>Novo</Link>
      </div>

      {/* Navegacao de ano */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/recibos?ano=${ano - 1}`} className="botao botao-secundario" style={{ width: 'auto' }}>{ano - 1}</Link>
        <span className="titulo" style={{ fontSize: 22 }}>{ano}</span>
        <Link href={`/recibos?ano=${ano + 1}`} className="botao botao-secundario" style={{ width: 'auto' }}>{ano + 1}</Link>
      </div>

      <div className="cartao" style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'linear-gradient(135deg, #1a1213, var(--superficie) 70%)', borderColor: '#3a2422' }}>
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--acento)', boxShadow: '0 0 18px rgba(226, 59, 46, 0.6)' }} />
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total do ano</span>
        <strong className="titulo numero" style={{ fontSize: 28, color: 'var(--acento-forte)' }}>{euros(totalAno)}</strong>
      </div>

      {/* Recibos por emitir */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Por emitir ({porEmitir.length})</h2>
        {porEmitir.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Tudo em dia, sem recibos por emitir neste ano.</p>
        ) : (
          porEmitir.map((r) => (
            <div key={r.id} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Link href={`/recibos/${r.id}/editar`} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <strong style={{ fontSize: 15 }}>{r.membro?.nome ?? 'Sem membro'}</strong>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {r.evento?.evento ?? 'Sem evento'}{r.data ? `, ${dataExtenso(r.data)}` : ''}
                </span>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <strong className="titulo numero" style={{ fontSize: 16 }}>{euros(r.valor)}</strong>
                <BotaoPassado id={r.id} passado={r.passado} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumo por membro */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Resumo por membro</h2>
        {resumo.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Sem recibos registados em {ano}.</p>
        ) : (
          resumo.map((m) => (
            <div key={m.membroId ?? 'sem'} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 16 }}>{m.nome}</strong>
                <strong className="titulo numero" style={{ fontSize: 18 }}>{euros(m.total)}</strong>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--texto-suave)' }}>
                <span><span style={{ color: 'var(--estado-confirmado)' }}>Passados:</span> {euros(m.passado)}</span>
                <span><span style={{ color: 'var(--estado-orcamentado)' }}>Por passar:</span> {euros(m.porPassar)} ({m.numeroPorPassar})</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
