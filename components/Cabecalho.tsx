'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Marca from '@/components/Marca';

// Barra de topo com o emblema e o nome. Recua ao rolar para baixo, para dar o
// ecra ao conteudo, e volta assim que se rola para cima.
export default function Cabecalho({ email }: { email?: string }) {
  const [escondido, setEscondido] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    const aoRolar = () => {
      const y = window.scrollY;
      // So esconde depois de sair do topo, e reage a direcao.
      if (y > 64 && y > ultimo + 6) setEscondido(true);
      else if (y < ultimo - 6) setEscondido(false);
      ultimo = y;
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        background: 'var(--fundo)',
        borderBottom: '1px solid var(--linha)',
        boxShadow: '0 1px 0 rgba(var(--acento-rgb), 0.4)',
        transform: escondido ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform var(--dur) var(--curva)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img
          src="/logo-emblema.jpg"
          alt=""
          width={30}
          height={30}
          style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 8, mixBlendMode: 'screen' }}
        />
        <Marca tamanho="medio" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Preferencias pessoais de cifra (como cada um ve o palco). */}
        <Link
          href="/preferencias"
          title="As minhas cifras"
          aria-label="As minhas cifras"
          style={{ display: 'flex', alignItems: 'center', color: 'var(--texto-suave)', padding: 8 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </Link>

        <form action="/auth/sair" method="post">
          <button
            type="submit"
            title="Sair"
            aria-label="Sair"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'var(--texto-suave)', fontSize: 12, padding: 8 }}
          >
            {email && <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
