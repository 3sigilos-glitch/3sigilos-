import Marca from '@/components/Marca';

// Barra de topo com o logotipo branco e a accao de sair.
// O email do utilizador com sessao iniciada e mostrado de forma discreta.
export default function Cabecalho({ email }: { email?: string }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        paddingTop: 'calc(14px + env(safe-area-inset-top))',
        background: 'var(--fundo)',
        borderBottom: '1px solid var(--linha)',
      }}
    >
      <Marca tamanho="medio" />

      <form action="/auth/sair" method="post">
        <button
          type="submit"
          title="Sair"
          aria-label="Sair"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            color: 'var(--texto-suave)',
            fontSize: 12,
            padding: 8,
          }}
        >
          {email && <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </form>
    </header>
  );
}
