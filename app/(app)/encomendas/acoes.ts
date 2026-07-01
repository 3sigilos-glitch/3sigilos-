'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';
import { hoje } from '@/lib/formatar';

// Atualiza todas as vistas que dependem das encomendas e do stock.
function revalidarTudo() {
  revalidatePath('/painel');
  revalidatePath('/encomendas');
  revalidatePath('/faturacao');
  revalidatePath('/stock');
}

// Le um campo de texto do formulario, devolvendo null quando esta vazio.
function texto(fd: FormData, chave: string): string | null {
  const valor = fd.get(chave);
  const s = typeof valor === 'string' ? valor.trim() : '';
  return s === '' ? null : s;
}

// Le um campo numerico, com um valor por defeito de seguranca.
function numero(fd: FormData, chave: string, porDefeito = 0): number {
  const valor = fd.get(chave);
  const n = typeof valor === 'string' ? Number(valor.replace(',', '.')) : NaN;
  return Number.isFinite(n) ? n : porDefeito;
}

// Le uma caixa de selecao (checkbox).
function ligado(fd: FormData, chave: string): boolean {
  return fd.get(chave) === 'on' || fd.get(chave) === 'true';
}

// Monta o conjunto de dados da encomenda a partir do formulario.
function dadosDaEncomenda(fd: FormData) {
  const pago = ligado(fd, 'pago');
  const faturado = ligado(fd, 'faturado');

  return {
    data: texto(fd, 'data') ?? hoje(),
    cliente_id: texto(fd, 'cliente_id'),
    desenho_id: texto(fd, 'desenho_id'),
    descricao_livre: texto(fd, 'descricao_livre'),
    cor: texto(fd, 'cor'),
    tamanho: texto(fd, 'tamanho'),
    quantidade: Math.max(1, Math.round(numero(fd, 'quantidade', 1))),
    preco: numero(fd, 'preco', 0),
    custo: numero(fd, 'custo', 4),
    metodo_pagamento: texto(fd, 'metodo_pagamento'),
    pago,
    // Se ficou pago e nao foi indicada data, assume hoje.
    data_pagamento: pago ? texto(fd, 'data_pagamento') ?? hoje() : null,
    estado: texto(fd, 'estado') ?? 'Por estampar',
    faturado,
    data_faturacao: faturado ? texto(fd, 'data_faturacao') ?? hoje() : null,
    notas: texto(fd, 'notas'),
  };
}

export async function criarEncomenda(fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('encomendas').insert(dadosDaEncomenda(fd));
  if (error) throw new Error(`Não foi possível registar a encomenda: ${error.message}`);
  revalidarTudo();
  redirect('/encomendas');
}

export async function atualizarEncomenda(id: string, fd: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('encomendas').update(dadosDaEncomenda(fd)).eq('id', id);
  if (error) throw new Error(`Não foi possível guardar a encomenda: ${error.message}`);
  revalidarTudo();
  redirect('/encomendas');
}

export async function apagarEncomenda(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('encomendas').delete().eq('id', id);
  if (error) throw new Error(`Não foi possível apagar a encomenda: ${error.message}`);
  revalidarTudo();
  redirect('/encomendas');
}

// Marca como entregue (abate o stock da cor e tamanho, via base de dados).
export async function marcarEntregue(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('encomendas').update({ estado: 'Entregue' }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidarTudo();
}

// Volta a por estampar (repoe o stock que tinha sido abatido).
export async function reverterEntrega(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('encomendas').update({ estado: 'Por estampar' }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidarTudo();
}

// Alterna o estado de pagamento, preenchendo ou limpando a data.
export async function alternarPago(id: string, pagoAtual: boolean) {
  const supabase = await criarClienteServidor();
  const novo = !pagoAtual;
  const { error } = await supabase
    .from('encomendas')
    .update({ pago: novo, data_pagamento: novo ? hoje() : null })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidarTudo();
}
