'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Guia, { CHAVE_GUIA, VERSAO_GUIA } from './Guia';

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
    try {
      if (localStorage.getItem(CHAVE_GUIA) !== VERSAO_GUIA) setAberto(true);
    } catch {
      // Sem armazenamento (navegacao privada): nao abre sozinho, para nao
      // aparecer em todas as paginas. Continua disponivel no menu.
    }
    // So na primeira montagem: nao volta a abrir ao navegar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener(EVENTO_ABRIR_GUIA, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_GUIA, abrir);
  }, []);

  function fechar() {
    try {
      localStorage.setItem(CHAVE_GUIA, VERSAO_GUIA);
    } catch {
      // Sem armazenamento: so fecha.
    }
    setAberto(false);
  }

  return <Guia aberto={aberto} onFechar={fechar} />;
}
