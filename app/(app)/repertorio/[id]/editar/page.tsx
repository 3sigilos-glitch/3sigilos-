import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioMusica from '@/components/repertorio/FormularioMusica';
import BotaoApagar from '@/components/BotaoApagar';
import { obterMusica } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarMusica, apagarMusica } from '../../acoes';

export default async function PaginaEditarMusica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [musica, sessao] = await Promise.all([obterMusica(id), obterSessao()]);
  if (!musica) notFound();
  const guardar = atualizarMusica.bind(null, id);
  const apagar = apagarMusica.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/repertorio" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Editar musica</h1>
      <FormularioMusica acao={guardar} musica={musica} />
      {sessao.ehAdmin && (
        <BotaoApagar acao={apagar} confirmacao={`Apagar "${musica.musica}" do repertorio?`} etiqueta="Apagar musica" />
      )}
    </section>
  );
}
