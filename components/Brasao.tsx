/* eslint-disable @next/next/no-img-element */
// Emblema dos N'ASA (o circulo com as asas, o N'ASA e as estrelas), usado no
// ecra de entrada. Usa o emblema sozinho, sem o texto lateral "Tributo Rock
// Portugues" que, escrito na vertical, parecia o logotipo rodado no telemovel.
//
// O ficheiro tem fundo preto. Com mix-blend-mode "screen" o preto fica
// transparente e sobra apenas o branco, encaixando no fundo escuro da app.
export default function Brasao({ largura = 240 }: { largura?: number }) {
  return (
    <img
      src="/logo-emblema.jpg"
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
