'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navegacao inferior, quatro destinos ao alcance do polegar.
// A Agenda aponta para a lista de eventos (rota /eventos, rotulo Agenda).
const SECCOES = [
  { href: '/painel', etiqueta: 'Painel', icone: IconePainel },
  { href: '/eventos', etiqueta: 'Agenda', icone: IconeAgenda },
  { href: '/setlists', etiqueta: 'Setlists', icone: IconeSetlists },
  { href: '/recibos', etiqueta: 'Recibos', icone: IconeRecibos },
];

export default function NavInferior() {
  const caminho = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(var(--barra-inferior) + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--superficie)',
        borderTop: '1px solid var(--linha)',
        display: 'grid',
        gridTemplateColumns: `repeat(${SECCOES.length}, 1fr)`,
        zIndex: 50,
      }}
    >
      {SECCOES.map(({ href, etiqueta, icone: Icone }) => {
        const ativo = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: ativo ? 'var(--acento)' : 'var(--texto-suave)',
              fontSize: 10,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              fontWeight: ativo ? 700 : 500,
              transition: 'color var(--dur) var(--curva)',
            }}
          >
            {ativo && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 26,
                  height: 2,
                  borderRadius: 2,
                  background: 'var(--acento)',
                  boxShadow: '0 0 8px var(--acento)',
                }}
              />
            )}
            <Icone />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

function IconePainel() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconeAgenda() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}

function IconeSetlists() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

function IconeRecibos() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}
