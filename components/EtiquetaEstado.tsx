import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

// Etiqueta de estado do evento, cada um com a sua cor propria e clara.
export default function EtiquetaEstado({ estado }: { estado: EstadoEvento }) {
  const { rotulo, corVar } = ESTADO_EVENTO[estado];
  return (
    <span className="estado" style={{ color: corVar }}>
      {rotulo}
    </span>
  );
}
