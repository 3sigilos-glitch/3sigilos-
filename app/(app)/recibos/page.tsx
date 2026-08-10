import Link from 'next/link';
import Dica from '@/components/Dica';
import { listarRecibos, resumirPorMembro, listarConcertosPorPassar } from '@/lib/consultas';
import { euros, dataExtenso } from '@/lib/formatar';

export default async function PaginaRecibos({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>;
}) {
  const { ano: anoParam } = await searchParams;
  const ano = Number(anoParam) || new Date().getFullYear();
  const [recibos, porPassar] = await Promise.all([listarRecibos(ano), listarConcertosPorPassar(ano)]);
  const passados = recibos.filter((r) => r.passado);
  const resumo = resumirPorMembro(passados);
  const totalAno = passados.reduce((s, r) => s + Number(r.valor ?? 0), 0);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Recibos</h1>
        <Link href="/recibos/novo" className="botao" style={{ width: 'auto' }}>Novo</Link>
      </div>

      <Dica id="recibos">
        Cada concerto <strong>realizado</strong> sem recibo aparece em <strong>Por passar</strong>. Quem for passar o
        recibo toca em <strong>Passar</strong>, escolhe o seu nome, o valor e a data. O concerto sai de Por passar e o
        recibo aparece em <strong>Passados</strong>, com o nome de quem o passou.
      </Dica>

      {/* Navegacao de ano */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/recibos?ano=${ano - 1}`} className="botao botao-secundario" style={{ width: 'auto' }}>{ano - 1}</Link>
        <span className="titulo" style={{ fontSize: 22 }}>{ano}</span>
        <Link href={`/recibos?ano=${ano + 1}`} className="botao botao-secundario" style={{ width: 'auto' }}>{ano + 1}</Link>
      </div>

      <div className="cartao" style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'linear-gradient(135deg, var(--superficie-quente), var(--superficie) 70%)', borderColor: 'var(--linha-quente)' }}>
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--acento)', boxShadow: '0 0 18px rgba(var(--acento-rgb), 0.6)' }} />
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total do ano</span>
        <strong className="titulo numero" style={{ fontSize: 28, color: 'var(--acento-forte)' }}>{euros(totalAno)}</strong>
      </div>

      {/* Recibos por passar: concertos realizados sem recibo passado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="rotulo-seccao">Por passar ({porPassar.length})</h2>
        {porPassar.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Tudo em dia, sem recibos por passar neste ano.</p>
        ) : (
          porPassar.map((c) => (
            <div key={c.id} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderColor: 'var(--linha-quente)' }}>
              <Link href={`/eventos/${c.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 15 }}>{c.evento}</strong>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {c.data ? dataExtenso(c.data) : 'sem data'}{Number(c.valor_total ?? 0) > 0 ? `  |  ${euros(c.valor_total)}` : ''}
                </span>
              </Link>
              <Link href={`/recibos/novo?evento=${c.id}`} className="botao" style={{ width: 'auto', minHeight: 40, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>Passar</Link>
            </div>
          ))
        )}
      </div>

      {/* Recibos passados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="rotulo-seccao">Passados ({passados.length})</h2>
        {passados.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Ainda sem recibos passados em {ano}.</p>
        ) : (
          passados.map((r) => (
            <div key={r.id} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Link href={`/recibos/${r.id}/editar`} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 15 }}>{r.membro?.nome ?? 'Sem musico'}</strong>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--estado-confirmado)" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {r.evento?.evento ?? 'Sem evento'}{r.data ? `, ${dataExtenso(r.data)}` : ''}
                </span>
              </Link>
              <strong className="titulo numero" style={{ fontSize: 16 }}>{euros(r.valor)}</strong>
            </div>
          ))
        )}
      </div>

      {/* Resumo por membro (recibos passados) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="rotulo-seccao">Passados por membro</h2>
        {resumo.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Sem recibos passados em {ano}.</p>
        ) : (
          resumo.map((m) => (
            <div key={m.membroId ?? 'sem'} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <strong style={{ fontSize: 16 }}>{m.nome}</strong>
              <strong className="titulo numero" style={{ fontSize: 18 }}>{euros(m.passado)}</strong>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
