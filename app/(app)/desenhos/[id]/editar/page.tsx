import { notFound } from 'next/navigation';
import FormularioDesenho from '@/components/desenhos/FormularioDesenho';
import BotaoApagar from '@/components/BotaoApagar';
import { criarClienteServidor } from '@/lib/supabase/server';
import { atualizarDesenho, apagarDesenho } from '../../acoes';
import type { Desenho } from '@/lib/tipos';

// Editar um desenho existente.
export default async function PaginaEditarDesenho({ params }: { params: { id: string } }) {
  const supabase = await criarClienteServidor();
  const { data: desenho } = await supabase.from('desenhos').select('*').eq('id', params.id).single();

  if (!desenho) notFound();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Editar desenho</h1>
      <FormularioDesenho desenho={desenho as Desenho} acao={atualizarDesenho.bind(null, params.id)} />
      <div className="border-t border-linha pt-5">
        <BotaoApagar
          acao={apagarDesenho.bind(null, params.id)}
          confirmacao="Apagar este desenho do catálogo?"
          etiqueta="Apagar desenho"
        />
      </div>
    </div>
  );
}
