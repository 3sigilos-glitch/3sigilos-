'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Botao flutuante de registo rapido de encomenda.
// Fica sempre visivel e ao alcance do polegar, acima da navegacao inferior.
// Esconde-se na propria pagina de nova encomenda para nao se sobrepor ao formulario.
export default function BotaoNovaEncomenda() {
  const caminho = usePathname();
  if (caminho === '/encomendas/nova') return null;

  return (
    <Link
      href="/encomendas/nova"
      aria-label="Nova encomenda"
      className="fixed right-4 z-40 flex h-14 items-center gap-2 rounded-full px-5 font-titulo text-[15px] font-semibold tracking-wide text-fundo transition-[filter,transform] hover:brightness-105 active:scale-95"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)',
        backgroundImage: 'linear-gradient(180deg, #e6c878, #c9a24b)',
        boxShadow: '0 10px 30px -8px rgba(201, 162, 75, 0.7), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Encomenda
    </Link>
  );
}
