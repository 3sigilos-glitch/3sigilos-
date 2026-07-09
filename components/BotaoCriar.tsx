'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Botao flutuante de criar, sempre a mao. Cria a acao mais frequente: um evento.
// Esconde-se nos formularios de criar e no modo palco, para nao estorvar.
export default function BotaoCriar() {
  const caminho = usePathname();
  const esconder =
    caminho.endsWith('/novo') ||
    caminho.endsWith('/nova') ||
    caminho.endsWith('/editar') ||
    caminho.includes('/palco');
  if (esconder) return null;

  return (
    <Link href="/eventos/novo" className="fab" aria-label="Criar evento">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
