'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Botao flutuante de criar, sempre a mao. Cria a accao principal da seccao onde
// estamos (nos Recibos cria recibo, nas Setlists cria setlist...), em vez de
// criar sempre um evento. Esconde-se nos formularios e no modo palco.
const ACCOES: { prefixo: string; href: string; etiqueta: string }[] = [
  { prefixo: '/recibos', href: '/recibos/novo', etiqueta: 'Criar recibo' },
  { prefixo: '/setlists', href: '/setlists/nova', etiqueta: 'Criar setlist' },
  { prefixo: '/repertorio', href: '/repertorio/novo', etiqueta: 'Criar musica' },
  { prefixo: '/contactos', href: '/contactos/novo', etiqueta: 'Criar contacto' },
  { prefixo: '/eventos', href: '/eventos/novo', etiqueta: 'Criar evento' },
];
const POR_DEFEITO = { href: '/eventos/novo', etiqueta: 'Criar evento' };

export default function BotaoCriar() {
  const caminho = usePathname();
  const esconder =
    caminho.endsWith('/novo') ||
    caminho.endsWith('/nova') ||
    caminho.endsWith('/editar') ||
    caminho.includes('/palco');
  if (esconder) return null;

  const accao =
    ACCOES.find((a) => caminho === a.prefixo || caminho.startsWith(`${a.prefixo}/`)) ?? POR_DEFEITO;

  return (
    <Link href={accao.href} className="fab" aria-label={accao.etiqueta} title={accao.etiqueta}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
