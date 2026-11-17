// Ligacao ao calendario Google dos N'ASA, do lado do servidor.
//
// A app le o calendario pelo "endereco secreto em formato iCal" (so leitura),
// guardado na variavel de ambiente CALENDARIO_ICAL_URL. Nunca escreve nada no
// calendario: o calendario e a fonte da verdade.
//
// REGRA DE OURO: nada aqui pode deitar a app abaixo. Sem a variavel, com o
// calendario em baixo ou com um iCal estragado, tudo devolve "vazio" e as
// paginas continuam a funcionar como se o calendario nao existisse.
import { cache } from 'react';
import { criarClienteServidor } from '@/lib/supabase/server';
import {
  lerIcs,
  extrairIndisponibilidades,
  extrairConcertos,
  cruzarComAgenda,
  hojeEmPortugal,
  somarDias,
  diaDoEvento,
  nomesIndisponiveis,
  planearSincronizacao,
  intervaloCurto,
  idDoCalendarioIcal,
  linkEventoGoogle,
  type PlanoSincronizacao,
  type MudancaEstado,
  type EntradaCalendario,
  type Indisponibilidade,
  type Cruzamento,
  type EventoApp,
  type MembroRef,
} from '@/lib/calendario';
import { ESTADO_EVENTO, type EstadoEvento } from '@/lib/tipos';

export type EstadoCalendario = 'desligado' | 'ligado' | 'erro';

function enderecoIcal(): string | null {
  const url = (process.env.CALENDARIO_ICAL_URL ?? '').trim();
  if (!url) return null;
  // So https (ou http em localhost, para testes).
  if (/^https:\/\//i.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)[:/]/i.test(url)) return url;
  return null;
}

export function calendarioConfigurado(): boolean {
  return enderecoIcal() !== null;
}

// Identificador do calendario (o email do calendario), para os links do Google
// Calendar. Nunca devolve a parte secreta do endereco iCal.
export function idDoCalendario(): string | null {
  return idDoCalendarioIcal(enderecoIcal());
}

// Link para abrir uma entrada do calendario no Google Calendar (ver, alterar,
// apagar). null se nao for possivel montar.
export function linkNoCalendario(uid: string): string | null {
  return linkEventoGoogle(uid, idDoCalendario());
}

// Le o calendario. Guardado em cache 5 minutos, para a app nao ir ao Google a
// cada clique; por isso uma alteracao no calendario aparece em poucos minutos.
const carregarEntradas = cache(async (): Promise<{ estado: EstadoCalendario; entradas: EntradaCalendario[] }> => {
  const url = enderecoIcal();
  if (!url) return { estado: 'desligado', entradas: [] };
  try {
    const resposta = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
      headers: { Accept: 'text/calendar, text/plain, */*' },
    });
    if (!resposta.ok) return { estado: 'erro', entradas: [] };
    const texto = await resposta.text();
    if (!texto.includes('BEGIN:VCALENDAR')) return { estado: 'erro', entradas: [] };
    return { estado: 'ligado', entradas: lerIcs(texto) };
  } catch {
    return { estado: 'erro', entradas: [] };
  }
});

async function listarEquipaAtiva(): Promise<{ todos: MembroRef[]; tecnicos: MembroRef[] }> {
  try {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.from('equipa').select('id, nome, papel').eq('ativo', true);
    const lista = (data as { id: string; nome: string; papel: string }[]) ?? [];
    return {
      todos: lista.map(({ id, nome }) => ({ id, nome })),
      tecnicos: lista.filter((e) => e.papel === 'tecnico').map(({ id, nome }) => ({ id, nome })),
    };
  } catch {
    return { todos: [], tecnicos: [] };
  }
}

// Equipa ativa (musicos e tecnicos), para escolher de quem e a indisponibilidade.
export async function obterEquipaAtiva(): Promise<MembroRef[]> {
  return (await listarEquipaAtiva()).todos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
}

// O elemento da equipa ligado ao login atual (para vir ja escolhido), ou null.
export async function obterMeuMembroId(): Promise<string | null> {
  try {
    const supabase = await criarClienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('perfis').select('equipa_id').eq('id', user.id).maybeSingle();
    return (data as { equipa_id: string | null } | null)?.equipa_id ?? null;
  } catch {
    return null;
  }
}

// Indisponibilidades escritas no calendario (todas, passadas e futuras).
export const obterIndisponibilidades = cache(
  async (): Promise<{ estado: EstadoCalendario; lista: Indisponibilidade[] }> => {
    try {
      const { estado, entradas } = await carregarEntradas();
      if (estado !== 'ligado') return { estado, lista: [] };
      const { todos } = await listarEquipaAtiva();
      return { estado, lista: extrairIndisponibilidades(entradas, todos) };
    } catch {
      return { estado: 'erro', lista: [] };
    }
  }
);

// Quem esta indisponivel num dia (AAAA-MM-DD). Lista vazia se nao houver
// ninguem, ou se o calendario nao estiver ligado.
export async function indisponiveisEm(dia: string | null): Promise<string[]> {
  if (!dia) return [];
  try {
    const { lista } = await obterIndisponibilidades();
    return nomesIndisponiveis(lista, dia);
  } catch {
    return [];
  }
}

export interface ConflitoDisponibilidade {
  eventoId: string;
  evento: string;
  dia: string;
  nomes: string[];
}

export interface ResumoCalendario {
  estado: EstadoCalendario;
  hoje: string;
  proximas: Indisponibilidade[]; // indisponibilidades de hoje em diante
  conflitos: ConflitoDisponibilidade[]; // concertos marcados com alguem indisponivel
  cruzamento: Cruzamento; // concertos do calendario comparados com a agenda
}

const CRUZAMENTO_VAZIO: Cruzamento = { novos: [], mesmoDia: [], jaNaAgenda: 0 };

// Eventos da app de ha poucos dias em diante (mais os ja ligados ao calendario),
// para comparar com o calendario.
async function eventosParaComparar(hoje: string, uids: string[]): Promise<EventoApp[]> {
  const supabase = await criarClienteServidor();
  const colunas = 'id, evento, local, concelho, data, estado, calendar_event_id';
  const { data: futuros, error } = await supabase
    .from('eventos')
    .select(colunas)
    .gte('data', somarDias(hoje, -3));
  // Se nao se consegue ler a agenda, nao se sugere nada (para nunca duplicar).
  if (error) throw new Error(error.message);

  const mapa = new Map<string, EventoApp>();
  for (const e of (futuros as EventoApp[]) ?? []) mapa.set(e.id, e);

  for (let i = 0; i < uids.length; i += 50) {
    const { data: ligados } = await supabase
      .from('eventos')
      .select(colunas)
      .in('calendar_event_id', uids.slice(i, i + 50));
    for (const e of (ligados as EventoApp[]) ?? []) mapa.set(e.id, e);
  }
  return Array.from(mapa.values());
}

export async function obterResumoCalendario(): Promise<ResumoCalendario> {
  const hoje = hojeEmPortugal();
  const vazio: ResumoCalendario = { estado: 'desligado', hoje, proximas: [], conflitos: [], cruzamento: CRUZAMENTO_VAZIO };
  try {
    const { estado, entradas } = await carregarEntradas();
    if (estado !== 'ligado') return { ...vazio, estado };

    const { lista } = await obterIndisponibilidades();
    const proximas = lista.filter((i) => i.ate >= hoje);

    // So concertos de hoje em diante: os passados ja foram tratados na app.
    const concertos = extrairConcertos(entradas).filter((c) => c.dia >= hoje);
    const eventos = await eventosParaComparar(hoje, concertos.map((c) => c.uid));
    const cruzamento = cruzarComAgenda(concertos, eventos);

    // Concertos por acontecer em dias em que alguem esta indisponivel.
    const conflitos: ConflitoDisponibilidade[] = [];
    for (const e of eventos) {
      if (!['orcamentado', 'pre_reserva', 'confirmado'].includes(e.estado)) continue;
      const dia = diaDoEvento(e.data);
      if (!dia || dia < hoje) continue;
      const nomes = nomesIndisponiveis(lista, dia);
      if (nomes.length > 0) conflitos.push({ eventoId: e.id, evento: e.evento, dia, nomes });
    }
    conflitos.sort((a, b) => a.dia.localeCompare(b.dia));

    return { estado, hoje, proximas, conflitos, cruzamento };
  } catch {
    return { ...vazio, estado: 'erro' };
  }
}

// Para a importacao: a entrada do calendario (concerto) com este identificador.
export async function obterConcertoDoCalendario(uid: string) {
  const { estado, entradas } = await carregarEntradas();
  if (estado !== 'ligado') return null;
  return extrairConcertos(entradas).find((c) => c.uid === uid) ?? null;
}

export async function obterTecnicos(): Promise<MembroRef[]> {
  return (await listarEquipaAtiva()).tecnicos;
}

// ---------------------------------------------------------------------------
// Sincronizacao automatica (ver planearSincronizacao em lib/calendario).
// Corre sempre que alguem abre a Agenda ou o Painel, e uma vez por dia pela
// rotina automatica. Pode correr varias vezes sem mal: cada alteracao so e
// gravada se o evento ainda estiver como estava quando se decidiu mudar.
// ---------------------------------------------------------------------------

// Basta um cliente do Supabase com "from" (o da sessao ou o de servico).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClienteBd = { from: (tabela: string) => any };

export interface ResultadoSincronizacao {
  estado: EstadoCalendario;
  ligados: number;
  alterados: MudancaEstado[]; // estados efetivamente mudados nesta passagem
  mudouDia: PlanoSincronizacao['mudouDia'];
  desapareceu: PlanoSincronizacao['desapareceu'];
}

const SEM_SINCRONIZACAO: ResultadoSincronizacao = { estado: 'desligado', ligados: 0, alterados: [], mudouDia: [], desapareceu: [] };

const rotulo = (estado: string) => ESTADO_EVENTO[estado as EstadoEvento]?.rotulo ?? estado;

export async function sincronizarComCalendario(cliente?: ClienteBd): Promise<ResultadoSincronizacao> {
  try {
    const { estado, entradas } = await carregarEntradas();
    if (estado !== 'ligado') return { ...SEM_SINCRONIZACAO, estado };

    const bd: ClienteBd = cliente ?? (await criarClienteServidor());
    const hoje = hojeEmPortugal();
    const { data, error } = await bd
      .from('eventos')
      .select('id, evento, local, concelho, data, estado, calendar_event_id, notas')
      .in('estado', ['orcamentado', 'pre_reserva', 'confirmado'])
      .gte('data', `${hoje}T00:00:00.000Z`);
    if (error || !data) return { ...SEM_SINCRONIZACAO, estado: 'erro' };

    const eventos = data as (EventoApp & { notas: string | null })[];
    const plano = planearSincronizacao(entradas, eventos, hoje);

    let ligados = 0;
    for (const l of plano.ligar) {
      const { data: feito } = await bd
        .from('eventos')
        .update({ calendar_event_id: l.uid })
        .eq('id', l.eventoId)
        .is('calendar_event_id', null)
        .select('id');
      if (feito && feito.length > 0) ligados++;
    }

    const alterados: MudancaEstado[] = [];
    const quando = intervaloCurto(hoje, hoje, hoje);
    for (const m of plano.estados) {
      const atual = eventos.find((e) => e.id === m.eventoId);
      // Cada mudanca automatica so acontece uma vez. Se ja foi feita (esta nas
      // notas) e alguem a desfez a mao, a app respeita a pessoa e nao insiste.
      const marca = `-> ${rotulo(m.para)}, pelo calendario: "${m.titulo}"`;
      if (atual?.notas?.includes(marca)) continue;
      const linha = `[${quando}] ${rotulo(m.de)} ${marca}`;
      const notas = [atual?.notas?.trim(), linha].filter(Boolean).join('\n');
      const { data: feito } = await bd
        .from('eventos')
        .update({ estado: m.para, notas })
        .eq('id', m.eventoId)
        .eq('estado', m.de) // so se ninguem o mudou entretanto
        .select('id');
      if (feito && feito.length > 0) alterados.push(m);
    }

    return { estado, ligados, alterados, mudouDia: plano.mudouDia, desapareceu: plano.desapareceu };
  } catch {
    return { ...SEM_SINCRONIZACAO, estado: 'erro' };
  }
}
