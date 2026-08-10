'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Menu de acesso rapido no cabecalho: chega a qualquer seccao a partir de
// qualquer sitio, mais As minhas cifras, a sessao e o terminar sessao. Fecha ao
// tocar fora, ao navegar ou com a tecla Escape.
const LINKS = [
  { href: '/painel', etiqueta: 'Painel' },
  { href: '/eventos', etiqueta: 'Agenda' },
  { href: '/setlists', etiqueta: 'Setlists' },
  { href: '/recibos', etiqueta: 'Recibos' },
  { href: '/repertorio', etiqueta: 'Repertorio' },
  { href: '/contactos', etiqueta: 'Contactos' },
  { href: '/equipa', etiqueta: 'Equipa' },
  { href: '/automacoes', etiqueta: 'Automacoes' },
  { href: '/preferencias', etiqueta: 'As minhas cifras' },
];

export default function MenuRapido({ email, ehAdmin }: { email?: string; ehAdmin?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  const items: { href: string; etiqueta: string; admin?: boolean }[] = ehAdmin
    ? [...LINKS, { href: '/definicoes', etiqueta: 'Definicoes', admin: true }]
    : LINKS;

  // Fecha com Escape.
  useEffect(() => {
    if (!aberto) return;
    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    window.addEventListener('keydown', aoTecla);
    return () => window.removeEventListener('keydown', aoTecla);
  }, [aberto]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Menu"
        aria-expanded={aberto}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: 'transparent', border: 'none', color: 'var(--texto)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {aberto ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {aberto && (
        <>
          {/* Zona clicavel para fechar ao tocar fora. */}
          <div onClick={() => setAberto(false)} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />

          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 46,
              minWidth: 220,
              background: 'var(--superficie)',
              border: '1px solid var(--linha)',
              borderRadius: 'var(--raio)',
              boxShadow: 'var(--sombra-2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {email && (
              <span style={{ padding: '10px 14px', fontSize: 12, color: 'var(--texto-fraco)', borderBottom: '1px solid var(--linha)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </span>
            )}

            {items.map((l) => {
              const ativo = caminho === l.href || caminho.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  onClick={() => setAberto(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    minHeight: 46,
                    padding: '0 14px',
                    fontSize: 15,
                    color: l.admin ? 'var(--admin-forte)' : ativo ? 'var(--acento)' : 'var(--texto)',
                    fontWeight: ativo ? 700 : 400,
                    borderBottom: '1px solid var(--linha)',
                    background: l.admin ? 'var(--admin-suave)' : undefined,
                  }}
                >
                  {l.etiqueta}
                  {l.admin && (
                    <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--admin-forte)' }}>
                      So admin
                    </span>
                  )}
                </Link>
              );
            })}

            <form action="/auth/sair" method="post">
              <button
                type="submit"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, minHeight: 46, padding: '0 14px', fontSize: 15, background: 'transparent', border: 'none', color: 'var(--texto-suave)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5M21 12H9" />
                </svg>
                Terminar sessao
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
