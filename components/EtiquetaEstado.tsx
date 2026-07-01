// Etiqueta de estado generica. Recebe o texto e a classe de cor do Tailwind
// (ex: "text-estado-ok"). A cor da borda acompanha o texto (border-current).
export default function EtiquetaEstado({
  texto,
  cor = 'text-texto-suave',
}: {
  texto: string;
  cor?: string;
}) {
  return <span className={`etiqueta ${cor}`}>{texto}</span>;
}
