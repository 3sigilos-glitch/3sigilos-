import { criarClienteServidor } from '@/lib/supabase/server';

// Copias de seguranca de toda a informacao da banda.
// Cobre as tabelas de negocio (nao inclui as contas de autenticacao nem os
// perfis, que sao geridos pelo Supabase Auth).

// Tabelas incluidas na copia. A ordem importa no restauro, por causa das
// relacoes: primeiro as independentes, depois eventos e recibos.
const TABELAS = ['equipa', 'contactos', 'escaloes', 'repertorio', 'definicoes', 'eventos', 'recibos'] as const;

export interface Backup {
  aplicacao: string;
  versao: number;
  exportado_em: string;
  dados: Record<string, any[]>;
}

// Le todas as tabelas com um dado cliente Supabase (de sessao ou de servico).
export async function exportarComCliente(supabase: {
  from: (t: string) => { select: (c: string) => Promise<{ data: any[] | null }> };
}): Promise<Backup> {
  const dados: Record<string, any[]> = {};
  for (const tabela of TABELAS) {
    const { data } = await supabase.from(tabela).select('*');
    dados[tabela] = data ?? [];
  }
  return {
    aplicacao: "N'ASA Gestao",
    versao: 1,
    exportado_em: new Date().toISOString(),
    dados,
  };
}

// Le todas as tabelas e devolve um objeto pronto a guardar em ficheiro.
export async function exportarTudo(): Promise<Backup> {
  const supabase = await criarClienteServidor();
  return exportarComCliente(supabase as any);
}

export interface ResultadoRestauro {
  tabela: string;
  registos: number;
  erro?: string;
}

// Restaura a partir de um objeto de copia de seguranca.
// Usa upsert pelo id: atualiza os registos existentes e cria os que faltam,
// sem apagar o que ja la esta. So o admin consegue escrever (garantido pelo RLS).
export async function importarTudo(backup: Backup): Promise<ResultadoRestauro[]> {
  const supabase = await criarClienteServidor();
  const dados = backup?.dados ?? {};
  const resultados: ResultadoRestauro[] = [];

  for (const tabela of TABELAS) {
    let linhas = Array.isArray(dados[tabela]) ? dados[tabela] : [];
    if (linhas.length === 0) {
      resultados.push({ tabela, registos: 0 });
      continue;
    }

    // A coluna valor_total dos eventos e calculada pela base de dados,
    // por isso nao pode ser inserida.
    if (tabela === 'eventos') {
      linhas = linhas.map(({ valor_total, ...resto }) => resto);
    }

    const { error } = await supabase.from(tabela).upsert(linhas, { onConflict: 'id' });
    resultados.push({ tabela, registos: linhas.length, erro: error?.message });
  }

  return resultados;
}
