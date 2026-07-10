import Link from 'next/link';
import EtiquetaEstado from '@/components/EtiquetaEstado';
import EstadoVazio from '@/components/EstadoVazio';
import { criarClienteServidor } from '@/lib/supabase/server';
import {
  CATEGORIAS_DESENHO,
  ESTADOS_DESENHO,
  COR_ESTADO_DESENHO,
  type Desenho,
} from '@/lib/tipos';

// Catalogo de desenhos, com filtros por categoria e por estado.
export default async function PaginaDesenhos({
  searchParams,
}: {
  searchParams: { cat?: string; est?: string };
}) {
  const { cat, est } = searchParams;
  const supabase = await criarClienteServidor();

  let consulta = supabase.from('desenhos').select('*').order('nome');
  if (cat) consulta = consulta.eq('categoria', cat);
  if (est) consulta = consulta.eq('estado', est);

  const { data } = await consulta;
  const lista = (data ?? []) as Desenho[];

  // Constroi um link de filtro preservando o outro filtro ativo.
  function ligacao(novo: { cat?: string; est?: string }) {
    const params = new URLSearchParams();
    const c = novo.cat ?? cat;
    const e = novo.est ?? est;
    if (c) params.set('cat', c);
    if (e) params.set('est', e);
    const qs = params.toString();
    return qs ? `/desenhos?${qs}` : '/desenhos';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-texto">Desenhos</h1>
        <Link href="/desenhos/nova" className="text-sm font-semibold text-dourado">
          Novo
        </Link>
      </div>

      {/* Filtros por categoria. */}
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip ativo={!cat} href={ligacao({ cat: '' })} texto="Todas" />
        {CATEGORIAS_DESENHO.map((c) => (
          <Chip key={c} ativo={cat === c} href={ligacao({ cat: c })} texto={c} />
        ))}
      </div>

      {/* Filtros por estado. */}
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip ativo={!est} href={ligacao({ est: '' })} texto="Qualquer estado" />
        {ESTADOS_DESENHO.map((e) => (
          <Chip key={e} ativo={est === e} href={ligacao({ est: e })} texto={e} />
        ))}
      </div>

      {lista.length === 0 ? (
        <EstadoVazio texto="Sem desenhos nesta vista. Ajusta os filtros ou cria um novo." />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((d) => (
            <li key={d.id}>
              <Link href={`/desenhos/${d.id}/editar`} className="cartao block">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-texto">{d.nome}</p>
                    <p className="text-sm text-texto-suave">{d.categoria}</p>
                    {d.descricao && (
                      <p className="mt-1 line-clamp-2 text-[13px] text-texto-fraco">{d.descricao}</p>
                    )}
                  </div>
                  <EtiquetaEstado texto={d.estado} cor={COR_ESTADO_DESENHO[d.estado]} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ ativo, href, texto }: { ativo: boolean; href: string; texto: string }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] ${
        ativo ? 'border-dourado bg-dourado-suave text-dourado' : 'border-linha text-texto-suave'
      }`}
    >
      {texto}
    </Link>
  );
}
