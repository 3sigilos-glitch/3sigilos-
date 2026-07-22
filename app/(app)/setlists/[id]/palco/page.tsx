import { notFound } from 'next/navigation';
import ModoPalco, { type MusicaPalco } from '@/components/palco/ModoPalco';
import { obterSetlist, obterPreferenciasCifra } from '@/lib/consultas';

// O modo palco cobre o ecra todo, por isso desativa a cache e le sempre fresco.
export const dynamic = 'force-dynamic';

export default async function PaginaPalco({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { id } = await params;
  const { i } = await searchParams;
  const [setlist, preferencias] = await Promise.all([obterSetlist(id), obterPreferenciasCifra()]);
  if (!setlist) notFound();

  const musicas: MusicaPalco[] = setlist.itens.map((item) => ({
    titulo: item.musica?.musica ?? 'Sem musica',
    artista: item.musica?.artista_original ?? null,
    nota: item.nota_rapida,
    tom: item.cifra?.tom ?? item.musica?.tom ?? null,
    conteudo: item.cifra?.conteudo ?? null,
  }));

  return (
    <ModoPalco
      setlistId={id}
      nomeSetlist={setlist.nome}
      musicas={musicas}
      inicio={Number(i) || 0}
      preferencias={preferencias}
    />
  );
}
