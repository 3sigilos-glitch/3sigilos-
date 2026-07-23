import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioRecibo from '@/components/recibos/FormularioRecibo';
import BotaoApagar from '@/components/BotaoApagar';
import { carregarOpcoesRecibo, obterRecibo } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { atualizarRecibo, apagarRecibo } from '../../acoes';

export default async function PaginaEditarRecibo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recibo, opcoes, sessao] = await Promise.all([obterRecibo(id), carregarOpcoesRecibo(), obterSessao()]);
  if (!recibo) notFound();
  const guardar = atualizarRecibo.bind(null, id);
  const apagar = apagarRecibo.bind(null, id);

  // Lembrete de um concerto realizado, ainda por passar: sem musico e sem valor.
  const ehLembrete = !recibo.membro_id && Number(recibo.valor ?? 0) === 0 && !recibo.passado;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/recibos" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>{ehLembrete ? 'Passar recibo' : 'Editar recibo'}</h1>
      {ehLembrete && (
        <p style={{ color: 'var(--texto-suave)', fontSize: 14, lineHeight: 1.6, marginTop: -8 }}>
          Indica quem passou o recibo, o valor e a data, e marca <strong style={{ color: 'var(--texto)' }}>Recibo ja passado</strong>.
        </p>
      )}
      <FormularioRecibo acao={guardar} recibo={recibo} eventos={opcoes.eventos} membros={opcoes.membros} />
      {sessao.ehAdmin && (
        <BotaoApagar acao={apagar} confirmacao="Apagar este recibo?" etiqueta="Apagar recibo" />
      )}
    </section>
  );
}
