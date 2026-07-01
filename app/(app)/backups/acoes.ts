'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/server';

// Resultado do restauro, para a interface mostrar o que aconteceu.
export interface ResultadoRestauro {
  ok: boolean;
  mensagem: string;
}

// Colunas calculadas pela base de dados: nunca podem ser escritas no restauro.
const COLUNAS_CALCULADAS = ['total', 'margem'];

function limparCalculadas(linhas: Record<string, unknown>[]): Record<string, unknown>[] {
  return linhas.map((linha) => {
    const copia = { ...linha };
    for (const coluna of COLUNAS_CALCULADAS) delete copia[coluna];
    return copia;
  });
}

// Restaura a informacao a partir do conteudo de um ficheiro de copia (JSON).
// Junta a informacao existente com a da copia, por id (nao apaga o que ja tens).
// A ordem respeita as ligacoes entre tabelas: primeiro clientes e desenhos,
// so depois as encomendas que lhes fazem referencia.
export async function restaurarBackup(conteudo: string): Promise<ResultadoRestauro> {
  let copia: any;
  try {
    copia = JSON.parse(conteudo);
  } catch {
    return { ok: false, mensagem: 'O ficheiro não é uma cópia válida (não é um JSON legível).' };
  }

  const dados = copia?.dados;
  if (!dados || typeof dados !== 'object') {
    return { ok: false, mensagem: 'O ficheiro não parece uma cópia de segurança da 3 Sigilos.' };
  }

  const tshirts = Array.isArray(dados.tshirts_brancas) ? dados.tshirts_brancas : [];
  const desenhos = Array.isArray(dados.desenhos) ? dados.desenhos : [];
  const clientes = Array.isArray(dados.clientes) ? dados.clientes : [];
  const encomendas = Array.isArray(dados.encomendas) ? dados.encomendas : [];

  const supabase = await criarClienteServidor();

  // Ordem segura por causa das ligacoes entre tabelas.
  const passos: { tabela: string; linhas: Record<string, unknown>[] }[] = [
    { tabela: 'tshirts_brancas', linhas: tshirts },
    { tabela: 'clientes', linhas: clientes },
    { tabela: 'desenhos', linhas: desenhos },
    { tabela: 'encomendas', linhas: limparCalculadas(encomendas) },
  ];

  let totalReposto = 0;
  for (const passo of passos) {
    if (passo.linhas.length === 0) continue;
    const { error } = await supabase
      .from(passo.tabela)
      .upsert(passo.linhas, { onConflict: 'id' });
    if (error) {
      return {
        ok: false,
        mensagem: `Erro ao restaurar ${passo.tabela}: ${error.message}`,
      };
    }
    totalReposto += passo.linhas.length;
  }

  // Atualiza todas as vistas.
  for (const rota of ['/painel', '/encomendas', '/faturacao', '/stock', '/desenhos', '/clientes']) {
    revalidatePath(rota);
  }

  return {
    ok: true,
    mensagem: `Cópia restaurada. ${totalReposto} registos repostos ou atualizados.`,
  };
}
