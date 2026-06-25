import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import FormularioMembro from '@/components/equipa/FormularioMembro';
import BotaoApagar from '@/components/BotaoApagar';
import { obterMembro } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarMembro, apagarMembro } from '../../acoes';

export default async function PaginaEditarMembro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) redirect('/equipa');

  const membro = await obterMembro(id);
  if (!membro) notFound();
  const guardar = atualizarMembro.bind(null, id);
  const apagar = apagarMembro.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/equipa" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Editar elemento</h1>
      <FormularioMembro acao={guardar} membro={membro} />
      <BotaoApagar acao={apagar} confirmacao={`Apagar "${membro.nome}" da equipa?`} etiqueta="Apagar elemento" />
    </section>
  );
}
