'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Guia, { guiaJaVisto, marcarGuiaVisto } from './Guia';

// Evento para abrir o guia a partir de qualquer sitio (por exemplo, do menu).
export const EVENTO_ABRIR_GUIA = 'nasa:abrir-guia';

export function abrirGuia() {
  window.dispatchEvent(new Event(EVENTO_ABRIR_GUIA));
}

// Abre o guia sozinho na primeira vez que alguem entra (em cada aparelho), e
// sempre que for pedido. Depois de fechado, fica marcado como visto.
export default function GuiaAutomatico() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    // Nao interrompe o modo palco nem a propria pagina do guia.
    if (caminho?.startsWith('/guia') || caminho?.includes('/palco')) return;
    // Sem armazenamento (navegacao privada, null) nao abre sozinho, para nao
    // aparecer em todas as paginas. Continua disponivel no topo e no menu.
    if (guiaJaVisto() === false) setAberto(true);
    // So na primeira montagem: nao volta a abrir ao navegar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener(EVENTO_ABRIR_GUIA, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_GUIA, abrir);
  }, []);

  function fechar() {
    marcarGuiaVisto();
    setAberto(false);
  }

  return <Guia aberto={aberto} onFechar={fechar} />;
}
