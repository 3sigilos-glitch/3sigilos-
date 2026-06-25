/* eslint-disable @next/next/no-img-element */
// Avatar de um elemento da equipa. Mostra a foto se houver, ou as iniciais.
export default function Avatar({ nome, fotoUrl, tamanho = 56 }: { nome: string; fotoUrl?: string | null; tamanho?: number }) {
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        width={tamanho}
        height={tamanho}
        style={{ width: tamanho, height: tamanho, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--linha)' }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        background: 'var(--superficie-2)',
        border: '1px solid var(--linha)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--fonte-titulo)',
        fontWeight: 700,
        fontSize: tamanho * 0.36,
        color: 'var(--texto-suave)',
      }}
    >
      {iniciais || '?'}
    </span>
  );
}
