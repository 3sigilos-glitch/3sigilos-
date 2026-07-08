import Link from 'next/link';
import { notFound } from 'next/navigation';
import GestorMusicas from '@/components/setlists/GestorMusicas';
import { obterSetlist, listarRepertorio, cifrasPorMusicas } from '@/lib/consultas';

export default async function PaginaSetlist({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const setlist = await obterSetlist(id);
  if (!setlist) notFound();

  const idsMusicas = setlist.itens.map((i) => i.musica?.id).filter(Boolean) as string[];
  const [cifras, repertorio] = await Promise.all([
    cifrasPorMusicas(idsMusicas),
    listarRepertorio({ ativo: 'sim' }),
  ]);
  const musicasDisponiveis = repertorio.map((m) => ({ id: m.id, musica: m.musica, artista_original: m.artista_original }));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/setlists" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {setlist.itens.length > 0 && (
            <Link href={`/setlists/${id}/palco`} className="botao" style={{ width: 'auto' }}>Modo palco</Link>
          )}
          <Link href={`/setlists/${id}/editar`} className="botao botao-secundario" style={{ width: 'auto' }}>Editar</Link>
        </div>
      </div>

      <div>
        <h1 style={{ fontSize: 28 }}>
          {setlist.nome}
          {setlist.por_defeito && <span style={{ color: 'var(--acento)', fontSize: 13, fontWeight: 400 }}>  por defeito</span>}
        </h1>
        {setlist.descricao && <span style={{ fontSize: 14, color: 'var(--texto-suave)' }}>{setlist.descricao}</span>}
      </div>

      <p style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>
        Arrasta pela pega para reordenar, ou usa as setas. Toca numa musica para a nota rapida e a versao da cifra.
      </p>

      <GestorMusicas
        setlistId={id}
        itens={setlist.itens}
        cifrasPorMusica={cifras}
        musicasDisponiveis={musicasDisponiveis}
      />
    </section>
  );
}
