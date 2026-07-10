import Sigilo from '@/components/Sigilo';

// Estado vazio com o selo da marca em marca de agua, para as listas sem itens.
export default function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <Sigilo tamanho={64} className="text-dourado opacity-25" />
      <p className="max-w-xs text-sm text-texto-suave">{texto}</p>
    </div>
  );
}
