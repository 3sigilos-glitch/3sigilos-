// Ilustracoes do guia: miniaturas dos ecras reais da app, desenhadas com os
// mesmos tokens de cor e tipo. Usam dados de exemplo (nunca dados da banda) e
// marcam com um anel a pulsar o sitio onde se toca.

import type { CSSProperties, ReactNode } from 'react';

const ESTADOS = {
  confirmado: { rotulo: 'Confirmado', cor: 'var(--estado-confirmado)' },
  realizado: { rotulo: 'Realizado', cor: 'var(--estado-realizado)' },
  pre_reserva: { rotulo: 'Pre-reserva', cor: 'var(--estado-pre-reserva)' },
} as const;

// Moldura de telemovel com a barra de topo da app.
function Ecra({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="guia-ecra">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 9, borderBottom: '1px solid var(--linha-quente)' }}>
        <span className="titulo" style={{ fontSize: 13, letterSpacing: '0.04em' }}>
          N<span style={{ color: 'var(--acento)' }}>&apos;</span>ASA
        </span>
        <span aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 13, height: 1.5, background: 'var(--texto-suave)', borderRadius: 2 }} />)}
        </span>
      </div>
      {titulo && <div className="titulo" style={{ fontSize: 19, textTransform: 'uppercase', marginTop: 12 }}>{titulo}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>{children}</div>
    </div>
  );
}

function Cartao({ children, estilo }: { children: ReactNode; estilo?: CSSProperties }) {
  return (
    <div style={{ background: 'var(--superficie)', border: '1px solid var(--linha)', borderRadius: 10, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 5, ...estilo }}>
      {children}
    </div>
  );
}

function Estado({ estado }: { estado: keyof typeof ESTADOS }) {
  const { rotulo, cor } = ESTADOS[estado];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: cor, border: `1px solid ${cor}`, borderRadius: 999, padding: '2px 6px', whiteSpace: 'nowrap' }}>
      <span style={{ width: 4, height: 4, borderRadius: 9, background: 'currentColor' }} />
      {rotulo}
    </span>
  );
}

function Botao({ children, toque, secundario, estilo }: { children: ReactNode; toque?: boolean; secundario?: boolean; estilo?: CSSProperties }) {
  return (
    <span
      className={toque ? 'guia-toque' : undefined}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 26,
        padding: '0 11px',
        borderRadius: 8,
        fontSize: 10.5,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: secundario ? 'var(--superficie-2)' : 'var(--acento)',
        color: secundario ? 'var(--texto)' : '#fff',
        border: secundario ? '1px solid var(--linha)' : 'none',
        ...estilo,
      }}
    >
      {children}
    </span>
  );
}

function Linha({ esquerda, direita, sub, cor }: { esquerda: ReactNode; direita?: ReactNode; sub?: ReactNode; cor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 11 }}>{esquerda}</strong>
        {sub && <span style={{ fontSize: 9, color: 'var(--texto-fraco)' }}>{sub}</span>}
      </span>
      {direita && <span style={{ fontSize: 10, color: cor ?? 'var(--texto-suave)', whiteSpace: 'nowrap' }}>{direita}</span>}
    </div>
  );
}

const pequeno: CSSProperties = { fontSize: 9.5, color: 'var(--texto-suave)' };
const rotulo: CSSProperties = { fontFamily: 'var(--fonte-titulo)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--texto-fraco)' };

// --- Um por passo ----------------------------------------------------------

export function IlustracaoBoasVindas() {
  const itens = [
    { t: 'Agenda', i: <path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" /> },
    { t: 'Calendario', i: <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /> },
    { t: 'Recibos', i: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" /> },
    { t: 'Cifras', i: <path d="M9 18V5l11-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <div className="guia-emblema">
        <img src="/logo-emblema.jpg" alt="" width={150} height={150} style={{ width: 150, height: 150, objectFit: 'cover', mixBlendMode: 'screen', filter: 'contrast(1.6) brightness(1.05)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%', maxWidth: 300 }}>
        {itens.map(({ t, i }, n) => (
          <span key={t} className="guia-chip" style={{ animationDelay: `${120 + n * 70}ms` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--acento-forte)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{i}</svg>
            <span style={{ fontSize: 10, color: 'var(--texto-suave)' }}>{t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function IlustracaoPainel() {
  return (
    <Ecra titulo="Painel">
      <div style={{ borderRadius: 12, padding: '11px 12px', border: '1px solid var(--linha-quente)', background: 'linear-gradient(135deg, var(--superficie-quente), var(--superficie) 70%)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={rotulo}>Proximo concerto</span>
          <span style={{ fontSize: 8.5, color: 'var(--acento-forte)', background: 'var(--acento-suave)', borderRadius: 99, padding: '2px 7px' }}>daqui a 4 dias</span>
        </div>
        <span className="titulo" style={{ fontSize: 16, textTransform: 'uppercase' }}>Festa de Verao</span>
        <span style={pequeno}>sab, 12 julho, 21:30 · Largo da Igreja</span>
        <strong className="titulo" style={{ alignSelf: 'flex-end', fontSize: 15 }}>1150 EUR</strong>
      </div>
      <Cartao>
        <span style={rotulo}>Calendario Google</span>
        {[
          ['var(--estado-pre-reserva)', '1 estado atualizado agora'],
          ['var(--estado-recusado)', '1 concerto com alguem indisponivel'],
          ['var(--acento-forte)', '2 concertos novos por importar'],
        ].map(([cor, t]) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 9, background: cor, flexShrink: 0 }} />
            {t}
          </span>
        ))}
      </Cartao>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Cartao><span style={rotulo}>Concertos do mes</span><strong className="titulo" style={{ fontSize: 17 }}>3</strong></Cartao>
        <Cartao><span style={rotulo}>Recibos por passar</span><strong className="titulo" style={{ fontSize: 17 }}>2</strong></Cartao>
      </div>
    </Ecra>
  );
}

export function IlustracaoAgenda() {
  return (
    <Ecra titulo="Agenda">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 3, borderRadius: 99, border: '1px solid var(--linha)' }}>
        <span style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, padding: '5px 0', borderRadius: 99, border: '1px solid var(--acento)', background: 'var(--acento-suave)' }}>Proximos</span>
        <span className="guia-toque" style={{ position: 'relative', textAlign: 'center', fontSize: 10.5, color: 'var(--texto-suave)', padding: '5px 0', borderRadius: 99 }}>Arquivo (21)</span>
      </div>
      <Cartao estilo={{ borderColor: 'var(--estado-recusado)', background: 'rgba(216, 81, 74, 0.08)' }}>
        <strong style={{ fontSize: 10, color: 'var(--estado-recusado)' }}>Atencao: concerto com alguem indisponivel</strong>
        <span style={{ fontSize: 10 }}><strong>Festa de Verao</strong> <span style={{ color: 'var(--texto-suave)' }}>(sab, 12 jul):</span> Tiago</span>
      </Cartao>
      {[
        { n: 'Festa de Verao', d: 'sab, 12 julho, 21:30', v: '1150 EUR', e: 'confirmado' as const },
        { n: 'Casamento Ana e Rui', d: 'sab, 26 julho, 18:00', v: '1300 EUR', e: 'pre_reserva' as const },
      ].map((c) => (
        <Cartao key={c.n}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <strong style={{ fontSize: 11.5 }}>{c.n}</strong>
            <Estado estado={c.e} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={pequeno}>{c.d}</span>
            <strong className="titulo" style={{ fontSize: 12 }}>{c.v}</strong>
          </div>
        </Cartao>
      ))}
    </Ecra>
  );
}

export function IlustracaoCalendario() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 300 }}>
      <div style={{ width: '100%', background: '#f6f5f2', color: '#1f1f1f', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: 'var(--sombra-2)' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5f6368' }}>Google Calendar · N&apos;ASA</span>
        <span style={{ fontSize: 11, borderLeft: '3px solid #f5811e', paddingLeft: 7 }}>
          <strong>sab 9</strong> · Fechado Festa da Vila 1150eur com Nuno
        </span>
        <span style={{ fontSize: 11, borderLeft: '3px solid #4a9bd8', paddingLeft: 7 }}>
          <strong>dom 10</strong> · Tiago indisponivel
        </span>
      </div>
      <svg className="guia-seta" width="22" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--acento-forte)" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M12 3v16M6 13l6 6 6-6" />
      </svg>
      <div style={{ width: '100%' }}>
        <span style={{ ...rotulo, display: 'block', marginBottom: 6 }}>No calendario, por importar</span>
        <Cartao estilo={{ borderColor: 'var(--linha-quente)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ fontSize: 11.5 }}>Festa da Vila</strong>
            <span style={pequeno}>sab, 9 ago · 1150 EUR · tecnico Nuno</span>
          </span>
          <Botao toque>Importar</Botao>
        </Cartao>
      </div>
    </div>
  );
}

export function IlustracaoDisponibilidade() {
  return (
    <Ecra titulo="Disponibilidade">
      <Botao toque estilo={{ minHeight: 30, width: '100%' }}>Marcar indisponibilidade</Botao>
      <span style={rotulo}>Agosto</span>
      <Cartao estilo={{ gap: 9 }}>
        <Linha esquerda="Tiago Barbosa" sub="Tiago indisponivel - batizado" direita="dom, 10 ago" cor="var(--estado-recusado)" />
        <Linha esquerda="Helder Brites" sub="Helder indisponivel - viagem" direita="14 a 18 ago" />
        <Linha esquerda="Kevin Mendes" sub="Kevin indisponivel" direita="sab, 23 ago" />
      </Cartao>
      <span style={{ ...pequeno, textAlign: 'center' }}>Toca numa para a alterar ou apagar no calendario</span>
    </Ecra>
  );
}

export function IlustracaoRecibos() {
  return (
    <Ecra titulo="Recibos">
      <span style={rotulo}>Por passar (2)</span>
      <Cartao estilo={{ borderColor: 'var(--linha-quente)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <strong style={{ fontSize: 11.5 }}>Festa de Verao</strong>
          <span style={pequeno}>sab, 12 julho · 1150 EUR</span>
        </span>
        <Botao toque>Passar</Botao>
      </Cartao>
      <Cartao estilo={{ gap: 6 }}>
        <span style={{ fontSize: 9.5, color: 'var(--texto-suave)' }}>Nome (quem passa)</span>
        <span style={{ fontSize: 11, padding: '6px 8px', borderRadius: 7, background: 'var(--superficie-2)', border: '1px solid var(--acento)' }}>Sem papel (nao leva recibo)</span>
        <span style={{ fontSize: 9, color: 'var(--texto-fraco)' }}>Fica registado com valor 0 e sai de Por passar.</span>
      </Cartao>
      <span style={rotulo}>Passados</span>
      <Cartao>
        <Linha esquerda={<>Marco Pinheiro <span style={{ color: 'var(--estado-confirmado)' }}>✓</span></>} sub="Festa de Sao Joao" direita={<strong className="titulo" style={{ fontSize: 12, color: 'var(--texto)' }}>250 EUR</strong>} />
      </Cartao>
    </Ecra>
  );
}

export function IlustracaoPalco() {
  const acorde: CSSProperties = { color: 'var(--acento-forte)', fontWeight: 700 };
  return (
    <div className="guia-ecra" style={{ fontFamily: 'var(--fonte-mono), monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--texto-suave)', fontFamily: 'var(--fonte-corpo)' }}>
        <span>✕ Sair</span>
        <span>3/12</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span className="titulo" style={{ fontSize: 17, textTransform: 'uppercase' }}>A nossa musica</span>
        <span style={{ fontSize: 9, border: '1px solid var(--linha)', borderRadius: 6, padding: '2px 6px', color: 'var(--texto-suave)' }}>Tom Em</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 10, fontSize: 11.5, lineHeight: 1.35 }}>
        <span style={{ letterSpacing: '0.1em' }}>[VERSO]</span>
        <span style={acorde}>Em{' '.repeat(10)}C</span>
        <span>Aqui fica a letra do verso</span>
        <span style={acorde}>G{' '.repeat(14)}D</span>
        <span>com os acordes por cima</span>
        <span style={{ letterSpacing: '0.1em', marginTop: 6 }}>[REFRAO]</span>
        <span style={acorde}>C{' '.repeat(8)}G</span>
        <span>E o refrao bem a vista</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginTop: 14, fontFamily: 'var(--fonte-corpo)' }}>
        <Botao secundario>Anterior</Botao>
        <span style={{ display: 'flex', gap: 4 }}>
          <Botao secundario estilo={{ padding: '0 7px' }}>-1</Botao>
          <Botao secundario estilo={{ padding: '0 7px' }}>+1</Botao>
        </span>
        <Botao toque>Seguinte</Botao>
      </div>
    </div>
  );
}

export function IlustracaoCifras() {
  const Opcao = ({ t, ligado }: { t: string; ligado?: boolean }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${ligado ? 'var(--acento)' : 'var(--linha)'}`, background: ligado ? 'var(--acento)' : 'transparent', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ligado ? '✓' : ''}</span>
      {t}
    </span>
  );
  return (
    <Ecra titulo="As minhas cifras">
      <span style={{ fontSize: 9.5, color: 'var(--texto-suave)' }}>O meu instrumento</span>
      <span className="guia-toque" style={{ position: 'relative', fontSize: 11.5, padding: '7px 9px', borderRadius: 8, background: 'var(--superficie-2)', border: '1px solid var(--linha)' }}>BAIXO</span>
      <Cartao estilo={{ gap: 9 }}>
        <Opcao t="Ver so a tonica (nota do baixo)" ligado />
        <Opcao t="Esconder acordes (ver so a letra)" />
      </Cartao>
      <span style={rotulo}>Pre-visualizacao</span>
      <Cartao estilo={{ fontFamily: 'var(--fonte-mono), monospace', fontSize: 11, gap: 2 }}>
        <span style={{ color: 'var(--acento-forte)', fontWeight: 700 }}>E{' '.repeat(11)}C</span>
        <span>Aqui fica a letra do verso</span>
      </Cartao>
    </Ecra>
  );
}

export function IlustracaoInstalar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 300 }}>
      <div style={{ width: '100%', background: 'var(--superficie-elevada)', border: '1px solid var(--linha)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--sombra-2)' }}>
        {['Nova aba', 'Partilhar...', 'Adicionar ao ecra principal', 'Definicoes'].map((t) => {
          const destaque = t.startsWith('Adicionar');
          return (
            <div
              key={t}
              className={destaque ? 'guia-toque' : undefined}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', fontSize: 12, borderBottom: '1px solid var(--linha)', color: destaque ? 'var(--texto)' : 'var(--texto-suave)', fontWeight: destaque ? 700 : 400, background: destaque ? 'var(--acento-suave)' : 'transparent' }}
            >
              {destaque && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--acento-forte)" strokeWidth="2" aria-hidden>
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              )}
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--texto-suave)' }}>
        <img src="/icons/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: 10 }} />
        Fica no ecra, como uma app
      </div>
    </div>
  );
}
