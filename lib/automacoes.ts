import { criarClienteServidor } from '@/lib/supabase/server';
import { obterDefinicoes } from '@/lib/consultas';
import { dataExtenso, hora, diasAte, euros } from '@/lib/formatar';
import type { Evento, Definicoes } from '@/lib/tipos';

// -----------------------------------------------------------------------------
// Follow-up: propostas em orcamentado ha mais de X dias sem evoluir.
// -----------------------------------------------------------------------------

export interface ItemFollowUp {
  evento: Evento;
  diasParado: number;
  texto: string;
}

export async function carregarFollowUps(): Promise<{ itens: ItemFollowUp[]; dias: number }> {
  const supabase = await criarClienteServidor();
  const definicoes = await obterDefinicoes();
  const dias = definicoes?.dias_followup ?? 10;

  const limite = new Date();
  limite.setDate(limite.getDate() - dias);
  const limiteIso = limite.toISOString().slice(0, 10);

  // Propostas ainda por evoluir, com data de proposta antiga (ou sem data, pela criacao).
  const { data } = await supabase
    .from('eventos')
    .select('*')
    .eq('estado', 'orcamentado')
    .order('data_proposta', { ascending: true });

  const itens: ItemFollowUp[] = [];
  for (const ev of (data as Evento[]) ?? []) {
    const referencia = ev.data_proposta ?? ev.criado_em.slice(0, 10);
    if (referencia <= limiteIso) {
      const d = Math.abs(diasAte(referencia) ?? 0);
      itens.push({ evento: ev, diasParado: d, texto: textoFollowUp(ev, definicoes) });
    }
  }
  return { itens, dias };
}

function textoFollowUp(ev: Evento, definicoes: Definicoes | null): string {
  const banda = definicoes?.nome_banda ?? "N'ASA";
  const partes = [
    `Ola, aqui ${banda}.`,
    `Viemos so reforcar a proposta ${ev.referencia ?? ''} para ${ev.evento}${ev.data ? ` (${dataExtenso(ev.data)})` : ''}.`.replace('  ', ' '),
    'Continuamos disponiveis e com todo o gosto em tocar para vos. Ha alguma novidade quanto a decisao?',
    'Obrigado e ate breve.',
    banda,
  ];
  return partes.join('\n');
}

// -----------------------------------------------------------------------------
// Lembretes pre-concerto: concertos confirmados a chegar.
// -----------------------------------------------------------------------------

export interface ItemLembrete {
  evento: Evento;
  diasAte: number;
  texto: string;
}

export async function carregarLembretes(): Promise<{ itens: ItemLembrete[]; dias: number }> {
  const supabase = await criarClienteServidor();
  const definicoes = await obterDefinicoes();
  const dias = definicoes?.dias_lembrete_preconcerto ?? 15;

  const agora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);

  const { data } = await supabase
    .from('eventos')
    .select('*')
    .eq('estado', 'confirmado')
    .gte('data', agora.toISOString())
    .lte('data', limite.toISOString())
    .order('data', { ascending: true });

  const itens = ((data as Evento[]) ?? []).map((ev) => ({
    evento: ev,
    diasAte: diasAte(ev.data) ?? 0,
    texto: textoLembrete(ev),
  }));
  return { itens, dias };
}

function textoLembrete(ev: Evento): string {
  const h = hora(ev.data);
  const d = diasAte(ev.data) ?? 0;
  const partes = [
    `Lembrete de concerto (faltam ${d} dias):`,
    `${ev.evento}`,
    `${dataExtenso(ev.data)}${h ? `, ${h}` : ''}`,
    [ev.local, ev.concelho].filter(Boolean).join(', '),
  ].filter(Boolean);
  if (ev.material.length > 0) partes.push(`Material: ${ev.material.join(', ')}`);
  return partes.join('\n');
}

// -----------------------------------------------------------------------------
// Briefings: texto da semana e do mes para o grupo.
// -----------------------------------------------------------------------------

export type Periodo = 'semana' | 'mes';

export async function carregarBriefing(periodo: Periodo): Promise<{ eventos: Evento[]; texto: string }> {
  const supabase = await criarClienteServidor();
  const definicoes = await obterDefinicoes();
  const agora = new Date();
  const fim = new Date();
  if (periodo === 'semana') fim.setDate(fim.getDate() + 7);
  else fim.setMonth(fim.getMonth() + 1);

  const { data } = await supabase
    .from('eventos')
    .select('*')
    .neq('estado', 'recusado')
    .gte('data', agora.toISOString())
    .lte('data', fim.toISOString())
    .order('data', { ascending: true });

  const eventos = (data as Evento[]) ?? [];
  return { eventos, texto: textoBriefing(eventos, periodo, definicoes) };
}

function textoBriefing(eventos: Evento[], periodo: Periodo, definicoes: Definicoes | null): string {
  const banda = definicoes?.nome_banda ?? "N'ASA";
  const titulo = periodo === 'semana' ? 'Agenda da semana' : 'Agenda do mes';
  if (eventos.length === 0) {
    return `${titulo} | ${banda}\n\nSem concertos agendados para este periodo.`;
  }
  const linhas = eventos.map((ev) => {
    const h = hora(ev.data);
    const sitio = [ev.local, ev.concelho].filter(Boolean).join(', ');
    const estado = ev.estado === 'confirmado' ? '' : ` [${ev.estado}]`;
    return `- ${dataExtenso(ev.data)}${h ? `, ${h}` : ''}: ${ev.evento}${sitio ? `, ${sitio}` : ''}${estado}`;
  });
  return `${titulo} | ${banda}\n\n${linhas.join('\n')}`;
}

// Emails ativos da banda, para o envio dos briefings e lembretes.
export async function emailsDaBanda(): Promise<string[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('equipa').select('email').eq('papel', 'membro').eq('ativo', true);
  return ((data as { email: string | null }[]) ?? []).map((m) => m.email).filter((e): e is string => Boolean(e));
}
