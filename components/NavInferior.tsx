'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navegacao inferior, pensada para o polegar.
// Alvos de toque grandes e indicacao clara da seccao ativa.
const SECCOES = [
  { href: '/painel', etiqueta: 'Painel', icone: IconePainel },
  { href: '/eventos', etiqueta: 'Eventos', icone: IconeEventos },
  { href: '/contactos', etiqueta: 'Contactos', icone: IconeContactos },
  { href: '/equipa', etiqueta: 'Equipa', icone: IconeEquipa },
  { href: '/repertorio', etiqueta: 'Repertorio', icone: IconeRepertorio },
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
            }}
          >
            <Icone />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

// Icones simples em linha fina, coerentes com a estetica industrial.
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

function IconeEventos() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="17" rx="1" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}

function IconeContactos() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function IconeEquipa() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M17 5.5a3.5 3.5 0 0 1 0 6.5M22 21a7 7 0 0 0-5-6.7" />
    </svg>
  );
}

function IconeRepertorio() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}
