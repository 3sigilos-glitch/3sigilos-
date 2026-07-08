import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorCifra from '@/components/cifras/EditorCifra';
import { obterMusica } from '@/lib/consultas';
import { criarCifra } from '../acoes';

export default async function PaginaNovaCifra({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const musica = await obterMusica(id);
  if (!musica) notFound();
  const guardar = criarCifra.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href={`/repertorio/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 26 }}>Nova cifra</h1>
      <span style={{ fontSize: 14, color: 'var(--texto-suave)', marginTop: -10 }}>{musica.musica}</span>
      <EditorCifra acao={guardar} />
    </section>
  );
}
