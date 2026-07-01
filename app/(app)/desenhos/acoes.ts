'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

function texto(fd: FormData, chave: string): string | null {
  const v = fd.get(chave);
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '' ? null : s;
}

function dadosDoDesenho(fd: FormData) {
  return {
    nome: texto(fd, 'nome') ?? 'Sem nome',
    categoria: texto(fd, 'categoria') ?? 'Personalizado de cliente',
    estado: texto(fd, 'estado') ?? 'Só ideia',
    descricao: texto(fd, 'descricao'),
  };
}

export async function criarDesenho(fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('desenhos').insert(dadosDoDesenho(fd));
  if (error) throw new Error(`Não foi possível criar o desenho: ${error.message}`);
  revalidatePath('/desenhos');
  redirect('/desenhos');
}

export async function atualizarDesenho(id: string, fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('desenhos').update(dadosDoDesenho(fd)).eq('id', id);
  if (error) throw new Error(`Não foi possível guardar o desenho: ${error.message}`);
  revalidatePath('/desenhos');
  redirect('/desenhos');
}

export async function apagarDesenho(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('desenhos').delete().eq('id', id);
  if (error) throw new Error(`Não foi possível apagar o desenho: ${error.message}`);
  revalidatePath('/desenhos');
  redirect('/desenhos');
}
