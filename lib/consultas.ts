import { criarClienteServidor } from '@/lib/supabase/server';
import type { Evento, Contacto, Equipa, Escalao, Repertorio } from '@/lib/tipos';

// Consultas do lado do servidor. Todas toleram falhas de ligacao,
// devolvendo listas vazias, para a interface renderizar sem rebentar.

export interface OpcoesEvento {
  contactos: Pick<Contacto, 'id' | 'nome' | 'entidade'>[];
  membros: Pick<Equipa, 'id' | 'nome'>[];
  tecnicos: Pick<Equipa, 'id' | 'nome'>[];
  escaloes: Pick<Escalao, 'id' | 'nome' | 'valor_base'>[];
}

export async function carregarOpcoesEvento(): Promise<OpcoesEvento> {
  const supabase = await criarClienteServidor();
  const [contactos, equipa, escaloes] = await Promise.all([
    supabase.from('contactos').select('id, nome, entidade').order('nome'),
    supabase.from('equipa').select('id, nome, papel').eq('ativo', true).order('nome'),
    supabase.from('escaloes').select('id, nome, valor_base').order('nome'),
  ]);

  const elementos = equipa.data ?? [];
  return {
    contactos: contactos.data ?? [],
    membros: elementos.filter((e: any) => e.papel === 'membro'),
    tecnicos: elementos.filter((e: any) => e.papel === 'tecnico'),
    escaloes: escaloes.data ?? [],
  };
}

// Evento com os nomes das entidades relacionadas, para a ficha.
export interface EventoDetalhado extends Evento {
  contratante: { nome: string; telefone: string | null; email: string | null } | null;
  quem_tratou: { nome: string } | null;
  tecnico: { nome: string } | null;
  escalao: { nome: string; condicoes: string | null } | null;
}

export async function obterEvento(id: string): Promise<EventoDetalhado | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from('eventos')
    .select(
      `*,
       contratante:contactos!eventos_contratante_id_fkey (nome, telefone, email),
       quem_tratou:equipa!eventos_quem_tratou_id_fkey (nome),
       tecnico:equipa!eventos_tecnico_id_fkey (nome),
       escalao:escaloes!eventos_escalao_id_fkey (nome, condicoes)`
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as unknown as EventoDetalhado;
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
