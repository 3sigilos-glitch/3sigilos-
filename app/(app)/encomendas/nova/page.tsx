import FormularioEncomenda from '@/components/encomendas/FormularioEncomenda';
import { criarClienteServidor } from '@/lib/supabase/server';
import { criarEncomenda } from '../acoes';
import type { Cliente, Desenho } from '@/lib/tipos';

// Pagina de registo rapido de encomenda.
export default async function PaginaNovaEncomenda() {
  const supabase = await criarClienteServidor();

  const [{ data: clientes }, { data: desenhos }, { data: stock }] = await Promise.all([
    supabase.from('clientes').select('*').order('nome'),
    supabase.from('desenhos').select('*').order('nome'),
    supabase.from('tshirts_brancas').select('cor').order('cor'),
  ]);

  // Lista de cores unicas do stock, para sugerir no campo de cor.
  const coresStock = [...new Set((stock ?? []).map((s) => s.cor))];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Nova encomenda</h1>
      <FormularioEncomenda
        clientes={(clientes ?? []) as Cliente[]}
        desenhos={(desenhos ?? []) as Desenho[]}
        coresStock={coresStock}
        acao={criarEncomenda}
      />
    </div>
  );
}
