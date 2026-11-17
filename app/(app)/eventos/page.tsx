import { Suspense } from 'react';
import Link from 'next/link';
import FiltrosEventos from '@/components/eventos/FiltrosEventos';
import CartaoEvento from '@/components/eventos/CartaoEvento';
import SeccaoCalendario from '@/components/eventos/SeccaoCalendario';
import Dica from '@/components/Dica';
import EstadoVazio from '@/components/EstadoVazio';
import { listarEventos, contarArquivo } from '@/lib/consultas';
import { mesAno } from '@/lib/formatar';
import { ESTADO_EVENTO, type EstadoEvento, type Evento } from '@/lib/tipos';

// Agrupa os eventos por mes, para uma vista de agenda legivel no telemovel.
function agruparPorMes(eventos: Evento[]) {
  const grupos = new Map<string, Evento[]>();
  for (const ev of eventos) {
    const chave = ev.data ? mesAno(ev.data) : 'Sem data';
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(ev);
  }
  return Array.from(grupos.entries());
}

export default async function PaginaEventos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; mes?: string; vista?: string }>;
}) {
  const filtros = await searchParams;
  const comMes = Boolean(filtros.mes);
  const arquivo = filtros.vista === 'arquivo' && !comMes;
  const [eventos, totalArquivo] = await Promise.all([listarEventos(filtros), contarArquivo(filtros.estado)]);
  const grupos = agruparPorMes(eventos);

  // Ligacao para a outra vista, mantendo o filtro de estado.
  const ligacao = (vista: 'proximos' | 'arquivo') => {
    const p = new URLSearchParams();
    if (filtros.estado) p.set('estado', filtros.estado);
    if (vista === 'arquivo') p.set('vista', 'arquivo');
    const q = p.toString();
    return q ? `/eventos?${q}` : '/eventos';
  };
  const estadoRotulo = filtros.estado ? ESTADO_EVENTO[filtros.estado as EstadoEvento]?.rotulo : undefined;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="t-titulo" style={{ fontSize: 30 }}>Agenda</h1>
        <Link href="/eventos/novo" className="botao" style={{ width: 'auto' }}>
          Novo
        </Link>
      </div>

      <Dica id="eventos">
        Toca em <strong>Novo</strong> para marcar um evento. Vai mudando o estado: <strong>orcamentado</strong> quando
        envias a proposta, <strong>confirmado</strong> quando fecha a data, e <strong>realizado</strong> depois do
        concerto (fica logo um lembrete de recibo). Se marcares dois eventos no mesmo dia, a app avisa. O que
        escreverem no <strong>calendario Google</strong> aparece aqui: concertos novos para importar com um toque e as
        indisponibilidades de cada um (escrevam o nome e <strong>indisponivel</strong> no titulo). Os eventos que ja
        passaram vao sozinhos para o <strong>Arquivo</strong>.
      </Dica>

      {/* Proximos | Arquivo. Com um mes escolhido, mostra esse mes inteiro. */}
      {!comMes && (
        <nav aria-label="Vista da agenda" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, borderRadius: 999, border: '1px solid var(--linha)', background: 'var(--superficie)' }}>
          <Separador href={ligacao('proximos')} ativo={!arquivo} etiqueta="Proximos" />
          <Separador href={ligacao('arquivo')} ativo={arquivo} etiqueta={`Arquivo${totalArquivo > 0 ? ` (${totalArquivo})` : ''}`} />
        </nav>
      )}

      {/* Calendario Google: so nos proximos. Carrega a parte, sem atrasar a
          agenda. Se nao estiver ligado ou falhar, nao aparece nada. */}
      {!arquivo && !comMes && (
        <Suspense fallback={null}>
          <SeccaoCalendario />
        </Suspense>
      )}

      <Suspense>
        <FiltrosEventos />
      </Suspense>

      {eventos.length === 0 ? (
        arquivo ? (
          <EstadoVazio
            titulo="Arquivo vazio"
            texto={estadoRotulo ? `Sem eventos passados com o estado ${estadoRotulo}.` : 'Ainda nao ha eventos passados. Depois de cada concerto, ele passa para aqui sozinho.'}
          />
        ) : comMes ? (
          <EstadoVazio titulo="Sem eventos neste mes" texto="Escolhe outro mes ou limpa o filtro do mes." />
        ) : estadoRotulo ? (
          <EstadoVazio
            titulo="Nada nos proximos"
            texto={`Nao ha eventos ${estadoRotulo.toLowerCase()} daqui para a frente. Os que ja passaram estao no Arquivo.`}
            accaoHref={ligacao('arquivo')}
            accaoEtiqueta="Ver no Arquivo"
          />
        ) : (
          <EstadoVazio
            titulo="Sem eventos marcados"
            texto="A agenda guarda concertos e propostas: data, local, contratante, valor e avisos de conflito de datas. Os eventos que ja passaram estao no Arquivo."
            accaoHref="/eventos/novo"
            accaoEtiqueta="Marcar evento"
          />
        )
      ) : (
        grupos.map(([mes, lista]) => (
          <div key={mes} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 className="rotulo-seccao">{mes}</h2>
            <div className="lista-escalonada" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lista.map((ev) => (
                <CartaoEvento key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function Separador({ href, ativo, etiqueta }: { href: string; ativo: boolean; etiqueta: string }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        borderRadius: 999,
        fontSize: 14,
        fontWeight: ativo ? 700 : 500,
        color: ativo ? 'var(--texto)' : 'var(--texto-suave)',
        background: ativo ? 'var(--acento-suave)' : 'transparent',
        border: `1px solid ${ativo ? 'var(--acento)' : 'transparent'}`,
      }}
    >
      {etiqueta}
    </Link>
  );
}
