// Blocos de esqueleto para os ecras de carregamento, em vez de saltos brancos.

export function LinhaEsqueleto({ altura = 76 }: { altura?: number }) {
  return <div className="esqueleto" style={{ height: altura }} />;
}

// Lista de cartoes fantasma, para as paginas de lista.
export function ListaEsqueleto({ n = 4, altura = 76 }: { n?: number; altura?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e3)' }}>
      {Array.from({ length: n }).map((_, i) => (
        <LinhaEsqueleto key={i} altura={altura} />
      ))}
    </div>
  );
}

// Cabecalho fantasma (titulo e um botao).
export function TituloEsqueleto() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="esqueleto" style={{ height: 34, width: 160, borderRadius: 'var(--raio-pequeno)' }} />
      <div className="esqueleto" style={{ height: 40, width: 84, borderRadius: 'var(--raio-pequeno)' }} />
    </div>
  );
}
