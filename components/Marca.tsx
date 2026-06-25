// Marca dos N'ASA.
//
// Por agora desenha o nome em tipografia condensada (branco sobre fundo escuro),
// para a app ja ter cara propria. Quando colocares o logotipo verdadeiro,
// substitui o conteudo por uma imagem:
//
//   import Image from 'next/image';
//   <Image src="/logo-branco.svg" alt="N'ASA" width={120} height={40} priority />
//
// Coloca o ficheiro logo_branco (convertido para SVG ou PNG) em public/logo-branco.svg.

export default function Marca({ tamanho = 'medio' }: { tamanho?: 'medio' | 'grande' }) {
  const fontSize = tamanho === 'grande' ? 56 : 28;

  return (
    <span
      className="titulo"
      style={{
        fontFamily: 'var(--fonte-titulo)',
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.06em',
        color: 'var(--texto)',
        lineHeight: 1,
        display: 'inline-block',
      }}
      aria-label="N'ASA"
    >
      N
      <span style={{ color: 'var(--acento)' }}>&apos;</span>
      ASA
    </span>
  );
}
