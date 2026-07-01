'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';
import { obterSessao } from '@/lib/sessao';
import { importarTudo, type Backup } from '@/lib/backup';

// Todas estas accoes mexem em configuracao e estrutura, por isso so funcionam
// para o admin (garantido pelo RLS no servidor).

// Restaura a informacao a partir de um ficheiro de copia de seguranca (JSON).
// Reservado ao admin. Devolve um resumo do que foi restaurado.
export async function restaurarBackup(formData: FormData): Promise<string> {
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) {
    throw new Error('Reservado ao admin.');
  }

  const ficheiro = formData.get('ficheiro');
  if (!(ficheiro instanceof File) || ficheiro.size === 0) {
    throw new Error('Escolhe um ficheiro de copia de seguranca (.json).');
  }

  let backup: Backup;
  try {
    backup = JSON.parse(await ficheiro.text());
  } catch {
    throw new Error('O ficheiro nao e um JSON valido.');
  }
  if (!backup?.dados || typeof backup.dados !== 'object') {
    throw new Error('O ficheiro nao parece uma copia de seguranca desta aplicacao.');
  }

  const resultados = await importarTudo(backup);
  const comErro = resultados.filter((r) => r.erro);
  if (comErro.length > 0) {
    const detalhe = comErro.map((r) => `${r.tabela}: ${r.erro}`).join('; ');
    throw new Error(`Restauro incompleto. ${detalhe}`);
  }

  revalidatePath('/definicoes');
  const total = resultados.reduce((s, r) => s + r.registos, 0);
  const porTabela = resultados.filter((r) => r.registos > 0).map((r) => `${r.tabela} (${r.registos})`).join(', ');
  return `Restauro concluido: ${total} registos. ${porTabela}`;
}

export async function guardarDefinicoes(formData: FormData) {
  const supabase = await criarClienteServidor();
  const texto = (chave: string) => {
    const v = formData.get(chave);
    const s = typeof v === 'string' ? v.trim() : '';
    return s === '' ? null : s;
  };
  const inteiro = (chave: string, omissao: number) => {
    const v = formData.get(chave);
    const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
    return Number.isNaN(n) ? omissao : n;
  };

  const registo = {
    nome_banda: texto('nome_banda') ?? "N'ASA",
    localidade_base: texto('localidade_base') ?? 'Leiria',
    proxima_referencia: inteiro('proxima_referencia', 50),
    dias_followup: inteiro('dias_followup', 10),
    dias_lembrete_preconcerto: inteiro('dias_lembrete_preconcerto', 15),
    link_materiais: texto('link_materiais'),
    texto_proposta_intro: texto('texto_proposta_intro'),
    texto_proposta_fecho: texto('texto_proposta_fecho'),
  };

  const { error } = await supabase.from('definicoes').update(registo).eq('id', 1);
  if (error) throw new Error(`Nao foi possivel guardar as definicoes: ${error.message}`);
  revalidatePath('/definicoes');
}

function lerEscalao(formData: FormData) {
  const nome = (formData.get('nome') as string)?.trim() || 'Sem nome';
  const valorBruto = formData.get('valor_base');
  const valor = typeof valorBruto === 'string' && valorBruto.trim() !== '' ? Number(valorBruto.replace(',', '.')) : 0;
  const condicoes = (formData.get('condicoes') as string)?.trim() || null;
  return { nome, valor_base: Number.isNaN(valor) ? 0 : valor, condicoes };
}

export async function criarEscalao(formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('escaloes').insert(lerEscalao(formData));
  if (error) throw new Error(`Nao foi possivel criar o escalao: ${error.message}`);
  revalidatePath('/definicoes');
  redirect('/definicoes');
}

export async function atualizarEscalao(id: string, formData: FormData) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('escaloes').update(lerEscalao(formData)).eq('id', id);
  if (error) throw new Error(`Nao foi possivel guardar o escalao: ${error.message}`);
  revalidatePath('/definicoes');
  redirect('/definicoes');
}

export async function apagarEscalao(id: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('escaloes').delete().eq('id', id);
  if (error) throw new Error(`Nao foi possivel apagar o escalao: ${error.message}`);
  revalidatePath('/definicoes');
  redirect('/definicoes');
}
