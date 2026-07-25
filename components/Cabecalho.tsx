'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import Marca from '@/components/Marca';
import MenuRapido from '@/components/MenuRapido';

// Barra de topo com o emblema e o nome. Recua ao rolar para baixo, para dar o
// ecra ao conteudo, e volta assim que se rola para cima. O menu a direita da
// acesso a tudo a partir de qualquer sitio.
export default function Cabecalho({ email, ehAdmin }: { email?: string; ehAdmin?: boolean }) {
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

      <MenuRapido email={email} ehAdmin={ehAdmin} />
    </header>
  );
}
