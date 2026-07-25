import Link from 'next/link';
import Dica from '@/components/Dica';
import EstadoVazio from '@/components/EstadoVazio';
import { listarSetlists } from '@/lib/consultas';

export default async function PaginaSetlists() {
  const setlists = await listarSetlists();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Setlists</h1>
        <Link href="/setlists/nova" className="botao" style={{ width: 'auto' }}>Nova</Link>
      </div>

      <Dica id="setlists">
        Cria a setlist e arrasta as musicas para as ordenares. No concerto, abre o <strong>Modo palco</strong>: texto
        grande, dois dedos para dar zoom, e podes mudar o tom na hora. Podes ligar uma setlist a um evento na ficha
        do evento.
      </Dica>

      {setlists.length === 0 ? (
        <EstadoVazio
          titulo="Sem setlists"
          texto="Uma setlist e o alinhamento de musicas de um concerto. Cria uma, ordena as musicas, e abre o modo palco para tocar."
          accaoHref="/setlists/nova"
          accaoEtiqueta="Nova setlist"
        />
      ) : (
        <div className="lista-escalonada" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--e2)' }}>
        {setlists.map((s) => (
          <Link key={s.id} href={`/setlists/${s.id}`} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <strong style={{ fontSize: 16 }}>
                {s.nome}
                {s.por_defeito && <span style={{ color: 'var(--acento)', fontSize: 12, fontWeight: 400 }}>  por defeito</span>}
              </strong>
              {s.descricao && <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{s.descricao}</span>}
            </span>
            <span className="carimbo">{s.total} musicas</span>
          </Link>
        ))}
        </div>
      )}
    </section>
  );
}
