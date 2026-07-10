// Estado vazio com o emblema da marca esbatido, para as listas sem itens.
export default function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/emblema-3sigilos.png"
        alt=""
        width={64}
        height={64}
        className="w-16 select-none opacity-20"
      />
      <p className="max-w-xs text-sm text-texto-suave">{texto}</p>
    </div>
  );
}
