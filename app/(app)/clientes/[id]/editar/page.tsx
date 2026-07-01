import { notFound } from 'next/navigation';
import FormularioCliente from '@/components/clientes/FormularioCliente';
import BotaoApagar from '@/components/BotaoApagar';
import { criarClienteServidor } from '@/lib/supabase/server';
import { atualizarCliente, apagarCliente } from '../../acoes';
import type { Cliente } from '@/lib/tipos';

// Editar um cliente existente.
export default async function PaginaEditarCliente({ params }: { params: { id: string } }) {
  const supabase = await criarClienteServidor();
  const { data: cliente } = await supabase.from('clientes').select('*').eq('id', params.id).single();

  if (!cliente) notFound();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Editar cliente</h1>
      <FormularioCliente cliente={cliente as Cliente} acao={atualizarCliente.bind(null, params.id)} />
      <div className="border-t border-linha pt-5">
        <BotaoApagar
          acao={apagarCliente.bind(null, params.id)}
          confirmacao="Apagar este cliente? As encomendas dele ficam sem cliente associado."
          etiqueta="Apagar cliente"
        />
      </div>
    </div>
  );
}
