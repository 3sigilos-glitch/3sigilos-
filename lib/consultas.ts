import { criarClienteServidor } from '@/lib/supabase/server';
import type {
  Evento, Contacto, Equipa, Escalao, Repertorio, Recibo, Definicoes,
  Cifra, Setlist, SetlistMusica,
} from '@/lib/tipos';

// Definicoes da app (linha unica). Devolve null se ainda nao houver ligacao.
export async function obterDefinicoes(): Promise<Definicoes | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('definicoes').select('*').eq('id', 1).single();
  return (data as Definicoes) ?? null;
}

// Consultas do lado do servidor. Todas toleram falhas de ligacao,
// devolvendo listas vazias, para a interface renderizar sem rebentar.

export interface OpcoesEvento {
  contactos: Pick<Contacto, 'id' | 'nome' | 'entidade'>[];
  membros: Pick<Equipa, 'id' | 'nome'>[];
  tecnicos: Pick<Equipa, 'id' | 'nome'>[];
  escaloes: Pick<Escalao, 'id' | 'nome' | 'valor_base'>[];
  setlists: Pick<Setlist, 'id' | 'nome' | 'por_defeito'>[];
  setlistPorDefeitoId: string | null;
}

export async function carregarOpcoesEvento(): Promise<OpcoesEvento> {
  const supabase = await criarClienteServidor();
  const [contactos, equipa, escaloes, setlistsRes] = await Promise.all([
    supabase.from('contactos').select('id, nome, entidade').order('nome'),
    supabase.from('equipa').select('id, nome, papel').eq('ativo', true).order('nome'),
    supabase.from('escaloes').select('id, nome, valor_base').order('nome'),
    supabase.from('setlists').select('id, nome, por_defeito').order('por_defeito', { ascending: false }).order('nome'),
  ]);

  const elementos = equipa.data ?? [];
  const setlists = (setlistsRes.data as any[]) ?? [];
  return {
    contactos: contactos.data ?? [],
    membros: elementos.filter((e: any) => e.papel === 'membro'),
    tecnicos: elementos.filter((e: any) => e.papel === 'tecnico'),
    escaloes: escaloes.data ?? [],
    setlists,
    setlistPorDefeitoId: setlists.find((s) => s.por_defeito)?.id ?? null,
  };
}

// Evento com os nomes das entidades relacionadas, para a ficha.
export interface EventoDetalhado extends Evento {
  contratante: { nome: string; telefone: string | null; email: string | null } | null;
  quem_tratou: { nome: string } | null;
  tecnico: { nome: string } | null;
  escalao: { nome: string; condicoes: string | null } | null;
  setlist: { id: string; nome: string } | null;
}

export async function obterEvento(id: string): Promise<EventoDetalhado | null> {
  const supabase = await criarClienteServidor();

  const base = `*,
       contratante:contactos!eventos_contratante_id_fkey (nome, telefone, email),
       quem_tratou:equipa!eventos_quem_tratou_id_fkey (nome),
       tecnico:equipa!eventos_tecnico_id_fkey (nome),
       escalao:escaloes!eventos_escalao_id_fkey (nome, condicoes)`;

  // Tenta com a setlist. Se a tabela ainda nao existir (migracao 0005 por
  // aplicar), volta a consultar sem a setlist, para o evento abrir na mesma.
  const comSetlist = await supabase
    .from('eventos')
    .select(`${base},\n       setlist:setlists!eventos_setlist_id_fkey (id, nome)`)
    .eq('id', id)
    .single();

  if (!comSetlist.error && comSetlist.data) {
    return comSetlist.data as unknown as EventoDetalhado;
  }

  const semSetlist = await supabase.from('eventos').select(base).eq('id', id).single();
  if (semSetlist.error || !semSetlist.data) return null;
  return { ...(semSetlist.data as any), setlist: null } as EventoDetalhado;
}

export interface FiltrosEventos {
  estado?: string;
  mes?: string; // formato AAAA-MM
}

export async function listarEventos(filtros: FiltrosEventos = {}): Promise<Evento[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase.from('eventos').select('*').order('data', { ascending: true, nullsFirst: false });

  if (filtros.estado && filtros.estado !== 'todos') {
    consulta = consulta.eq('estado', filtros.estado);
  }
  if (filtros.mes) {
    const [ano, mes] = filtros.mes.split('-').map(Number);
    if (ano && mes) {
      const inicio = new Date(ano, mes - 1, 1).toISOString();
      const fim = new Date(ano, mes, 1).toISOString();
      consulta = consulta.gte('data', inicio).lt('data', fim);
    }
  }

  const { data } = await consulta;
  return (data as Evento[]) ?? [];
}

// -----------------------------------------------------------------------------
// Escaloes.
// -----------------------------------------------------------------------------

export async function listarEscaloes(): Promise<Escalao[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('escaloes').select('*').order('nome');
  return (data as Escalao[]) ?? [];
}

export async function obterEscalao(id: string): Promise<Escalao | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('escaloes').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Escalao;
}

// -----------------------------------------------------------------------------
// Contactos.
// -----------------------------------------------------------------------------

export async function listarContactos(): Promise<Contacto[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('contactos').select('*').order('nome');
  return (data as Contacto[]) ?? [];
}

export interface ContactoComHistorico extends Contacto {
  eventos: Pick<Evento, 'id' | 'evento' | 'estado' | 'data' | 'local' | 'valor_total'>[];
}

export async function obterContacto(id: string): Promise<ContactoComHistorico | null> {
  const supabase = await criarClienteServidor();
  const [contacto, eventos] = await Promise.all([
    supabase.from('contactos').select('*').eq('id', id).single(),
    supabase
      .from('eventos')
      .select('id, evento, estado, data, local, valor_total')
      .eq('contratante_id', id)
      .order('data', { ascending: false }),
  ]);
  if (contacto.error || !contacto.data) return null;
  return { ...(contacto.data as Contacto), eventos: (eventos.data as any) ?? [] };
}

// -----------------------------------------------------------------------------
// Equipa.
// -----------------------------------------------------------------------------

export async function listarEquipa(): Promise<Equipa[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('equipa').select('*').order('papel').order('nome');
  return (data as Equipa[]) ?? [];
}

export async function obterMembro(id: string): Promise<Equipa | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('equipa').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Equipa;
}

// -----------------------------------------------------------------------------
// Repertorio.
// -----------------------------------------------------------------------------

export async function listarRepertorio(filtros: { decada?: string; ativo?: string } = {}): Promise<Repertorio[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase.from('repertorio').select('*').order('artista_original').order('musica');
  if (filtros.decada) consulta = consulta.eq('decada', filtros.decada);
  if (filtros.ativo === 'sim') consulta = consulta.eq('ativo', true);
  if (filtros.ativo === 'nao') consulta = consulta.eq('ativo', false);
  const { data } = await consulta;
  return (data as Repertorio[]) ?? [];
}

export async function obterMusica(id: string): Promise<Repertorio | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('repertorio').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Repertorio;
}

// -----------------------------------------------------------------------------
// Cifras.
// -----------------------------------------------------------------------------

export async function listarCifras(musicaId: string): Promise<Cifra[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from('cifras')
    .select('*')
    .eq('musica_id', musicaId)
    .order('por_defeito', { ascending: false })
    .order('nome_versao');
  return (data as Cifra[]) ?? [];
}

export async function obterCifra(id: string): Promise<Cifra | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('cifras').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Cifra;
}

// Cifras de varias musicas de uma vez, agrupadas por musica (para as setlists).
export async function cifrasPorMusicas(
  ids: string[]
): Promise<Record<string, Pick<Cifra, 'id' | 'nome_versao' | 'por_defeito'>[]>> {
  if (ids.length === 0) return {};
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from('cifras')
    .select('id, musica_id, nome_versao, por_defeito')
    .in('musica_id', ids)
    .order('por_defeito', { ascending: false })
    .order('nome_versao');
  const mapa: Record<string, any[]> = {};
  for (const c of (data as any[]) ?? []) {
    (mapa[c.musica_id] ??= []).push(c);
  }
  return mapa;
}

// -----------------------------------------------------------------------------
// Setlists.
// -----------------------------------------------------------------------------

export interface SetlistComContagem extends Setlist {
  total: number;
}

export async function listarSetlists(): Promise<SetlistComContagem[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from('setlists')
    .select('*, setlist_musicas(count)')
    .order('por_defeito', { ascending: false })
    .order('nome');
  return ((data as any[]) ?? []).map((s) => ({
    ...s,
    total: s.setlist_musicas?.[0]?.count ?? 0,
  }));
}

export async function setlistPorDefeito(): Promise<Setlist | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('setlists').select('*').eq('por_defeito', true).limit(1).maybeSingle();
  return (data as Setlist) ?? null;
}

// Item de setlist ja com a musica e a cifra escolhida (ou a por defeito).
export interface ItemSetlist extends SetlistMusica {
  musica: Pick<Repertorio, 'id' | 'musica' | 'artista_original' | 'duracao' | 'tom'> | null;
  cifra: Cifra | null;
}

export interface SetlistDetalhada extends Setlist {
  itens: ItemSetlist[];
}

export async function obterSetlist(id: string): Promise<SetlistDetalhada | null> {
  const supabase = await criarClienteServidor();
  const { data: setlist, error } = await supabase.from('setlists').select('*').eq('id', id).single();
  if (error || !setlist) return null;

  const { data: itens } = await supabase
    .from('setlist_musicas')
    .select(
      `*,
       musica:repertorio!setlist_musicas_musica_id_fkey (id, musica, artista_original, duracao, tom),
       cifra:cifras!setlist_musicas_cifra_id_fkey (*)`
    )
    .eq('setlist_id', id)
    .order('ordem', { ascending: true });

  // Para os itens sem cifra escolhida, usa a cifra por defeito da musica.
  const lista = (itens as any[]) ?? [];
  const semCifra = lista.filter((i) => !i.cifra && i.musica?.id).map((i) => i.musica.id);
  let porDefeito: Record<string, Cifra> = {};
  if (semCifra.length > 0) {
    const { data: cifrasDef } = await supabase
      .from('cifras')
      .select('*')
      .in('musica_id', semCifra)
      .eq('por_defeito', true);
    for (const c of (cifrasDef as Cifra[]) ?? []) porDefeito[c.musica_id] = c;
  }

  const itensFinais: ItemSetlist[] = lista.map((i) => ({
    ...i,
    cifra: i.cifra ?? (i.musica?.id ? porDefeito[i.musica.id] ?? null : null),
  }));

  return { ...(setlist as Setlist), itens: itensFinais };
}

// -----------------------------------------------------------------------------
// Recibos e resumo fiscal.
// -----------------------------------------------------------------------------

export interface ReciboDetalhado extends Recibo {
  evento: { evento: string; data: string | null } | null;
  membro: { nome: string } | null;
}

export async function listarRecibos(ano: number): Promise<ReciboDetalhado[]> {
  const supabase = await criarClienteServidor();
  const inicio = `${ano}-01-01`;
  const fim = `${ano + 1}-01-01`;
  const { data } = await supabase
    .from('recibos')
    .select(
      `*,
       evento:eventos!recibos_evento_id_fkey (evento, data),
       membro:equipa!recibos_membro_id_fkey (nome)`
    )
    .gte('data', inicio)
    .lt('data', fim)
    .order('data', { ascending: false });
  return (data as unknown as ReciboDetalhado[]) ?? [];
}

export interface ResumoMembro {
  membroId: string | null;
  nome: string;
  total: number;
  passado: number;
  porPassar: number;
  numeroPorPassar: number;
}

// Junta os recibos de um ano por membro, para o resumo fiscal.
export function resumirPorMembro(recibos: ReciboDetalhado[]): ResumoMembro[] {
  const mapa = new Map<string, ResumoMembro>();
  for (const r of recibos) {
    const chave = r.membro_id ?? 'sem';
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        membroId: r.membro_id,
        nome: r.membro?.nome ?? 'Sem membro',
        total: 0,
        passado: 0,
        porPassar: 0,
        numeroPorPassar: 0,
      });
    }
    const linha = mapa.get(chave)!;
    const valor = Number(r.valor ?? 0);
    linha.total += valor;
    if (r.passado) {
      linha.passado += valor;
    } else {
      linha.porPassar += valor;
      linha.numeroPorPassar += 1;
    }
  }
  return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
}

export async function obterRecibo(id: string): Promise<Recibo | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('recibos').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Recibo;
}

// Opcoes para o formulario de recibo: eventos e membros.
export async function carregarOpcoesRecibo() {
  const supabase = await criarClienteServidor();
  const [eventos, equipa] = await Promise.all([
    supabase.from('eventos').select('id, evento, data, valor_total').order('data', { ascending: false }),
    supabase.from('equipa').select('id, nome').eq('papel', 'membro').eq('ativo', true).order('nome'),
  ]);
  return { eventos: eventos.data ?? [], membros: equipa.data ?? [] };
}

// -----------------------------------------------------------------------------
// Dados do painel: proximos concertos, pipeline, recibos e indicadores.
// -----------------------------------------------------------------------------

export interface DadosPainel {
  proximos: Evento[];
  pipeline: Record<string, number>;
  recibosPorPassar: number;
  indicadores: {
    concertosDoMes: number;
    faturacaoPrevista: number;
    propostasEmAberto: number;
  };
}

export async function carregarPainel(): Promise<DadosPainel> {
  const supabase = await criarClienteServidor();
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
  const inicioMesSeguinte = new Date(agora.getFullYear(), agora.getMonth() + 1, 1).toISOString();

  const [todos, proximos, recibos, doMes] = await Promise.all([
    // Todos os eventos, so o estado, para contar o pipeline.
    supabase.from('eventos').select('estado'),
    // Proximos concertos a partir de hoje (exclui recusados), os mais proximos primeiro.
    supabase
      .from('eventos')
      .select('*')
      .gte('data', agora.toISOString())
      .neq('estado', 'recusado')
      .order('data', { ascending: true })
      .limit(6),
    // Recibos ainda por passar.
    supabase.from('recibos').select('id', { count: 'exact', head: true }).eq('passado', false),
    // Eventos confirmados ou realizados no mes corrente, para indicadores.
    supabase
      .from('eventos')
      .select('valor_total, estado')
      .gte('data', inicioMes)
      .lt('data', inicioMesSeguinte)
      .in('estado', ['confirmado', 'realizado']),
  ]);

  const pipeline: Record<string, number> = {
    orcamentado: 0, pre_reserva: 0, confirmado: 0, realizado: 0, recusado: 0,
  };
  for (const e of todos.data ?? []) {
    if (e.estado in pipeline) pipeline[e.estado] += 1;
  }

  const eventosMes = doMes.data ?? [];
  const faturacaoPrevista = eventosMes.reduce((soma: number, e: any) => soma + Number(e.valor_total ?? 0), 0);

  return {
    proximos: (proximos.data as Evento[]) ?? [],
    pipeline,
    recibosPorPassar: recibos.count ?? 0,
    indicadores: {
      concertosDoMes: eventosMes.length,
      faturacaoPrevista,
      propostasEmAberto: pipeline.orcamentado,
    },
  };
}
