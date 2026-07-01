import Link from 'next/link';
import EtiquetaEstado from '@/components/EtiquetaEstado';
import { criarClienteServidor } from '@/lib/supabase/server';
import { euros, data as fmtData } from '@/lib/formatar';
import { COR_ESTADO_ENCOMENDA, type EncomendaComRelacoes } from '@/lib/tipos';
import { marcarEntregue, reverterEntrega, alternarPago } from './acoes';

// Filtros simples por estado, controlados pela query da pagina.
const FILTROS = [
  { chave: 'todas', etiqueta: 'Todas' },
  { chave: 'por_estampar', etiqueta: 'Por estampar' },
  { chave: 'entregue', etiqueta: 'Entregues' },
  { chave: 'nao_pagas', etiqueta: 'Não pagas' },
];

export default async function PaginaEncomendas({
  searchParams,
}: {
  searchParams: { f?: string };
}) {
  const filtro = searchParams.f ?? 'todas';
  const supabase = await criarClienteServidor();

  let consulta = supabase
    .from('encomendas')
    .select('*, cliente:clientes(id,nome,nif,tipo), desenho:desenhos(id,nome)')
    .order('data', { ascending: false })
    .order('criado_em', { ascending: false });

  if (filtro === 'por_estampar') consulta = consulta.eq('estado', 'Por estampar');
  else if (filtro === 'entregue') consulta = consulta.eq('estado', 'Entregue');
  else if (filtro === 'nao_pagas') consulta = consulta.eq('pago', false);

  const { data: encomendas } = await consulta;
  const lista = (encomendas ?? []) as EncomendaComRelacoes[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-texto">Encomendas</h1>
        <Link href="/encomendas/nova" className="text-sm font-semibold text-dourado">
          Nova
        </Link>
      </div>

      {/* Tira de filtros, deslizavel no telemovel. */}
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4">
        {FILTROS.map((f) => {
          const ativo = filtro === f.chave;
          return (
            <Link
              key={f.chave}
              href={f.chave === 'todas' ? '/encomendas' : `/encomendas?f=${f.chave}`}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] ${
                ativo
                  ? 'border-dourado bg-dourado-suave text-dourado'
                  : 'border-linha text-texto-suave'
              }`}
            >
              {f.etiqueta}
            </Link>
          );
        })}
      </div>

      {lista.length === 0 ? (
        <p className="py-10 text-center text-texto-suave">Sem encomendas nesta vista.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((e) => (
            <li key={e.id} className="cartao flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-texto">
                    {e.desenho?.nome ?? e.descricao_livre ?? 'Pedido livre'}
                  </p>
                  <p className="truncate text-sm text-texto-suave">
                    {e.cliente?.nome ?? 'Sem cliente'}
                    {e.cor || e.tamanho ? ` · ${[e.cor, e.tamanho].filter(Boolean).join(' ')}` : ''}
                    {` · ${e.quantidade} un.`}
                  </p>
                  <p className="mt-0.5 text-[12px] text-texto-fraco">{fmtData(e.data)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-titulo text-lg text-dourado">{euros(e.total)}</p>
                </div>
              </div>

              {/* Etiquetas de estado. */}
              <div className="flex flex-wrap gap-1.5">
                <EtiquetaEstado texto={e.estado} cor={COR_ESTADO_ENCOMENDA[e.estado]} />
                <EtiquetaEstado
                  texto={e.pago ? 'Pago' : 'Não pago'}
                  cor={e.pago ? 'text-estado-ok' : 'text-estado-repor'}
                />
                <EtiquetaEstado
                  texto={e.faturado ? 'Faturada' : 'Por faturar'}
                  cor={e.faturado ? 'text-estado-ok' : 'text-estado-info'}
                />
              </div>

              {/* Accoes rapidas. Cada uma e um pequeno formulario com server action. */}
              <div className="flex flex-wrap gap-2">
                {e.estado === 'Por estampar' ? (
                  <form action={marcarEntregue.bind(null, e.id)}>
                    <button className="rounded-pequeno border border-estado-ok px-3 py-2 text-[13px] font-semibold text-estado-ok">
                      Marcar entregue
                    </button>
                  </form>
                ) : (
                  <form action={reverterEntrega.bind(null, e.id)}>
                    <button className="rounded-pequeno border border-linha px-3 py-2 text-[13px] text-texto-suave">
                      Repor por estampar
                    </button>
                  </form>
                )}

                <form action={alternarPago.bind(null, e.id, e.pago)}>
                  <button className="rounded-pequeno border border-linha px-3 py-2 text-[13px] text-texto-suave">
                    {e.pago ? 'Marcar não pago' : 'Marcar pago'}
                  </button>
                </form>

                <Link
                  href={`/encomendas/${e.id}/editar`}
                  className="rounded-pequeno border border-linha px-3 py-2 text-[13px] text-texto-suave"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
