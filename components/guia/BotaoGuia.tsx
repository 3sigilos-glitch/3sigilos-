'use client';

import { useEffect, useState } from 'react';
import { EVENTO_GUIA_VISTO, guiaJaVisto } from './Guia';
import { abrirGuia } from './GuiaAutomatico';

// Botao "Guia" no cabecalho, sempre a vista. Enquanto a pessoa ainda nao viu
// o guia neste aparelho, tem um ponto laranja a pulsar para chamar a atencao.
export default function BotaoGuia() {
  const [porVer, setPorVer] = useState(false);

  useEffect(() => {
    setPorVer(guiaJaVisto() === false);
    const visto = () => setPorVer(false);
    window.addEventListener(EVENTO_GUIA_VISTO, visto);
    return () => window.removeEventListener(EVENTO_GUIA_VISTO, visto);
  }, []);

  return (
    <button
      type="button"
      onClick={abrirGuia}
      aria-label="Abrir o guia da app"
      className="botao-guia"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
      </svg>
      Guia
      {porVer && <span className="guia-ponto" aria-hidden />}
    </button>
  );
}
