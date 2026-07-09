import { LinhaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e6)' }}>
      <div className="esqueleto" style={{ height: 40, width: 140, borderRadius: 'var(--raio-pequeno)' }} />
      <LinhaEsqueleto altura={150} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--e3)' }}>
        {Array.from({ length: 4 }).map((_, i) => <LinhaEsqueleto key={i} altura={92} />)}
      </div>
      <LinhaEsqueleto altura={200} />
    </section>
  );
}
