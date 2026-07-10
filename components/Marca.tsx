// Emblema da 3 Sigilos (o monograma no circulo), o logotipo oficial da marca.
// Usado no cabecalho e onde e preciso a marca de forma compacta.
export default function Marca({ tamanho = 'medio' }: { tamanho?: 'medio' | 'grande' }) {
  const px = tamanho === 'grande' ? 88 : 34;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/emblema-3sigilos.png"
      alt="3 Sigilos"
      width={px}
      height={px}
      style={{ width: px, height: px }}
      className="select-none"
    />
  );
}
