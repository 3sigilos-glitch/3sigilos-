import { criarClienteServidor } from '@/lib/supabase/server';
import type { Evento, Contacto, Equipa, Escalao } from '@/lib/tipos';

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
