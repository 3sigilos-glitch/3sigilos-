import Link from 'next/link';

// Ligacao de "Voltar" consistente em toda a app: seta e rotulo, sempre igual,
// para a navegacao para tras ser previsivel em qualquer ficha ou formulario.
export default function BotaoVoltar({ href, etiqueta = 'Voltar' }: { href: string; etiqueta?: string }) {
  return (
    <Link
      href={href}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--texto-suave)', fontSize: 14, alignSelf: 'flex-start' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg>
      {etiqueta}
    </Link>
  );
}
