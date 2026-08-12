// Marcadores da zona de administracao.
//
// Tudo o que so o admin ve ou pode mexer aparece a violeta (bem distinto do
// laranja de palco) e diz claramente que e reservado. Assim ninguem se engana a
// pensar que os outros elementos veem o mesmo ecra.

// Etiqueta pequena, para pousar ao lado de um titulo ou de um botao.
export function EtiquetaAdmin({ texto = 'So admin' }: { texto?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 999,
        color: 'var(--admin-forte)',
        background: 'var(--admin-suave)',
        border: '1px solid var(--admin-linha)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      {texto}
    </span>
  );
}

// Aviso de topo: explica que aquele ecra (ou seccao) so e visivel ao admin.
export function AvisoAdmin({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 'var(--raio-pequeno)',
        background: 'var(--admin-suave)',
        border: '1px solid var(--admin-linha)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--admin-forte)" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.55, color: 'var(--texto-suave)' }}>
        {children ?? (
          <>
            <strong style={{ color: 'var(--admin-forte)' }}>Zona de administracao.</strong> Isto so aparece a quem e
            admin. Os outros elementos nao veem nem conseguem alterar nada disto.
          </>
        )}
      </div>
    </div>
  );
}
