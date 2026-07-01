import LinhaStock from '@/components/stock/LinhaStock';
import FormularioNovaTshirt from '@/components/stock/FormularioNovaTshirt';
import { criarClienteServidor } from '@/lib/supabase/server';
import { TAMANHOS, type TshirtBranca } from '@/lib/tipos';

// Stock de t-shirts em branco, com o que esta a "Repor" em destaque no topo.
export default async function PaginaStock() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('tshirts_brancas').select('*');

  // Ordena por cor e depois pela ordem natural dos tamanhos (S, M, L, XL, XXL).
  const lista = ((data ?? []) as TshirtBranca[]).sort((a, b) => {
    const porCor = a.cor.localeCompare(b.cor, 'pt');
    if (porCor !== 0) return porCor;
    return TAMANHOS.indexOf(a.tamanho) - TAMANHOS.indexOf(b.tamanho);
  });

  const aRepor = lista.filter((t) => t.quantidade <= t.minimo);
  const restantes = lista.filter((t) => t.quantidade > t.minimo);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Stock de t-shirts</h1>

      <FormularioNovaTshirt />

      {lista.length === 0 ? (
        <p className="py-10 text-center text-texto-suave">
          Ainda não há stock. Adiciona a primeira cor e tamanho.
        </p>
      ) : (
        <>
          {aRepor.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm uppercase tracking-wide text-estado-repor">
                A repor ({aRepor.length})
              </h2>
              <ul className="flex flex-col gap-3">
                {aRepor.map((t) => (
                  <LinhaStock key={t.id} tshirt={t} />
                ))}
              </ul>
            </section>
          )}

          {restantes.length > 0 && (
            <section className="flex flex-col gap-3">
              {aRepor.length > 0 && (
                <h2 className="text-sm uppercase tracking-wide text-texto-suave">Em stock</h2>
              )}
              <ul className="flex flex-col gap-3">
                {restantes.map((t) => (
                  <LinhaStock key={t.id} tshirt={t} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
