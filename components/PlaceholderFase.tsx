// Conteudo provisorio para as seccoes que chegam em fases seguintes.
// Mantem a app navegavel e honesta sobre o que ainda esta por construir.
export default function PlaceholderFase({
  titulo,
  fase,
  descricao,
}: {
  titulo: string;
  fase: string;
  descricao: string;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 30 }}>{titulo}</h1>
      <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="estado" style={{ color: 'var(--estado-orcamentado)', alignSelf: 'flex-start' }}>
          {fase}
        </span>
        <p style={{ color: 'var(--texto-suave)', lineHeight: 1.6, fontSize: 15 }}>{descricao}</p>
      </div>
    </section>
  );
}
