import { notFound } from 'next/navigation';
import FormularioEncomenda from '@/components/encomendas/FormularioEncomenda';
import BotaoApagar from '@/components/BotaoApagar';
import { criarClienteServidor } from '@/lib/supabase/server';
import { atualizarEncomenda, apagarEncomenda } from '../../acoes';
import type { Cliente, Desenho, Encomenda } from '@/lib/tipos';

// Edicao de uma encomenda existente.
export default async function PaginaEditarEncomenda({ params }: { params: { id: string } }) {
  const supabase = await criarClienteServidor();

  const [{ data: encomenda }, { data: clientes }, { data: desenhos }, { data: stock }] =
    await Promise.all([
      supabase.from('encomendas').select('*').eq('id', params.id).single(),
      supabase.from('clientes').select('*').order('nome'),
      supabase.from('desenhos').select('*').order('nome'),
      supabase.from('tshirts_brancas').select('cor').order('cor'),
    ]);

  if (!encomenda) notFound();

  const coresStock = [...new Set((stock ?? []).map((s) => s.cor))];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Editar encomenda</h1>
      <FormularioEncomenda
        clientes={(clientes ?? []) as Cliente[]}
        desenhos={(desenhos ?? []) as Desenho[]}
        coresStock={coresStock}
        encomenda={encomenda as Encomenda}
        acao={atualizarEncomenda.bind(null, params.id)}
      />
      <div className="border-t border-linha pt-5">
        <BotaoApagar
          acao={apagarEncomenda.bind(null, params.id)}
          confirmacao="Apagar esta encomenda? Esta acção não se pode desfazer."
          etiqueta="Apagar encomenda"
        />
      </div>
    </div>
  );
}
