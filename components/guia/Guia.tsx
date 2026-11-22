'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  IlustracaoBoasVindas,
  IlustracaoPainel,
  IlustracaoAgenda,
  IlustracaoCalendario,
  IlustracaoDisponibilidade,
  IlustracaoRecibos,
  IlustracaoPalco,
  IlustracaoCifras,
  IlustracaoInstalar,
} from './Ilustracoes';

// Guia da app: uma volta guiada, passo a passo, por tudo o que a app faz.
// Abre sozinho na primeira entrada (ver GuiaAutomatico) e fica sempre no menu
// e em /guia. Passa-se com o dedo, com as setas ou com os botoes.

// Mudar esta versao volta a mostrar o guia a todos (por exemplo, com novidades).
export const VERSAO_GUIA = '2026-11';
export const CHAVE_GUIA = 'nasa-guia-visto';

interface Passo {
  secao: string;
  titulo: string;
  texto: ReactNode;
  novo?: boolean;
  href?: string;
  verNaApp?: string;
  ilustracao: ReactNode;
}

const PASSOS: Passo[] = [
  {
    secao: 'Bem-vindo',
    titulo: "A app dos N'ASA",
    texto: 'Agenda, calendário, disponibilidade, recibos e cifras da banda, tudo num só sítio. Em dois minutos ficas a saber como funciona.',
    ilustracao: <IlustracaoBoasVindas />,
  },
  {
    secao: 'Painel',
    titulo: 'O ponto de partida',
    texto: 'O próximo concerto em destaque, os números do mês e um resumo do que o calendário Google tem para ti. Cada cartão abre com um toque.',
    href: '/painel',
    verNaApp: 'Abrir o Painel',
    ilustracao: <IlustracaoPainel />,
  },
  {
    secao: 'Agenda',
    titulo: 'Concertos e propostas',
    texto: (
      <>
        Os próximos concertos por ordem, com o estado de cada um. Os que já passaram vão sozinhos para o{' '}
        <strong>Arquivo</strong>. Se alguém estiver indisponível num dia de concerto, a app avisa.
      </>
    ),
    novo: true,
    href: '/eventos',
    verNaApp: 'Abrir a Agenda',
    ilustracao: <IlustracaoAgenda />,
  },
  {
    secao: 'Calendário Google',
    titulo: 'Escrevem lá, aparece cá',
    texto: (
      <>
        Continuem a usar o calendário da banda. Os concertos novos aparecem na Agenda prontos a{' '}
        <strong>importar com um toque</strong>, sem duplicados. Quando o título diz «fechado» ou «anulei», o estado
        atualiza-se sozinho.
      </>
    ),
    novo: true,
    href: '/eventos',
    verNaApp: 'Ver o que há por importar',
    ilustracao: <IlustracaoCalendario />,
  },
  {
    secao: 'Disponibilidade',
    titulo: 'Quem pode e quem não pode',
    texto: (
      <>
        As indisponibilidades de todos, sempre iguais ao calendário. Para marcar a tua, toca em{' '}
        <strong>Marcar indisponibilidade</strong>: abre o Google Calendar já preenchido e só tens de guardar.
      </>
    ),
    novo: true,
    href: '/disponibilidade',
    verNaApp: 'Abrir Disponibilidade',
    ilustracao: <IlustracaoDisponibilidade />,
  },
  {
    secao: 'Recibos',
    titulo: 'Nada fica por passar',
    texto: (
      <>
        Cada concerto realizado fica em <strong>Por passar</strong> até alguém passar o recibo. Se o concerto não leva
        recibo, escolhe <strong>Sem papel</strong> e sai da lista.
      </>
    ),
    novo: true,
    href: '/recibos',
    verNaApp: 'Abrir Recibos',
    ilustracao: <IlustracaoRecibos />,
  },
  {
    secao: 'Setlists e palco',
    titulo: 'A cifra no ecrã todo',
    texto: 'Cada concerto tem a sua setlist. No modo palco a cifra ocupa o ecrã: muda de música, de tom e de tamanho com um toque.',
    href: '/setlists',
    verNaApp: 'Abrir Setlists',
    ilustracao: <IlustracaoPalco />,
  },
  {
    secao: 'As minhas cifras',
    titulo: 'À medida do teu instrumento',
    texto: 'Escolhe o teu instrumento e como queres ver as cifras: só a tónica para o baixo, sem acordes para a voz. Só muda para ti.',
    href: '/preferencias',
    verNaApp: 'Abrir As minhas cifras',
    ilustracao: <IlustracaoCifras />,
  },
  {
    secao: 'No telemóvel',
    titulo: 'Instala como uma app',
    texto: (
      <>
        No browser, abre o menu e escolhe <strong>Adicionar ao ecrã principal</strong>. Este guia fica sempre no menu
        ☰, em <strong>Guia da app</strong>.
      </>
    ),
    ilustracao: <IlustracaoInstalar />,
  },
];

// onFechar recebe true quando se sai por um atalho "Abrir ..." (a navegacao ja
// esta a acontecer, por isso quem fecha nao deve mudar de pagina).
export default function Guia({ aberto, onFechar }: { aberto: boolean; onFechar: (porAtalho?: boolean) => void }) {
  const [indice, setIndice] = useState(0);
  const [direcao, setDirecao] = useState<1 | -1>(1);
  const [montado, setMontado] = useState(false);
  const painel = useRef<HTMLDivElement>(null);
  const toqueInicio = useRef<{ x: number; y: number } | null>(null);
  const focoAnterior = useRef<Element | null>(null);

  const ultimo = PASSOS.length - 1;
  const passo = PASSOS[indice];

  const ir = useCallback(
    (novo: number) => {
      if (novo < 0 || novo > ultimo) return;
      setDirecao(novo > indice ? 1 : -1);
      setIndice(novo);
    },
    [indice, ultimo]
  );

  useEffect(() => setMontado(true), []);

  // Ao abrir: comeca do inicio, guarda o foco, bloqueia o scroll da pagina.
  useEffect(() => {
    if (!aberto) return;
    setIndice(0);
    focoAnterior.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => painel.current?.focus());
    return () => {
      document.body.style.overflow = overflow;
      (focoAnterior.current as HTMLElement | null)?.focus?.();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar(false);
      else if (e.key === 'ArrowRight') ir(indice + 1);
      else if (e.key === 'ArrowLeft') ir(indice - 1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberto, indice, ir, onFechar]);

  if (!aberto || !montado) return null;

  return createPortal(
    <div
      ref={painel}
      role="dialog"
      aria-modal="true"
      aria-label="Guia da app"
      tabIndex={-1}
      className="guia"
      onTouchStart={(e) => {
        const t = e.touches[0];
        toqueInicio.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const i = toqueInicio.current;
        toqueInicio.current = null;
        if (!i) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - i.x;
        const dy = t.clientY - i.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) ir(indice + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="guia-coluna">
        {/* Topo: progresso e saltar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }} aria-hidden>
            {PASSOS.map((p, i) => (
              <button
                key={p.secao}
                type="button"
                tabIndex={-1}
                onClick={() => ir(i)}
                className="guia-segmento"
                style={{ background: i <= indice ? 'var(--acento)' : 'var(--linha)' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="carimbo" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-fraco)' }}>
              Guia da app · {indice + 1} de {PASSOS.length}
            </span>
            <button type="button" onClick={() => onFechar(false)} className="guia-saltar">
              {indice === ultimo ? 'Fechar' : 'Saltar'}
            </button>
          </div>
        </div>

        {/* Ilustracao e texto (entram com uma transicao curta ao mudar de passo) */}
        <div key={indice} className="guia-passo" style={{ ['--guia-dir' as string]: direcao }} aria-live="polite">
          <div className="guia-palco">{passo.ilustracao}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="carimbo" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--acento-forte)' }}>
                {passo.secao}
              </span>
              {passo.novo && <span className="guia-novo">Novo</span>}
            </div>
            <h2 className="titulo" style={{ fontSize: 30, lineHeight: 1.05, textTransform: 'uppercase', textWrap: 'balance' } as React.CSSProperties}>
              {passo.titulo}
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--texto-suave)' }}>{passo.texto}</p>
            {passo.href && passo.verNaApp && (
              <Link href={passo.href} onClick={() => onFechar(true)} style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--acento-forte)', display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 32 }}>
                {passo.verNaApp}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            )}
          </div>
        </div>

        {/* Navegacao */}
        <div style={{ display: 'grid', gridTemplateColumns: indice === 0 ? '1fr' : '1fr 2fr', gap: 10 }}>
          {indice > 0 && (
            <button type="button" className="botao botao-secundario" onClick={() => ir(indice - 1)}>
              Anterior
            </button>
          )}
          {indice < ultimo ? (
            <button type="button" className="botao" onClick={() => ir(indice + 1)}>
              {indice === 0 ? 'Começar o guia' : 'Seguinte'}
            </button>
          ) : (
            <button type="button" className="botao" onClick={() => onFechar(false)}>
              Começar a usar
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
