'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

// As escritas na equipa sao reservadas ao admin (garantido pelo RLS).
function lerFormulario(formData: FormData) {
  const texto = (chave: string) => {
    const v = formData.get(chave);
    const s = typeof v === 'string' ? v.trim() : '';
    return s === '' ? null : s;
  };
  return {
    nome: texto('nome') ?? 'Sem nome',
    papel: texto('papel') ?? 'membro',
    funcao_instrumento: texto('funcao_instrumento'),
    email: texto('email'),
    telefone: texto('telefone'),
    foto_url: texto('foto_url'),
    ativo: formData.get('ativo') === 'on',
  };
}

export async function criarMembro(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('equipa').insert(lerFormulario(formData));
  if (error) throw new Error(`Nao foi possivel criar: ${error.message}`);
  revalidatePath('/equipa');
  redirect('/equipa');
}

export async function atualizarMembro(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('equipa').update(lerFormulario(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath('/equipa');
  redirect('/equipa');
}

export async function apagarMembro(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('equipa').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath('/equipa');
  redirect('/equipa');
}
