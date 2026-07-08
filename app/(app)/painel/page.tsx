import Link from 'next/link';
import CartaoEvento from '@/components/eventos/CartaoEvento';
import { carregarPainel } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { euros, mesAno, dataExtenso, hora, textoDias } from '@/lib/formatar';
import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

// Painel: visao rapida do estado da banda. Tudo tocavel para abrir o detalhe.
export default async function PaginaPainel() {
  const [dados, sessao] = await Promise.all([carregarPainel(), obterSessao()]);
  const agora = new Date().toISOString();

  const estados = Object.keys(ESTADO_EVENTO) as EstadoEvento[];
  const totalPipeline = estados.reduce((soma, e) => soma + (dados.pipeline[e] ?? 0), 0);

  const proximo = dados.proximos[0];
  const restantes = dados.proximos.slice(1);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <p className="carimbo" style={{ fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {mesAno(agora)}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 8 }}>
          <h1 style={{ fontSize: 34 }}>Painel</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/setlists" className="botao botao-secundario" style={{ width: 'auto' }}>Setlists</Link>
            <Link href="/automacoes" className="botao botao-secundario" style={{ width: 'auto' }}>Automacoes</Link>
            {sessao.ehAdmin && (
              <Link href="/definicoes" className="botao botao-secundario" style={{ width: 'auto' }} aria-label="Definicoes">Definicoes</Link>
            )}
          </div>
        </div>
      </div>

      {/* Proximo concerto em destaque */}
      {proximo && (
        <Link href={`/eventos/${proximo.id}`} className="cartao-heroi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="carimbo" style={{ letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--texto-suave)' }}>
              Proximo concerto
            </span>
            {textoDias(proximo.data) && (
              <span
                className="titulo"
                style={{ fontSize: 13, letterSpacing: '0.04em', color: 'var(--acento-forte)', background: 'var(--acento-suave)', borderRadius: 999, padding: '4px 10px' }}
              >
                {textoDias(proximo.data)}
              </span>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: 25, lineHeight: 1.05 }}>{proximo.evento}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8, color: 'var(--texto-suave)', fontSize: 13 }}>
              <span>{dataExtenso(proximo.data)}{hora(proximo.data) ? `, ${hora(proximo.data)}` : ''}</span>
              {proximo.local && <span>{proximo.local}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--linha)', paddingTop: 12 }}>
            {proximo.referencia
              ? <span className="carimbo carimbo--caixa">{proximo.referencia}</span>
              : <span />}
            <strong className="titulo numero" style={{ fontSize: 24 }}>{euros(proximo.valor_total)}</strong>
          </div>
        </Link>
      )}

      {/* Indicadores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Indicador rotulo="Concertos do mes" valor={String(dados.indicadores.concertosDoMes)} href="/eventos" />
        <Indicador rotulo="Faturacao prevista" valor={euros(dados.indicadores.faturacaoPrevista)} href="/eventos?estado=confirmado" destaque />
        <Indicador rotulo="Propostas em aberto" valor={String(dados.indicadores.propostasEmAberto)} href="/eventos?estado=orcamentado" />
        <Indicador rotulo="Recibos por passar" valor={String(dados.recibosPorPassar)} href="/recibos" />
      </div>

      {/* Pipeline por estado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Pipeline</h2>
        {totalPipeline > 0 && (
          <div className="barra-pipeline">
            {estados.map((estado) => {
              const n = dados.pipeline[estado] ?? 0;
              if (n === 0) return null;
              return <span key={estado} style={{ flex: n, background: ESTADO_EVENTO[estado].corVar }} />;
            })}
          </div>
        )}
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 0, overflow: 'hidden' }}>
          {estados.map((estado) => (
            <Link
              key={estado}
              href={`/eventos?estado=${estado}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--linha)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: ESTADO_EVENTO[estado].corVar }} />
                <span style={{ fontSize: 15 }}>{ESTADO_EVENTO[estado].rotulo}</span>
              </span>
              <strong className="titulo numero" style={{ fontSize: 18 }}>{dados.pipeline[estado] ?? 0}</strong>
            </Link>
          ))}
        </div>
      </div>

      {/* Proximos concertos (a seguir ao destaque) */}
      {restantes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Proximos concertos</h2>
            <Link href="/eventos" style={{ fontSize: 13, color: 'var(--acento)' }}>Ver todos</Link>
          </div>
          {restantes.map((ev) => <CartaoEvento key={ev.id} evento={ev} />)}
        </div>
      )}

      {!proximo && (
        <div className="cartao" style={{ color: 'var(--texto-suave)', textAlign: 'center' }}>
          <p>Nada agendado para os proximos dias.</p>
        </div>
      )}

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
    <Link
      href={href}
      className="cartao"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 92,
        justifyContent: 'center',
        ...(destaque ? { background: 'linear-gradient(135deg, #1a1213, var(--superficie) 70%)', borderColor: '#3a2422' } : {}),
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>{rotulo}</span>
      <strong className="titulo numero" style={{ fontSize: 26, color: destaque ? 'var(--acento-forte)' : 'var(--texto)' }}>{valor}</strong>
    </Link>
  );
}
