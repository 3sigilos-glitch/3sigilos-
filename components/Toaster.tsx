'use client';

import { useEffect, useState } from 'react';
import type { TipoToast } from '@/lib/toast';

interface Nota {
  id: number;
  tipo: TipoToast;
  texto: string;
}

// Mostra as confirmacoes curtas, que aparecem e saem sozinhas.
export default function Toaster() {
  const [notas, setNotas] = useState<Nota[]>([]);

  useEffect(() => {
    let contador = 0;
    const aoReceber = (e: Event) => {
      const detalhe = (e as CustomEvent).detail as { tipo: TipoToast; texto: string };
      const id = ++contador;
      setNotas((atuais) => [...atuais, { id, ...detalhe }]);
      setTimeout(() => setNotas((atuais) => atuais.filter((n) => n.id !== id)), 2600);
    };
    window.addEventListener('nasa-toast', aoReceber);
    return () => window.removeEventListener('nasa-toast', aoReceber);
  }, []);

  if (notas.length === 0) return null;

  return (
    <div className="toaster" aria-live="polite">
      {notas.map((n) => (
        <div key={n.id} className={`toast ${n.tipo === 'ok' ? 'toast--ok' : 'toast--erro'}`}>
          <span aria-hidden style={{ color: n.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)', fontWeight: 700 }}>
            {n.tipo === 'ok' ? '✓' : '⚠'}
          </span>
          <span style={{ flex: 1 }}>{n.texto}</span>
        </div>
      ))}
    </div>
  );
}
