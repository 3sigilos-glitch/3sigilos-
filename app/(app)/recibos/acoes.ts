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
  const valorBruto = formData.get('valor');
  const valor =
    typeof valorBruto === 'string' && valorBruto.trim() !== ''
      ? Number(valorBruto.replace(',', '.'))
      : 0;
  return {
    evento_id: texto('evento_id'),
    membro_id: texto('membro_id'),
    valor: Number.isNaN(valor) ? 0 : valor,
    data: texto('data'),
    passado: formData.get('passado') === 'on',
  };
}

export async function criarRecibo(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('recibos').insert(lerFormulario(formData));
  if (error) throw new Error(`Nao foi possivel criar o recibo: ${error.message}`);
  revalidatePath('/recibos');
  redirect('/recibos');
}

export async function atualizarRecibo(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('recibos').update(lerFormulario(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar: ${error.message}`);
  revalidatePath('/recibos');
  redirect('/recibos');
}

// Alterna rapidamente o estado de um recibo entre passado e por passar.
export async function alternarPassado(id: string, novoEstado: boolean) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('recibos').update({ passado: novoEstado }).eq('id', id);
  if (error) throw new Error(`Nao foi possivel atualizar: ${error.message}`);
  revalidatePath('/recibos');
}

export async function apagarRecibo(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('recibos').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath('/recibos');
  redirect('/recibos');
}
