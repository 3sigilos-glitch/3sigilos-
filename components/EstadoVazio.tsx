import Link from 'next/link';

// Estado vazio com proposito e accao: em vez de so "Sem X", explica para que
// serve a seccao e oferece o botao para criar o primeiro registo.
export default function EstadoVazio({
  titulo,
  texto,
  accaoHref,
  accaoEtiqueta,
}: {
  titulo: string;
  texto: string;
  accaoHref?: string;
  accaoEtiqueta?: string;
}) {
  return (
    <div
      className="cartao"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '28px 20px' }}
    >
      <strong style={{ fontSize: 16 }}>{titulo}</strong>
      <p style={{ color: 'var(--texto-suave)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>{texto}</p>
      {accaoHref && accaoEtiqueta && (
        <Link href={accaoHref} className="botao" style={{ width: 'auto' }}>{accaoEtiqueta}</Link>
      )}
    </div>
  );
}
