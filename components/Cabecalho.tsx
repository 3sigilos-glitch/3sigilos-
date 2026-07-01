import Link from 'next/link';
import Marca from '@/components/Marca';

// Barra de topo: logotipo da marca, atalho para os clientes e fim de sessao.
export default function Cabecalho() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-linha bg-fundo px-4 py-3"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
      <Link href="/painel" aria-label="Ir para o painel">
        <Marca tamanho="medio" />
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/clientes"
          aria-label="Clientes"
          title="Clientes"
          className="flex h-10 w-10 items-center justify-center rounded-pequeno text-texto-suave transition-colors hover:text-dourado"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M20 21a8 8 0 1 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        </Link>

        <form action="/auth/sair" method="post">
          <button
            type="submit"
            title="Sair"
            aria-label="Sair"
            className="flex h-10 w-10 items-center justify-center rounded-pequeno text-texto-suave transition-colors hover:text-dourado"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
