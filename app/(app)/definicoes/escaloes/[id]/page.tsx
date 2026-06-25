import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import FormularioEscalao from '@/components/definicoes/FormularioEscalao';
import BotaoApagar from '@/components/BotaoApagar';
import { obterEscalao } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarEscalao, apagarEscalao } from '../../acoes';

export default async function PaginaEditarEscalao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) redirect('/painel');

  const escalao = await obterEscalao(id);
  if (!escalao) notFound();
  const guardar = atualizarEscalao.bind(null, id);
  const apagar = apagarEscalao.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/definicoes" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Editar escalao</h1>
      <FormularioEscalao acao={guardar} escalao={escalao} />
      <BotaoApagar acao={apagar} confirmacao={`Apagar o escalao "${escalao.nome}"?`} etiqueta="Apagar escalao" />
    </section>
  );
}
