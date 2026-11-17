import Link from 'next/link';
import BotaoImportarCalendario from '@/components/eventos/BotaoImportarCalendario';
import { importarDoCalendario } from '@/app/(app)/eventos/acoes';
import { obterResumoCalendario, indisponiveisEm, sincronizarComCalendario, linkNoCalendario, type ResultadoSincronizacao } from '@/lib/calendarioDados';
import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';
import { intervaloCurto, nomesIndisponiveis, type ConcertoCalendario, type Indisponibilidade } from '@/lib/calendario';
import { euros } from '@/lib/formatar';

// Quantos concertos por importar ficam a vista antes do "ver mais".
const VISIVEIS = 3;

// Bloco da Agenda com o que vem do calendario Google dos N'ASA:
//   1. concertos marcados em dias em que alguem esta indisponivel;
//   2. concertos escritos no calendario que ainda nao estao na app;
//   3. as proximas indisponibilidades.
// Se o calendario nao estiver ligado (ou falhar), nao mostra nada.
export default async function SeccaoCalendario() {
  let resumo;
  let sinc: ResultadoSincronizacao;
  try {
    // Primeiro aplica o que o calendario diz (estados), depois faz o resumo.
    sinc = await sincronizarComCalendario();
    resumo = await obterResumoCalendario();
  } catch {
    return null;
  }
  if (resumo.estado !== 'ligado') return null;

  const { hoje, proximas, conflitos, cruzamento } = resumo;
  const provaveis = cruzamento.novos.filter((c) => c.provavel);
  const outras = cruzamento.novos.filter((c) => !c.provavel);
  const porImportar = provaveis.length + cruzamento.mesmoDia.length;
  const avisos = sinc.mudouDia.length + sinc.desapareceu.length;
  const nada =
    conflitos.length === 0 && porImportar === 0 && outras.length === 0 && proximas.length === 0 &&
    sinc.alterados.length === 0 && avisos === 0;
  if (nada) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {sinc.alterados.length > 0 && (
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderColor: 'var(--estado-pre-reserva)', background: 'rgba(74, 155, 216, 0.08)' }}>
          <strong style={{ fontSize: 13, color: 'var(--estado-pre-reserva)' }}>Atualizado agora pelo calendario</strong>
          {sinc.alterados.map((m) => (
            <Link key={m.eventoId} href={`/eventos/${m.eventoId}`} style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong>{m.evento}</strong>: {rotuloEstado(m.de)} {'->'} <strong style={{ color: ESTADO_EVENTO[m.para].corVar }}>{rotuloEstado(m.para)}</strong>
            </Link>
          ))}
          <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>Fica registado nas notas de cada evento.</span>
        </div>
      )}

      {avisos > 0 && (
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderColor: 'var(--estado-orcamentado)', background: 'rgba(216, 155, 44, 0.08)' }}>
          <strong style={{ fontSize: 13, color: 'var(--estado-orcamentado)' }}>Verificar: o calendario nao bate certo</strong>
          {sinc.mudouDia.map((m) => (
            <Link key={m.eventoId} href={`/eventos/${m.eventoId}`} style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong>{m.evento}</strong>: na app a {intervaloCurto(m.diaApp, m.diaApp, hoje)}, no calendario a{' '}
              {intervaloCurto(m.diaCalendario, m.diaCalendario, hoje)}
            </Link>
          ))}
          {sinc.desapareceu.map((m) => (
            <Link key={m.eventoId} href={`/eventos/${m.eventoId}`} style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong>{m.evento}</strong> ({intervaloCurto(m.dia, m.dia, hoje)}): ja nao esta no calendario
            </Link>
          ))}
          <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>A app nao muda datas nem cancela por isto. Abre o evento e corrige se for preciso.</span>
        </div>
      )}

      {conflitos.length > 0 && (
        <div
          className="cartao"
          style={{ display: 'flex', flexDirection: 'column', gap: 8, borderColor: 'var(--estado-recusado)', background: 'rgba(216, 81, 74, 0.08)' }}
        >
          <strong style={{ fontSize: 13, color: 'var(--estado-recusado)' }}>
            Atencao: concertos em dias com alguem indisponivel
          </strong>
          {conflitos.map((c) => (
            <Link key={c.eventoId} href={`/eventos/${c.eventoId}`} style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong>{c.evento}</strong>
              <span style={{ color: 'var(--texto-suave)' }}> ({intervaloCurto(c.dia, c.dia, hoje)}): </span>
              {c.nomes.join(', ')}
            </Link>
          ))}
        </div>
      )}

      {(porImportar > 0 || outras.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="rotulo-seccao">No calendario, por importar ({porImportar})</h2>

          {/* Os mais proximos a vista; o resto recolhido, para nao empurrar a agenda. */}
          {provaveis.slice(0, VISIVEIS).map((c) => (
            <CartaoConcerto key={c.uid} concerto={c} hoje={hoje} indisponiveis={nomesIndisponiveis(proximas, c.dia)} />
          ))}
          {provaveis.length > VISIVEIS && (
            <details>
              <summary style={{ fontSize: 13, color: 'var(--acento-forte)', cursor: 'pointer', minHeight: 32 }}>
                Ver mais {provaveis.length - VISIVEIS} do calendario
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {provaveis.slice(VISIVEIS).map((c) => (
                  <CartaoConcerto key={c.uid} concerto={c} hoje={hoje} indisponiveis={nomesIndisponiveis(proximas, c.dia)} />
                ))}
              </div>
            </details>
          )}

          {cruzamento.mesmoDia.map(({ concerto, existente }) => (
            <div key={concerto.uid} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderColor: 'var(--estado-orcamentado)' }}>
              <Detalhes concerto={concerto} hoje={hoje} indisponiveis={nomesIndisponiveis(proximas, concerto.dia)} />
              <span style={{ fontSize: 13, color: 'var(--estado-orcamentado)', lineHeight: 1.5 }}>
                Nesse dia ja tens na agenda: <Link href={`/eventos/${existente.id}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>{existente.evento}</Link>.
                Se for o mesmo concerto, nao importes.
              </span>
              <BotaoImportarCalendario
                acao={importarDoCalendario.bind(null, concerto.uid, true)}
                etiqueta="E outro concerto, importar"
                secundario
                confirmacao={`Ja existe "${existente.evento}" nesse dia. Importar "${concerto.nome}" como um concerto diferente?`}
              />
            </div>
          ))}

          {outras.length > 0 && (
            <details>
              <summary style={{ fontSize: 13, color: 'var(--texto-suave)', cursor: 'pointer', minHeight: 32 }}>
                Outras entradas do calendario ({outras.length}), que nao parecem concertos
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {outras.map((c) => (
                  <CartaoConcerto key={c.uid} concerto={c} hoje={hoje} indisponiveis={nomesIndisponiveis(proximas, c.dia)} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {proximas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <h2 className="rotulo-seccao">Indisponibilidades</h2>
            <span style={{ display: 'flex', gap: 14 }}>
              <Link href="/disponibilidade?marcar=1#marcar" style={{ fontSize: 13, color: 'var(--acento-forte)' }}>
                + Marcar
              </Link>
              <Link href="/disponibilidade" style={{ fontSize: 13, color: 'var(--acento-forte)' }}>
                Ver todas ({proximas.length})
              </Link>
            </span>
          </div>
          <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proximas.slice(0, 5).map((i) => (
              <LinhaIndisponibilidade key={i.uid} item={i} hoje={hoje} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detalhes({ concerto, hoje, indisponiveis = [] }: { concerto: ConcertoCalendario; hoje: string; indisponiveis?: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
      <strong style={{ fontSize: 15 }}>{concerto.nome}</strong>
      <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
        {intervaloCurto(concerto.dia, concerto.dia, hoje)}
        {concerto.hora ? `, ${concerto.hora}` : ''}
        {concerto.valor > 0 ? `  |  ${euros(concerto.valor)}` : ''}
      </span>
      {concerto.titulo !== concerto.nome && (
        <span style={{ fontSize: 12, color: 'var(--texto-fraco)', overflowWrap: 'anywhere' }}>
          No calendario: {concerto.titulo}
        </span>
      )}
      {/* So um aviso: nao impede a importacao (quem marcou pode ja ter aceitado o concerto). */}
      {indisponiveis.length > 0 && (
        <span style={{ fontSize: 12, color: 'var(--estado-recusado)' }}>
          Indisponivel nesse dia: {indisponiveis.join(', ')}
        </span>
      )}
    </div>
  );
}

function CartaoConcerto({ concerto, hoje, indisponiveis }: { concerto: ConcertoCalendario; hoje: string; indisponiveis?: string[] }) {
  return (
    <div className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderColor: 'var(--linha-quente)' }}>
      <Detalhes concerto={concerto} hoje={hoje} indisponiveis={indisponiveis} />
      <BotaoImportarCalendario acao={importarDoCalendario.bind(null, concerto.uid, false)} />
    </div>
  );
}

// Uma indisponibilidade. Toca para a abrir no Google Calendar (alterar ou apagar).
export function LinhaIndisponibilidade({ item, hoje }: { item: Indisponibilidade; hoje: string }) {
  const nomes = item.membros.map((m) => m.nome).join(' e ');
  const decorre = item.de <= hoje;
  const href = linkNoCalendario(item.uid);
  const conteudo = (
    <>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <strong>{nomes || 'Por identificar'}</strong>
        <span style={{ fontSize: 12, color: 'var(--texto-fraco)', overflowWrap: 'anywhere' }}>{item.titulo}</span>
      </span>
      <span style={{ color: decorre ? 'var(--estado-recusado)' : 'var(--texto-suave)', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {decorre && item.de !== item.ate ? `ate ${intervaloCurto(item.ate, item.ate, hoje)}` : intervaloCurto(item.de, item.ate, hoje)}
        {href && (
          <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ alignSelf: 'center', opacity: 0.7 }}>
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
        )}
      </span>
    </>
  );
  const estilo = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, fontSize: 14 } as const;
  if (!href) return <div style={estilo}>{conteudo}</div>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title="Abrir no Google Calendar" style={{ ...estilo, color: 'inherit' }}>
      {conteudo}
    </a>
  );
}

// Aviso na ficha de um evento: quem esta indisponivel nesse dia.
export async function AvisoIndisponiveis({ dia }: { dia: string | null }) {
  let nomes: string[] = [];
  try {
    nomes = await indisponiveisEm(dia);
  } catch {
    return null;
  }
  if (nomes.length === 0) return null;
  return (
    <div
      className="cartao"
      style={{ display: 'flex', flexDirection: 'column', gap: 4, borderColor: 'var(--estado-recusado)', background: 'rgba(216, 81, 74, 0.08)' }}
    >
      <strong style={{ fontSize: 13, color: 'var(--estado-recusado)' }}>Indisponivel neste dia (calendario)</strong>
      <span style={{ fontSize: 14 }}>{nomes.join(', ')}</span>
    </div>
  );
}

function rotuloEstado(estado: string): string {
  return ESTADO_EVENTO[estado as EstadoEvento]?.rotulo ?? estado;
}
