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
    musica: texto('musica') ?? 'Sem nome',
    artista_original: texto('artista_original'),
    decada: texto('decada'),
    duracao: texto('duracao'),
    tom: texto('tom'),
    ativo: formData.get('ativo') === 'on',
    notas: texto('notas'),
  };
}

export async function criarMusica(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('repertorio').insert(lerFormulario(formData));
  if (error) throw new Error(`Nao foi possivel criar: ${error.message}`);
  revalidatePath('/repertorio');
  redirect('/repertorio');
}

export async function atualizarMusica(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('repertorio').update(lerFormulario(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath('/repertorio');
  redirect('/repertorio');
}

export async function apagarMusica(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('repertorio').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath('/repertorio');
  redirect('/repertorio');
}
