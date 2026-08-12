import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

// Etiqueta de estado do evento, cada um com a sua cor propria e clara.
// Um pequeno ponto aceso (com leve brilho) reforca a leitura rapida.
export default function EtiquetaEstado({ estado }: { estado: EstadoEvento }) {
  // Tolera um estado que o codigo ainda nao conheca, em vez de deitar a pagina
  // abaixo: mostra-o tal e qual.
  const { rotulo, corVar } = ESTADO_EVENTO[estado] ?? {
    rotulo: String(estado ?? 'Sem estado'),
    corVar: 'var(--texto-suave)',
  };
  return (
    <span className="estado" style={{ color: corVar }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', boxShadow: '0 0 6px currentColor' }} />
      {rotulo}
    </span>
  );
}
