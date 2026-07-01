'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

function texto(fd: FormData, chave: string): string | null {
  const v = fd.get(chave);
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '' ? null : s;
}

function dadosDoCliente(fd: FormData) {
  return {
    nome: texto(fd, 'nome') ?? 'Sem nome',
    contacto: texto(fd, 'contacto'),
    tipo: texto(fd, 'tipo') ?? 'Normal',
    morada: texto(fd, 'morada'),
    nif: texto(fd, 'nif'),
  };
}

export async function criarCliente(fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('clientes').insert(dadosDoCliente(fd));
  if (error) throw new Error(`Não foi possível criar o cliente: ${error.message}`);
  revalidatePath('/clientes');
  redirect('/clientes');
}

export async function atualizarCliente(id: string, fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('clientes').update(dadosDoCliente(fd)).eq('id', id);
  if (error) throw new Error(`Não foi possível guardar o cliente: ${error.message}`);
  revalidatePath('/clientes');
  redirect('/clientes');
}

export async function apagarCliente(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw new Error(`Não foi possível apagar o cliente: ${error.message}`);
  revalidatePath('/clientes');
  redirect('/clientes');
}
