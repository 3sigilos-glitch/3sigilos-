// Selo geometrico da marca: um circulo, um triangulo inscrito e tres pontos.
// Evoca os "tres sigilos" e o esoterico, em linha fina dourada. Puramente decorativo.
export default function Sigilo({
  tamanho = 96,
  className = '',
}: {
  tamanho?: number;
  className?: string;
}) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      {/* Triangulo inscrito (ponta para cima). */}
      <path d="M50 14 L81 68 L19 68 Z" stroke="currentColor" strokeWidth="1.2" />
      {/* Tres pontos nos vertices, os tres sigilos. */}
      <circle cx="50" cy="14" r="3.2" fill="currentColor" />
      <circle cx="81" cy="68" r="3.2" fill="currentColor" />
      <circle cx="19" cy="68" r="3.2" fill="currentColor" />
      {/* Pequeno circulo no centro. */}
      <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
