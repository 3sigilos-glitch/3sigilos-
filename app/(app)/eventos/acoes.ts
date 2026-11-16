'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';
import { deLocalParaIso } from '@/lib/formatar';
import type { EstadoEvento } from '@/lib/tipos';
import { diaEmPortugal, procurarNaAgenda, somarDias, tecnicoNoTitulo, type EventoApp } from '@/lib/calendario';
import { indisponiveisEm, obterConcertoDoCalendario, obterTecnicos } from '@/lib/calendarioDados';

// Le os campos do formulario e monta o registo do evento.
function lerFormulario(formData: FormData) {
  const texto = (chave: string) => {
    const v = formData.get(chave);
    const s = typeof v === 'string' ? v.trim() : '';
    return s === '' ? null : s;
  };
  const numero = (chave: string) => {
    const v = formData.get(chave);
    if (typeof v !== 'string' || v.trim() === '') return 0;
    const n = Number(v.replace(',', '.'));
    return Number.isNaN(n) ? 0 : n;
  };

  const estado = (texto('estado') ?? 'orcamentado') as EstadoEvento;

  // Material vem numa caixa de texto, um por linha.
  const materialBruto = formData.get('material');
  const material =
    typeof materialBruto === 'string'
      ? materialBruto.split('\n').map((m) => m.trim()).filter(Boolean)
      : [];

  const registo = {
    evento: texto('evento') ?? 'Sem nome',
    estado,
    data: deLocalParaIso(texto('data')),
    local: texto('local'),
    concelho: texto('concelho'),
    contratante_id: texto('contratante_id'),
    quem_tratou_id: texto('quem_tratou_id'),
    escalao_id: texto('escalao_id'),
    valor_base: numero('valor_base'),
    deslocacao_valor: numero('deslocacao_valor'),
    deslocacao_descricao: texto('deslocacao_descricao'),
    tecnico_id: texto('tecnico_id'),
    disponibilidade_tecnico: texto('disponibilidade_tecnico') ?? 'por_confirmar',
    material,
    data_proposta: texto('data_proposta'),
    data_aprovacao: texto('data_aprovacao'),
    pago: texto('pago') ?? 'por_receber',
    contactos_extra: texto('contactos_extra'),
    notas: texto('notas'),
    setlist_id: texto('setlist_id'),
  };

  // Estado com data automatica: ao confirmar, preenche a data de aprovacao
  // se ainda nao houver nenhuma.
  if (registo.estado === 'confirmado' && !registo.data_aprovacao) {
    registo.data_aprovacao = new Date().toISOString().slice(0, 10);
  }

  return registo;
}

export async function criarEvento(formData: FormData) {
  const supabase = await criarClienteServidor();
  const registo = lerFormulario(formData);

  const { data, error } = await supabase.from('eventos').insert(registo).select('id').single();
  if (error) {
    throw new Error(`Nao foi possivel criar o evento: ${error.message}`);
  }

  // Um concerto realizado passa a aparecer logo em Recibos, na lista Por passar.
  if (registo.estado === 'realizado') revalidatePath('/recibos');
  revalidatePath('/eventos');
  redirect(`/eventos/${data.id}`);
}

export async function atualizarEvento(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const registo = lerFormulario(formData);

  const { error } = await supabase.from('eventos').update(registo).eq('id', id);
  if (error) {
    throw new Error(`Nao foi possivel guardar as alteracoes: ${error.message}`);
  }

  if (registo.estado === 'realizado') revalidatePath('/recibos');
  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
}

export async function apagarEvento(id: string) {
  const supabase = await criarClienteServidor();
  // So o admin consegue apagar (garantido pelo RLS). Se nao for, o RLS bloqueia.
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) {
    throw new Error(`Nao foi possivel apagar: ${error.message}`);
  }
  revalidatePath('/eventos');
  redirect('/eventos');
}

// Verifica se ja existe outro evento na mesma data (ignora o proprio).
// Distingue confirmados de pendentes, para o aviso ser claro.
export async function verificarConflitoData(dataIso: string, idAtual?: string) {
  if (!dataIso) return { confirmados: [], pendentes: [], indisponiveis: [] as string[] };

  // Quem escreveu no calendario Google que esta indisponivel nesse dia.
  // (Lista vazia se o calendario nao estiver ligado ou falhar.)
  let indisponiveis: string[] = [];
  try {
    const instante = new Date(dataIso);
    if (!Number.isNaN(instante.getTime())) indisponiveis = await indisponiveisEm(diaEmPortugal(instante));
  } catch {
    indisponiveis = [];
  }

  const supabase = await criarClienteServidor();
  const dia = new Date(dataIso);
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(dia);
  fim.setHours(23, 59, 59, 999);

  let consulta = supabase
    .from('eventos')
    .select('id, evento, estado, local, data')
    .gte('data', inicio.toISOString())
    .lte('data', fim.toISOString());

  if (idAtual) {
    consulta = consulta.neq('id', idAtual);
  }

  const { data, error } = await consulta;
  if (error || !data) return { confirmados: [], pendentes: [], indisponiveis };

  return {
    confirmados: data.filter((e) => e.estado === 'confirmado' || e.estado === 'realizado'),
    pendentes: data.filter((e) => e.estado === 'orcamentado' || e.estado === 'pre_reserva'),
    indisponiveis,
  };
}

// Importa para a agenda um concerto escrito no calendario Google.
//
// Antes de gravar volta SEMPRE a comparar com a agenda (alguem pode ter criado
// o evento a mao entretanto): se ja houver um evento ligado a esta entrada, ou
// um evento no mesmo dia (ou no dia ao lado) com nome ou local parecido, nao
// cria nada e abre o que ja existe. Se houver outro evento no mesmo dia com
// nome diferente, so cria com confirmacao explicita (outroConcerto = true).
export async function importarDoCalendario(uid: string, outroConcerto = false): Promise<{ erro: string } | void> {
  let destino: string;
  try {
    const concerto = await obterConcertoDoCalendario(uid);
    if (!concerto) return { erro: 'Esta entrada ja nao esta no calendario. Atualiza a pagina.' };

    const supabase = await criarClienteServidor();
    const colunas = 'id, evento, local, concelho, data, estado, calendar_event_id';
    const [ligados, perto] = await Promise.all([
      supabase.from('eventos').select(colunas).eq('calendar_event_id', uid),
      supabase
        .from('eventos')
        .select(colunas)
        .gte('data', somarDias(concerto.dia, -2))
        .lt('data', somarDias(concerto.dia, 3)),
    ]);
    if (ligados.error || perto.error) return { erro: 'Nao foi possivel confirmar a agenda. Tenta outra vez.' };

    const existentes = [...((ligados.data as EventoApp[]) ?? []), ...((perto.data as EventoApp[]) ?? [])];
    const { igual, mesmoDia } = procurarNaAgenda(concerto, existentes);

    if (igual) {
      destino = `/eventos/${igual.id}`;
    } else if (mesmoDia && !outroConcerto) {
      destino = `/eventos/${mesmoDia.id}`;
    } else {
      const tecnico = tecnicoNoTitulo(concerto.titulo, await obterTecnicos());
      const notas = [`Importado do calendario: "${concerto.titulo}"`, concerto.descricao].filter(Boolean).join('\n');
      const { data: novo, error } = await supabase
        .from('eventos')
        .insert({
          evento: concerto.nome,
          estado: concerto.estado,
          // A app guarda a hora tal como se le no relogio (sem fuso).
          data: `${concerto.dia}T${concerto.hora ?? '00:00'}:00Z`,
          local: concerto.local || null,
          valor_base: concerto.valor,
          tecnico_id: tecnico?.id ?? null,
          notas,
          calendar_event_id: uid,
        })
        .select('id')
        .single();
      if (error || !novo) return { erro: `Nao foi possivel importar: ${error?.message ?? 'erro desconhecido'}` };
      destino = `/eventos/${novo.id}`;
    }
  } catch {
    return { erro: 'Nao foi possivel importar agora. Tenta outra vez.' };
  }

  revalidatePath('/eventos');
  redirect(destino);
}
