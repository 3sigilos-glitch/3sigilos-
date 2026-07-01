'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/server';
import { hoje } from '@/lib/formatar';

// Marca uma encomenda como faturada, com a data de hoje.
export async function marcarFaturado(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from('encomendas')
    .update({ faturado: true, data_faturacao: hoje() })
    .eq('id', id);
  if (error) throw new Error(`Não foi possível marcar como faturada: ${error.message}`);
  revalidatePath('/faturacao');
  revalidatePath('/painel');
  revalidatePath('/encomendas');
}
