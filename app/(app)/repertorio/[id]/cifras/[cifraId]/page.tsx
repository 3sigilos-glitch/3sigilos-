import Link from 'next/link';
import { notFound } from 'next/navigation';
import EditorCifra from '@/components/cifras/EditorCifra';
import BotaoApagar from '@/components/BotaoApagar';
import { obterCifra, obterMusica } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarCifra, apagarCifra } from '../acoes';

export default async function PaginaEditarCifra({ params }: { params: Promise<{ id: string; cifraId: string }> }) {
  const { id, cifraId } = await params;
  const [cifra, musica, sessao] = await Promise.all([obterCifra(cifraId), obterMusica(id), obterSessao()]);
  if (!cifra || !musica) notFound();

  const guardar = atualizarCifra.bind(null, id, cifraId);
  const apagar = apagarCifra.bind(null, id, cifraId);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href={`/repertorio/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 26 }}>Editar cifra</h1>
      <span style={{ fontSize: 14, color: 'var(--texto-suave)', marginTop: -10 }}>{musica.musica}</span>
      <EditorCifra acao={guardar} cifra={cifra} />
      {sessao.ehAdmin && (
        <BotaoApagar acao={apagar} confirmacao={`Apagar a cifra "${cifra.nome_versao}"?`} etiqueta="Apagar cifra" />
      )}
    </section>
  );
}
