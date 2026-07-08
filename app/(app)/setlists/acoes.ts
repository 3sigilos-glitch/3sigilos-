'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

function lerFormulario(formData: FormData) {
  const texto = (chave: string) => {
    const v = formData.get(chave);
    const s = typeof v === 'string' ? v.trim() : '';
    return s === '' ? null : s;
  };
  return {
    nome: texto('nome') ?? 'Setlist',
    descricao: texto('descricao'),
    por_defeito: formData.get('por_defeito') === 'on',
  };
}

export async function criarSetlist(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('setlists').insert(lerFormulario(formData)).select('id').single();
  if (error) throw new Error(`Nao foi possivel criar a setlist: ${error.message}`);
  revalidatePath('/setlists');
  redirect(`/setlists/${data.id}`);
}

export async function atualizarSetlist(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('setlists').update(lerFormulario(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath('/setlists');
  revalidatePath(`/setlists/${id}`);
  redirect(`/setlists/${id}`);
}

export async function apagarSetlist(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('setlists').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath('/setlists');
  redirect('/setlists');
}

// Acrescenta uma musica ao fim da setlist.
export async function adicionarMusica(setlistId: string, musicaId: string) {
  const supabase = await criarClienteServidor();
  const { data: ultimo } = await supabase
    .from('setlist_musicas')
    .select('ordem')
    .eq('setlist_id', setlistId)
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle();
  const ordem = (ultimo?.ordem ?? -1) + 1;
  const { error } = await supabase.from('setlist_musicas').insert({ setlist_id: setlistId, musica_id: musicaId, ordem });
  if (error) throw new Error(`Nao foi possivel adicionar: ${error.message}`);
  revalidatePath(`/setlists/${setlistId}`);
}

export async function removerItem(setlistId: string, itemId: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('setlist_musicas').delete().eq('id', itemId);
  if (error) throw new Error(`Nao foi possivel remover: ${error.message}`);
  revalidatePath(`/setlists/${setlistId}`);
}

// Guarda a nova ordem das musicas (recebe os ids dos itens pela ordem pretendida).
export async function guardarOrdem(setlistId: string, idsOrdenados: string[]) {
  const supabase = await criarClienteServidor();
  for (let i = 0; i < idsOrdenados.length; i++) {
    const { error } = await supabase.from('setlist_musicas').update({ ordem: i }).eq('id', idsOrdenados[i]);
    if (error) throw new Error(`Nao foi possivel guardar a ordem: ${error.message}`);
  }
  revalidatePath(`/setlists/${setlistId}`);
}

// Atualiza a nota rapida e a cifra escolhida de um item.
export async function atualizarItem(
  setlistId: string,
  itemId: string,
  dados: { nota_rapida?: string | null; cifra_id?: string | null }
) {
  const supabase = await criarClienteServidor();
  const registo: Record<string, any> = {};
  if ('nota_rapida' in dados) registo.nota_rapida = dados.nota_rapida || null;
  if ('cifra_id' in dados) registo.cifra_id = dados.cifra_id || null;
  const { error } = await supabase.from('setlist_musicas').update(registo).eq('id', itemId);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath(`/setlists/${setlistId}`);
}
