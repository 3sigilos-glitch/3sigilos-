'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import { tomTransposto } from '@/lib/acordes';
import { guardarPreferenciasRapido } from '@/app/(app)/preferencias/acoes';

export interface MusicaPalco {
  titulo: string;
  artista: string | null;
  nota: string | null;
  tom: string | null;
  conteudo: string | null;
}

// Preferencias de cifra do membro, para semear os controlos e serem lembradas.
export interface PreferenciasPalco {
  tag: string | null;
  esconderAcordes: boolean;
  soTonica: boolean;
  tamanho: number;
}

// Modo palco: ecra cheio, texto grande, fundo escuro, ecra sempre aceso,
// transposicao dos acordes e navegacao entre musicas da setlist. As opcoes de
// visualizacao (tamanho, esconder acordes, so a tonica) sao por membro e ficam
// guardadas assim que se mexe nelas.
export default function ModoPalco({
  setlistId,
  nomeSetlist,
  musicas,
  inicio = 0,
  preferencias,
}: {
  setlistId: string;
  nomeSetlist: string;
  musicas: MusicaPalco[];
  inicio?: number;
  preferencias?: PreferenciasPalco;
}) {
  // O palco e desenhado por cima de tudo (portal no body), para cobrir mesmo o
  // cabecalho e a navegacao. So depois de montar no cliente e que existe body.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const [indice, setIndice] = useState(Math.min(Math.max(inicio, 0), Math.max(musicas.length - 1, 0)));
  const [semitons, setSemitons] = useState(0);
  const [tamanho, setTamanho] = useState(preferencias?.tamanho ?? 18);
  const [esconderAcordes, setEsconderAcordes] = useState(preferencias?.esconderAcordes ?? false);
  const [soTonica, setSoTonica] = useState(preferencias?.soTonica ?? false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Guarda o tamanho atual para o gesto de pinca o poder ler sem se re-subscrever.
  const tamanhoRef = useRef(tamanho);
  tamanhoRef.current = tamanho;
  // A etiqueta do instrumento nao se muda aqui, mas viaja nas gravacoes rapidas.
  const tag = preferencias?.tag ?? null;

  const musica = musicas[indice];

  // Guarda as opcoes de visualizacao assim que mudam, para virem assim da
  // proxima vez. Espera um pouco (o tamanho muda muito depressa na pinca) e nao
  // guarda na primeira renderizacao.
  const primeiraRef = useRef(true);
  useEffect(() => {
    if (primeiraRef.current) {
      primeiraRef.current = false;
      return;
    }
    const t = setTimeout(() => {
      guardarPreferenciasRapido({ tag, esconderAcordes, soTonica, tamanho }).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [esconderAcordes, soTonica, tamanho, tag]);

  // Pinca com dois dedos (pinch): aumenta ou diminui so o tamanho do texto da
  // cifra, sem mexer na pagina. Usa um ouvinte nao-passivo para poder impedir
  // o scroll enquanto se faz o gesto. Depende de "montado" para so ligar quando
  // o conteudo (e a referencia) ja existe no portal.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let distInicial = 0;
    let tamanhoInicial = 0;
    const distancia = (toques: TouchList) =>
      Math.hypot(toques[1].clientX - toques[0].clientX, toques[1].clientY - toques[0].clientY);

    const aoIniciar = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        distInicial = distancia(e.touches);
        tamanhoInicial = tamanhoRef.current;
      }
    };
    const aoMover = (e: TouchEvent) => {
      if (e.touches.length === 2 && distInicial > 0) {
        e.preventDefault(); // nao deixa a pagina fazer scroll durante a pinca
        const razao = distancia(e.touches) / distInicial;
        const novo = Math.min(48, Math.max(12, Math.round(tamanhoInicial * razao)));
        setTamanho(novo);
      }
    };
    const aoTerminar = (e: TouchEvent) => {
      if (e.touches.length < 2) distInicial = 0;
    };

    el.addEventListener('touchstart', aoIniciar, { passive: false });
    el.addEventListener('touchmove', aoMover, { passive: false });
    el.addEventListener('touchend', aoTerminar);
    el.addEventListener('touchcancel', aoTerminar);
    return () => {
      el.removeEventListener('touchstart', aoIniciar);
      el.removeEventListener('touchmove', aoMover);
      el.removeEventListener('touchend', aoTerminar);
      el.removeEventListener('touchcancel', aoTerminar);
    };
  }, [montado]);

  // Manter o ecra aceso enquanto o modo palco esta aberto.
  useEffect(() => {
    let sentinela: any = null;
    async function pedir() {
      try {
        sentinela = await (navigator as any).wakeLock?.request('screen');
      } catch {
        // O dispositivo pode nao suportar; segue sem bloquear.
      }
    }
    pedir();
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') pedir();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      try { sentinela?.release?.(); } catch {}
    };
  }, []);

  // Ao mudar de musica, volta a transposicao a zero e ao topo.
  function irPara(novo: number) {
    if (novo < 0 || novo >= musicas.length) return;
    setIndice(novo);
    setSemitons(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  if (!montado || !musica) return null;
  const tomBase = musica.tom;
  const tomAtual = tomTransposto(tomBase, semitons) || (semitons !== 0 ? `${semitons > 0 ? '+' : ''}${semitons}` : '');

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--fundo)', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de topo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 'calc(10px + env(safe-area-inset-top)) 14px 10px', borderBottom: '1px solid var(--linha)' }}>
        <Link href={`/setlists/${setlistId}`} aria-label="Sair do modo palco" style={{ color: 'var(--texto-suave)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 18L18 6M6 6l12 12" /></svg>
          Sair
        </Link>
        <span style={{ fontSize: 12, color: 'var(--texto-fraco)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeSetlist}</span>
        <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{indice + 1}/{musicas.length}</span>
      </div>

      {/* Titulo e tom */}
      <div style={{ padding: '12px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <h1 className="titulo" style={{ fontSize: 24, lineHeight: 1.1 }}>{musica.titulo}</h1>
          {musica.nota && <span style={{ fontSize: 13, color: 'var(--acento)' }}>{musica.nota}</span>}
        </div>
        {tomAtual && (
          <span className="carimbo carimbo--caixa" style={{ flexShrink: 0 }}>Tom {tomAtual}</span>
        )}
      </div>

      {/* Cifra, area grande e com scroll suave */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px', scrollBehavior: 'smooth', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' as any }}>
        {musica.conteudo ? (
          <CifraFormatada conteudo={musica.conteudo} semitons={semitons} tamanho={tamanho} esconderAcordes={esconderAcordes} soTonica={soTonica} />
        ) : (
          <p style={{ color: 'var(--texto-suave)', fontSize: 15 }}>Esta musica ainda nao tem cifra. Acrescenta uma no repertorio.</p>
        )}
      </div>

      {/* Vistas por instrumento: esconder acordes (voz) e so a tonica (baixo) */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px 0', justifyContent: 'center' }}>
        <Alternador
          ativo={esconderAcordes}
          onClick={() => setEsconderAcordes((v) => !v)}
          etiqueta={esconderAcordes ? 'So letra' : 'Esconder acordes'}
        />
        <Alternador
          ativo={soTonica}
          onClick={() => setSoTonica((v) => !v)}
          etiqueta="So a tonica"
        />
      </div>

      {/* Controlos */}
      <div style={{ padding: '8px 12px calc(10px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" onClick={() => irPara(indice - 1)} disabled={indice === 0} className="botao botao-secundario" style={{ width: 'auto', minWidth: 64, opacity: indice === 0 ? 0.4 : 1 }}>Anterior</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ControloRedondo etiqueta="A-" onClick={() => setTamanho((t) => Math.max(12, t - 1))} />
          <ControloRedondo etiqueta="-1" onClick={() => setSemitons((s) => s - 1)} titulo="Descer meio tom" />
          <span style={{ minWidth: 34, textAlign: 'center', fontSize: 12, color: 'var(--texto-suave)' }}>{semitons > 0 ? `+${semitons}` : semitons}</span>
          <ControloRedondo etiqueta="+1" onClick={() => setSemitons((s) => s + 1)} titulo="Subir meio tom" />
          <ControloRedondo etiqueta="A+" onClick={() => setTamanho((t) => Math.min(48, t + 1))} />
        </div>

        <button type="button" onClick={() => irPara(indice + 1)} disabled={indice === musicas.length - 1} className="botao" style={{ width: 'auto', minWidth: 64, opacity: indice === musicas.length - 1 ? 0.4 : 1 }}>Seguinte</button>
      </div>
    </div>,
    document.body
  );
}

function ControloRedondo({ etiqueta, onClick, titulo }: { etiqueta: string; onClick: () => void; titulo?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'var(--superficie-2)',
        border: '1px solid var(--linha)',
        color: 'var(--texto)',
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {etiqueta}
    </button>
  );
}

// Botao em pilula que fica aceso quando a vista esta ativa.
function Alternador({ ativo, onClick, etiqueta }: { ativo: boolean; onClick: () => void; etiqueta: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      style={{
        minHeight: 34,
        padding: '6px 14px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        background: ativo ? 'var(--acento-suave)' : 'var(--superficie-2)',
        border: `1px solid ${ativo ? 'var(--acento)' : 'var(--linha)'}`,
        color: ativo ? 'var(--acento-forte)' : 'var(--texto-suave)',
      }}
    >
      {etiqueta}
    </button>
  );
}
