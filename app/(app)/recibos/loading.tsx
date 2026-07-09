import { TituloEsqueleto, LinhaEsqueleto, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e4)' }}>
      <TituloEsqueleto />
      <LinhaEsqueleto altura={64} />
      <ListaEsqueleto n={3} />
    </section>
  );
}
