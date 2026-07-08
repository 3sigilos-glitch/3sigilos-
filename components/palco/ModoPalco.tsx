'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import { tomTransposto } from '@/lib/acordes';

export interface MusicaPalco {
  titulo: string;
  artista: string | null;
  nota: string | null;
  tom: string | null;
  conteudo: string | null;
}

// Modo palco: ecra cheio, texto grande, fundo escuro, ecra sempre aceso,
// transposicao dos acordes e navegacao entre musicas da setlist.
export default function ModoPalco({
  setlistId,
  nomeSetlist,
  musicas,
  inicio = 0,
}: {
  setlistId: string;
  nomeSetlist: string;
  musicas: MusicaPalco[];
  inicio?: number;
}) {
  const [indice, setIndice] = useState(Math.min(Math.max(inicio, 0), Math.max(musicas.length - 1, 0)));
  const [semitons, setSemitons] = useState(0);
  const [tamanho, setTamanho] = useState(18);
  const scrollRef = useRef<HTMLDivElement>(null);

  const musica = musicas[indice];

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

  if (!musica) return null;
  const tomBase = musica.tom;
  const tomAtual = tomTransposto(tomBase, semitons) || (semitons !== 0 ? `${semitons > 0 ? '+' : ''}${semitons}` : '');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--fundo)', display: 'flex', flexDirection: 'column' }}>
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
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' as any }}>
        {musica.conteudo ? (
          <CifraFormatada conteudo={musica.conteudo} semitons={semitons} tamanho={tamanho} />
        ) : (
          <p style={{ color: 'var(--texto-suave)', fontSize: 15 }}>Esta musica ainda nao tem cifra. Acrescenta uma no repertorio.</p>
        )}
      </div>

      {/* Controlos */}
      <div style={{ borderTop: '1px solid var(--linha)', padding: '10px 12px calc(10px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" onClick={() => irPara(indice - 1)} disabled={indice === 0} className="botao botao-secundario" style={{ width: 'auto', minWidth: 64, opacity: indice === 0 ? 0.4 : 1 }}>Anterior</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ControloRedondo etiqueta="A-" onClick={() => setTamanho((t) => Math.max(13, t - 1))} />
          <ControloRedondo etiqueta="-1" onClick={() => setSemitons((s) => s - 1)} titulo="Descer meio tom" />
          <span style={{ minWidth: 34, textAlign: 'center', fontSize: 12, color: 'var(--texto-suave)' }}>{semitons > 0 ? `+${semitons}` : semitons}</span>
          <ControloRedondo etiqueta="+1" onClick={() => setSemitons((s) => s + 1)} titulo="Subir meio tom" />
          <ControloRedondo etiqueta="A+" onClick={() => setTamanho((t) => Math.min(30, t + 1))} />
        </div>

        <button type="button" onClick={() => irPara(indice + 1)} disabled={indice === musicas.length - 1} className="botao" style={{ width: 'auto', minWidth: 64, opacity: indice === musicas.length - 1 ? 0.4 : 1 }}>Seguinte</button>
      </div>
    </div>
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
