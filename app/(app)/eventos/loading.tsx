import { TituloEsqueleto, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e4)' }}>
      <TituloEsqueleto />
      <ListaEsqueleto n={5} altura={96} />
    </section>
  );
}
