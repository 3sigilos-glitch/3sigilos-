/* eslint-disable @next/next/no-img-element */
import Marca from '@/components/Marca';

// Barra de topo com o emblema da banda, o logotipo em tipografia e a accao de
// sair. Um fino traco de luz vermelha por baixo da barra (o "palco a acender").
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
        boxShadow: '0 1px 0 rgba(226, 59, 46, 0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img
          src="/logo-emblema.jpg"
          alt=""
          width={30}
          height={30}
          style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, mixBlendMode: 'screen' }}
        />
        <Marca tamanho="medio" />
      </div>

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
