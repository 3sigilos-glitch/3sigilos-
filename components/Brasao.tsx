/* eslint-disable @next/next/no-img-element */
// Brasao completo dos N'ASA (logotipo branco com asas, circulo, estrelas
// e "Tributo Rock Portugues"). Usado no ecra de entrada.
//
// O ficheiro tem fundo preto. Com mix-blend-mode "screen" o preto fica
// transparente e sobra apenas o branco, encaixando no fundo escuro da app.
export default function Brasao({ largura = 240 }: { largura?: number }) {
  return (
    <img
      src="/logo-branco.jpg"
      alt="N'ASA, tributo ao rock portugues"
      width={largura}
      style={{
        width: largura,
        height: 'auto',
        mixBlendMode: 'screen',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  );
}
