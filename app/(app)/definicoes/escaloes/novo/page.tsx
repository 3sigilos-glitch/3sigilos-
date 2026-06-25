import Link from 'next/link';
import { redirect } from 'next/navigation';
import FormularioEscalao from '@/components/definicoes/FormularioEscalao';
import { obterSessao } from '@/lib/sessao';
import { criarEscalao } from '../../acoes';

export default async function PaginaNovoEscalao() {
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) redirect('/painel');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/definicoes" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Novo escalao</h1>
      <FormularioEscalao acao={criarEscalao} />
    </section>
  );
}
