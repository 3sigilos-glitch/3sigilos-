// Logotipo em texto da 3 Sigilos. Sem imagens externas: usa a serif mistica
// dos titulos com o numero a dourado, para um arranque rapido e nitido.
export default function Marca({ tamanho = 'medio' }: { tamanho?: 'medio' | 'grande' }) {
  const grande = tamanho === 'grande';
  return (
    <span
      className={`font-titulo font-semibold tracking-[0.18em] text-texto ${
        grande ? 'text-3xl' : 'text-lg'
      }`}
    >
      <span className="text-dourado">3</span> SIGILOS
    </span>
  );
}
