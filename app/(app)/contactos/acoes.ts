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
    nome: texto('nome') ?? 'Sem nome',
    entidade: texto('entidade'),
    tipo: texto('tipo'),
    telefone: texto('telefone'),
    email: texto('email'),
    concelho: texto('concelho'),
    notas: texto('notas'),
  };
}

export async function criarContacto(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from('contactos').insert(lerFormulario(formData)).select('id').single();
  if (error) throw new Error(`Nao foi possivel criar o contacto: ${error.message}`);
  revalidatePath('/contactos');
  redirect(`/contactos/${data.id}`);
}

export async function atualizarContacto(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('contactos').update(lerFormulario(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath('/contactos');
  revalidatePath(`/contactos/${id}`);
  redirect(`/contactos/${id}`);
}

export async function apagarContacto(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('contactos').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath('/contactos');
  redirect('/contactos');
}
