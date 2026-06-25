import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormularioContacto from '@/components/contactos/FormularioContacto';
import { obterContacto } from '@/lib/consultas';
import { atualizarContacto } from '../../acoes';

export default async function PaginaEditarContacto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contacto = await obterContacto(id);
  if (!contacto) notFound();
  const guardar = atualizarContacto.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href={`/contactos/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Editar contacto</h1>
      <FormularioContacto acao={guardar} contacto={contacto} />
    </section>
  );
}
