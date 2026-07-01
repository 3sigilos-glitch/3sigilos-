import Link from 'next/link';
import { criarClienteServidor } from '@/lib/supabase/server';
import { euros } from '@/lib/formatar';

// Painel inicial, leve e direto: so o que importa olhar todos os dias.
export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();

  const [{ data: tshirts }, { data: encomendas }] = await Promise.all([
    supabase.from('tshirts_brancas').select('quantidade, minimo'),
    supabase.from('encomendas').select('estado, pago, faturado, total'),
  ]);

  // T-shirts em branco a repor (quantidade no minimo ou abaixo).
  const aRepor = (tshirts ?? []).filter((t) => t.quantidade <= t.minimo).length;

  const enc = encomendas ?? [];
  // Encomendas por estampar.
  const porEstampar = enc.filter((e) => e.estado === 'Por estampar').length;
  // Dinheiro a receber das que ainda nao estao pagas.
  const aReceber = enc.filter((e) => !e.pago).reduce((s, e) => s + Number(e.total), 0);
  // Pagas mas ainda por faturar.
  const porFaturar = enc.filter((e) => e.pago && !e.faturado);
  const totalPorFaturar = porFaturar.reduce((s, e) => s + Number(e.total), 0);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Painel</h1>

      <div className="grid grid-cols-2 gap-3">
        <Indicador
          href="/faturacao"
          rotulo="Pagas por faturar"
          valor={String(porFaturar.length)}
          nota={euros(totalPorFaturar)}
          destaque={porFaturar.length > 0}
        />
        <Indicador
          href="/encomendas?f=nao_pagas"
          rotulo="A receber"
          valor={euros(aReceber)}
          nota="Encomendas não pagas"
        />
        <Indicador
          href="/encomendas?f=por_estampar"
          rotulo="Por estampar"
          valor={String(porEstampar)}
          nota="Encomendas em produção"
        />
        <Indicador
          href="/stock"
          rotulo="T-shirts a repor"
          valor={String(aRepor)}
          nota="Stock no mínimo"
          alerta={aRepor > 0}
        />
      </div>

      <Link href="/encomendas/nova" className="botao">
        Registar nova encomenda
      </Link>
    </div>
  );
}

// Cartao de indicador do painel. Toca para abrir a vista respetiva.
function Indicador({
  href,
  rotulo,
  valor,
  nota,
  destaque = false,
  alerta = false,
}: {
  href: string;
  rotulo: string;
  valor: string;
  nota: string;
  destaque?: boolean;
  alerta?: boolean;
}) {
  const corValor = alerta ? 'text-estado-repor' : destaque ? 'text-dourado' : 'text-texto';
  return (
    <Link
      href={href}
      className={`cartao flex flex-col gap-1 ${alerta ? 'border-estado-repor/60' : ''}`}
    >
      <p className="text-[12px] uppercase tracking-wide text-texto-fraco">{rotulo}</p>
      <p className={`font-titulo text-2xl ${corValor}`}>{valor}</p>
      <p className="text-[12px] text-texto-suave">{nota}</p>
    </Link>
  );
}
