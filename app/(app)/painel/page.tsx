import Link from 'next/link';
import CartaoEvento from '@/components/eventos/CartaoEvento';
import { carregarPainel } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { euros, mesAno } from '@/lib/formatar';
import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

// Painel: visao rapida do estado da banda. Tudo tocavel para abrir o detalhe.
export default async function PaginaPainel() {
  const [dados, sessao] = await Promise.all([carregarPainel(), obterSessao()]);
  const agora = new Date().toISOString();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <p style={{ color: 'var(--texto-suave)', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {mesAno(agora)}
        </p>
        <h1 style={{ fontSize: 34, marginTop: 4 }}>Painel</h1>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Indicador rotulo="Concertos do mes" valor={String(dados.indicadores.concertosDoMes)} href="/eventos" />
        <Indicador rotulo="Faturacao prevista" valor={euros(dados.indicadores.faturacaoPrevista)} href="/eventos?estado=confirmado" destaque />
        <Indicador rotulo="Propostas em aberto" valor={String(dados.indicadores.propostasEmAberto)} href="/eventos?estado=orcamentado" />
        <Indicador rotulo="Recibos por passar" valor={String(dados.recibosPorPassar)} href="/recibos" />
      </div>

      {/* Pipeline por estado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Pipeline</h2>
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 0, overflow: 'hidden' }}>
          {(Object.keys(ESTADO_EVENTO) as EstadoEvento[]).map((estado) => (
            <Link
              key={estado}
              href={`/eventos?estado=${estado}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--linha)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: ESTADO_EVENTO[estado].corVar }} />
                <span style={{ fontSize: 15 }}>{ESTADO_EVENTO[estado].rotulo}</span>
              </span>
              <strong className="titulo" style={{ fontSize: 18 }}>{dados.pipeline[estado] ?? 0}</strong>
            </Link>
          ))}
        </div>
      </div>

      {/* Proximos concertos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Proximos concertos</h2>
          <Link href="/eventos" style={{ fontSize: 13, color: 'var(--acento)' }}>Ver todos</Link>
        </div>
        {dados.proximos.length === 0 ? (
          <div className="cartao" style={{ color: 'var(--texto-suave)', textAlign: 'center' }}>
            <p>Nada agendado para os proximos dias.</p>
          </div>
        ) : (
          dados.proximos.map((ev) => <CartaoEvento key={ev.id} evento={ev} />)
        )}
      </div>

      {!sessao.ehAdmin && (
        <p style={{ fontSize: 12, color: 'var(--texto-fraco)', textAlign: 'center' }}>
          Sessao de membro: podes criar e editar, mas nao apagar nem alterar a configuracao.
        </p>
      )}
    </section>
  );
}

function Indicador({ rotulo, valor, href, destaque }: { rotulo: string; valor: string; href: string; destaque?: boolean }) {
  return (
    <Link href={href} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 92, justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>{rotulo}</span>
      <strong className="titulo" style={{ fontSize: 26, color: destaque ? 'var(--acento)' : 'var(--texto)' }}>{valor}</strong>
    </Link>
  );
}
