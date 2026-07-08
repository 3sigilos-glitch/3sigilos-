import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioSetlist from '@/components/setlists/FormularioSetlist';
import BotaoApagar from '@/components/BotaoApagar';
import { obterSetlist } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarSetlist, apagarSetlist } from '../../acoes';

export default async function PaginaEditarSetlist({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [setlist, sessao] = await Promise.all([obterSetlist(id), obterSessao()]);
  if (!setlist) notFound();
  const guardar = atualizarSetlist.bind(null, id);
  const apagar = apagarSetlist.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href={`/setlists/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Editar setlist</h1>
      <FormularioSetlist acao={guardar} setlist={setlist} />
      {sessao.ehAdmin && (
        <BotaoApagar acao={apagar} confirmacao={`Apagar a setlist "${setlist.nome}"?`} etiqueta="Apagar setlist" />
      )}
    </section>
  );
}
