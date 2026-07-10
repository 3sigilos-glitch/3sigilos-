'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navegacao inferior, pensada para o polegar: alvos de toque grandes
// e indicacao clara da seccao ativa.
const SECCOES = [
  { href: '/painel', etiqueta: 'Painel', Icone: IconePainel },
  { href: '/encomendas', etiqueta: 'Encomendas', Icone: IconeEncomendas },
  { href: '/faturacao', etiqueta: 'Faturar', Icone: IconeFaturacao },
  { href: '/stock', etiqueta: 'Stock', Icone: IconeStock },
  { href: '/desenhos', etiqueta: 'Desenhos', Icone: IconeDesenhos },
];

export default function NavInferior() {
  const caminho = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-linha bg-superficie/85 backdrop-blur-md"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {SECCOES.map(({ href, etiqueta, Icone }) => {
        const ativo = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wide transition-colors ${
              ativo ? 'font-bold text-dourado' : 'font-medium text-texto-suave hover:text-texto'
            }`}
          >
            {/* Indicador dourado do separador ativo. */}
            {ativo && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-dourado shadow-[0_0_8px_rgba(201,162,75,0.7)]" />
            )}
            <Icone />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

// Icones em linha fina, coerentes com a estetica sobria da marca.
function IconePainel() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function IconeEncomendas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}

function IconeFaturacao() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function IconeStock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 3 5 6v3h14V6l-3-3zM5 9v11h14V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

function IconeDesenhos() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}
