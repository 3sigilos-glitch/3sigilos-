import Link from 'next/link';
import { redirect } from 'next/navigation';
import FormularioMembro from '@/components/equipa/FormularioMembro';
import { obterSessao } from '@/lib/sessao';
import { criarMembro } from '../acoes';

export default async function PaginaNovoMembro() {
  // Reservado ao admin (o RLS tambem bloqueia, isto e so para a navegacao).
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) redirect('/equipa');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/equipa" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Novo elemento</h1>
      <FormularioMembro acao={criarMembro} />
    </section>
  );
}
