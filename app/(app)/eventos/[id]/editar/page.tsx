import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioEvento from '@/components/eventos/FormularioEvento';
import { carregarOpcoesEvento, obterEvento } from '@/lib/consultas';
import { atualizarEvento } from '../../acoes';

export default async function PaginaEditarEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evento, opcoes] = await Promise.all([obterEvento(id), carregarOpcoesEvento()]);
  if (!evento) notFound();

  // Liga a accao ao id deste evento.
  const guardar = atualizarEvento.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/eventos/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      </div>
      <h1 style={{ fontSize: 30 }}>Editar evento</h1>
      <FormularioEvento acao={guardar} evento={evento} {...opcoes} />
    </section>
  );
}
