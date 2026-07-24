import Link from 'next/link';
import CartaoEvento from '@/components/eventos/CartaoEvento';
import Dica from '@/components/Dica';
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
        <h1 className="t-titulo" style={{ fontSize: 34, marginTop: 4 }}>Painel</h1>
      </div>

      <Dica id="painel">
        Este e o ponto de partida: proximo concerto, agenda, propostas e contas num relance. Navega pela barra de
        baixo (Painel, Agenda, Setlists, Recibos). Cada cartao abre com um toque.
      </Dica>

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
        <h2 className="rotulo-seccao">Pipeline</h2>
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
            <h2 className="rotulo-seccao">Proximos concertos</h2>
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

      {/* Atalhos para o resto (fora da barra inferior) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="rotulo-seccao">Mais</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Atalho href="/repertorio" etiqueta="Repertorio" icone={<IconeNota />} />
          <Atalho href="/contactos" etiqueta="Contactos" icone={<IconePessoa />} />
          <Atalho href="/equipa" etiqueta="Equipa" icone={<IconePessoas />} />
          <Atalho href="/automacoes" etiqueta="Automacoes" icone={<IconeRaio />} />
          {sessao.ehAdmin && <Atalho href="/definicoes" etiqueta="Definicoes" icone={<IconeRoda />} />}
        </div>
      </div>

      {!sessao.ehAdmin && (
        <p style={{ fontSize: 12, color: 'var(--texto-fraco)', textAlign: 'center' }}>
          Sessao de membro: podes criar e editar, mas nao apagar nem alterar a configuracao.
        </p>
      )}
    </section>
  );
}

function Atalho({ href, etiqueta, icone }: { href: string; etiqueta: string; icone: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="cartao"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 84, color: 'var(--texto)', textAlign: 'center' }}
    >
      <span style={{ color: 'var(--texto-suave)' }}>{icone}</span>
      <span style={{ fontSize: 12, letterSpacing: '0.02em' }}>{etiqueta}</span>
    </Link>
  );
}

function IconeNota() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>;
}
function IconePessoa() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>;
}
function IconePessoas() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="8" r="3.5" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M17 5.5a3.5 3.5 0 0 1 0 6.5M22 21a7 7 0 0 0-5-6.7" /></svg>;
}
function IconeRaio() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>;
}
function IconeRoda() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L16.5 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L4.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z" /></svg>;
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
        ...(destaque ? { background: 'linear-gradient(135deg, var(--superficie-quente), var(--superficie) 70%)', borderColor: 'var(--linha-quente)' } : {}),
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>{rotulo}</span>
      <strong className="titulo numero" style={{ fontSize: 26, color: destaque ? 'var(--acento-forte)' : 'var(--texto)' }}>{valor}</strong>
    </Link>
  );
}
