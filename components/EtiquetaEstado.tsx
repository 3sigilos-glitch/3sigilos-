import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

// Etiqueta de estado do evento, cada um com a sua cor propria e clara.
// Um pequeno ponto aceso (com leve brilho) reforca a leitura rapida.
export default function EtiquetaEstado({ estado }: { estado: EstadoEvento }) {
  const { rotulo, corVar } = ESTADO_EVENTO[estado];
  return (
    <span className="estado" style={{ color: corVar }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', boxShadow: '0 0 6px currentColor' }} />
      {rotulo}
    </span>
  );
}
