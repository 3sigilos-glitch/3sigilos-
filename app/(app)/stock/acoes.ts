'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/server';

function texto(fd: FormData, chave: string): string {
  const v = fd.get(chave);
  return typeof v === 'string' ? v.trim() : '';
}

function numero(fd: FormData, chave: string, porDefeito = 0): number {
  const v = fd.get(chave);
  const n = typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : porDefeito;
}

function revalidar() {
  revalidatePath('/stock');
  revalidatePath('/painel');
}

// Adiciona uma nova combinacao de cor e tamanho ao stock.
export async function adicionarTshirt(fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('tshirts_brancas').insert({
    cor: texto(fd, 'cor'),
    tamanho: texto(fd, 'tamanho'),
    quantidade: Math.max(0, Math.round(numero(fd, 'quantidade', 0))),
    minimo: Math.max(0, Math.round(numero(fd, 'minimo', 0))),
  });
  if (error) {
    // Erro tipico: ja existe esta cor e tamanho (combinacao unica).
    throw new Error(
      error.code === '23505'
        ? 'Já existe stock para esta cor e tamanho. Usa a entrada rápida.'
        : error.message
    );
  }
  revalidar();
}

// Entrada rapida: soma unidades ao stock existente (quando se compram mais).
export async function entradaStock(fd: FormData) {
  const id = texto(fd, 'id');
  const aAdicionar = Math.round(numero(fd, 'entrada', 0));
  if (!id || aAdicionar === 0) return;

  const supabase = await criarClienteServidor();
  const { data: atual } = await supabase
    .from('tshirts_brancas')
    .select('quantidade')
    .eq('id', id)
    .single();
  if (!atual) return;

  const nova = Math.max(0, atual.quantidade + aAdicionar);
  const { error } = await supabase.from('tshirts_brancas').update({ quantidade: nova }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidar();
}

// Acerto manual: define a quantidade e o minimo diretamente.
export async function atualizarStock(fd: FormData) {
  const id = texto(fd, 'id');
  if (!id) return;
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from('tshirts_brancas')
    .update({
      quantidade: Math.max(0, Math.round(numero(fd, 'quantidade', 0))),
      minimo: Math.max(0, Math.round(numero(fd, 'minimo', 0))),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidar();
}

export async function apagarTshirt(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('tshirts_brancas').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidar();
}
