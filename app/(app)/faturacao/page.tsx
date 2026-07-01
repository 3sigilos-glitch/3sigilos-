import { criarClienteServidor } from '@/lib/supabase/server';
import { euros, data as fmtData } from '@/lib/formatar';
import type { EncomendaComRelacoes } from '@/lib/tipos';
import { marcarFaturado } from './acoes';

// Faturacao pendente: encomendas ja pagas mas ainda nao faturadas.
// E a vista central, para nunca faltar uma fatura.
export default async function PaginaFaturacao() {
  const supabase = await criarClienteServidor();

  const { data: encomendas } = await supabase
    .from('encomendas')
    .select('*, cliente:clientes(id,nome,nif,tipo), desenho:desenhos(id,nome)')
    .eq('pago', true)
    .eq('faturado', false)
    .order('data', { ascending: true });

  const lista = (encomendas ?? []) as EncomendaComRelacoes[];
  const totalPendente = lista.reduce((soma, e) => soma + Number(e.total), 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl text-texto">Faturação pendente</h1>

      {/* Total pendente de faturar, em destaque. */}
      <div className="cartao flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-texto-fraco">Total por faturar</p>
          <p className="font-titulo text-3xl text-dourado">{euros(totalPendente)}</p>
        </div>
        <p className="text-sm text-texto-suave">
          {lista.length} {lista.length === 1 ? 'encomenda' : 'encomendas'}
        </p>
      </div>

      {lista.length === 0 ? (
        <p className="py-10 text-center text-texto-suave">
          Tudo faturado. Não há nada pendente.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((e) => (
            <li key={e.id} className="cartao flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-texto">
                    {e.cliente?.nome ?? 'Sem cliente'}
                  </p>
                  {e.cliente?.nif && (
                    <p className="text-sm text-texto-suave">NIF: {e.cliente.nif}</p>
                  )}
                  <p className="mt-0.5 truncate text-sm text-texto-suave">
                    {e.desenho?.nome ?? e.descricao_livre ?? 'Pedido livre'} · {e.quantidade} un.
                  </p>
                  <p className="mt-0.5 text-[12px] text-texto-fraco">
                    Paga · encomenda de {fmtData(e.data)}
                  </p>
                </div>
                <p className="shrink-0 font-titulo text-lg text-dourado">{euros(e.total)}</p>
              </div>

              <form action={marcarFaturado.bind(null, e.id)}>
                <button className="botao">Marcar como faturada</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
