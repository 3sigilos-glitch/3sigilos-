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

// --- Importador da folha do Drive (concertos e recibos passados) ---

// Le uma data em varios formatos comuns e devolve YYYY-MM-DD (ou null).
function parseDataFolha(bruto: string): string | null {
  const s = (bruto ?? '').trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (m) return `20${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = s.match(/^(\d{4})$/); // so o ano
  if (m) return `${m[1]}-01-01`;
  return null;
}

// Le um valor (250, 500, "?", vazio) e devolve um numero (0 se desconhecido).
function parseValorFolha(bruto: string): number {
  const s = (bruto ?? '').trim().replace('€', '').replace(',', '.');
  if (!s || s === '?') return 0;
  const n = Number(s.replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// Importa concertos e recibos passados a partir do texto colado da folha do
// Drive (colunas: Data, Local, Recibo passado, Valor). Reservado ao admin.
// Nao duplica: reutiliza o concerto se ja existir (nome + data) e nao repete o
// recibo do mesmo musico no mesmo concerto. Devolve um resumo do que fez.
export async function importarConcertos(texto: string): Promise<string> {
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) throw new Error('Reservado ao admin.');
  const supabase = await criarClienteServidor();

  // Equipa, para casar quem passou o recibo pelo nome.
  const { data: equipaData } = await supabase.from('equipa').select('id, nome, papel');
  const membros = (equipaData ?? []) as { id: string; nome: string; papel: string }[];
  const acharMembro = (nome: string) => {
    const n = nome.trim().toLowerCase();
    if (!n) return null;
    return (
      membros.find((m) => m.nome.toLowerCase() === n) ??
      membros.find((m) => m.nome.toLowerCase().includes(n) || n.includes(m.nome.toLowerCase())) ??
      null
    );
  };

  // Eventos existentes, para nao duplicar (nome + data).
  const { data: evsData } = await supabase.from('eventos').select('id, evento, data');
  const existentes = (evsData ?? []) as { id: string; evento: string; data: string | null }[];
  const chave = (nome: string, data: string | null) => `${nome.trim().toLowerCase()}|${data ? data.slice(0, 10) : ''}`;
  const mapaEventos = new Map<string, string>(existentes.map((e) => [chave(e.evento, e.data), e.id]));

  const hoje = new Date().toISOString().slice(0, 10);
  let criados = 0;
  let jaExistiam = 0;
  let recibosCriados = 0;
  let ignoradas = 0;
  const naoEncontrados = new Set<string>();

  for (const linha of (texto ?? '').split('\n')) {
    if (!linha.trim()) continue;
    const cells = linha.split('\t').map((c) => c.trim());

    // Ignora uma eventual linha de cabecalho.
    if (/^local$/i.test(cells[1] ?? '') || /^(data|ano)$/i.test(cells[0] ?? '')) continue;

    let dataBruta = '';
    let local = '';
    let reciboNome = '';
    let valorBruto = '';
    if (cells.length >= 4) {
      [dataBruta, local, reciboNome, valorBruto] = cells;
    } else if (cells.length === 3) {
      if (parseDataFolha(cells[0])) [dataBruta, local, reciboNome] = cells;
      else [local, reciboNome, valorBruto] = cells;
    } else if (cells.length === 2) {
      [local, reciboNome] = cells;
    } else {
      ignoradas++;
      continue;
    }

    local = (local ?? '').trim();
    if (!local) {
      ignoradas++;
      continue;
    }
    const data = parseDataFolha(dataBruta);

    // Concerto: reutiliza se ja existir, senao cria.
    let eventoId = mapaEventos.get(chave(local, data));
    if (!eventoId) {
      const passou = !!(reciboNome ?? '').trim();
      const jaPassado = data ? data < hoje : false;
      const estado = passou || jaPassado ? 'realizado' : 'confirmado';
      const { data: novo, error } = await supabase
        .from('eventos')
        .insert({ evento: local, data, estado })
        .select('id')
        .single();
      if (error || !novo) {
        ignoradas++;
        continue;
      }
      eventoId = novo.id as string;
      mapaEventos.set(chave(local, data), eventoId);
      criados++;
    } else {
      jaExistiam++;
    }

    // Recibo passado, se houver nome de quem passou.
    const nome = (reciboNome ?? '').trim();
    if (nome) {
      const membro = acharMembro(nome);
      if (!membro) {
        naoEncontrados.add(nome);
        continue;
      }
      const { data: jaR } = await supabase
        .from('recibos')
        .select('id')
        .eq('evento_id', eventoId)
        .eq('membro_id', membro.id)
        .limit(1);
      if (jaR && jaR.length > 0) continue;
      const { error: erroR } = await supabase.from('recibos').insert({
        evento_id: eventoId,
        membro_id: membro.id,
        valor: parseValorFolha(valorBruto),
        passado: true,
        data: data ?? hoje,
      });
      if (!erroR) recibosCriados++;
    }
  }

  revalidatePath('/eventos');
  revalidatePath('/recibos');
  revalidatePath('/painel');

  const partes = [
    `${criados} concertos criados`,
    `${jaExistiam} ja existiam`,
    `${recibosCriados} recibos passados criados`,
  ];
  if (naoEncontrados.size > 0) {
    partes.push(`sem correspondencia na equipa: ${[...naoEncontrados].join(', ')} (adiciona-os em Equipa e volta a importar)`);
  }
  if (ignoradas > 0) partes.push(`${ignoradas} linhas ignoradas`);
  return partes.join('. ') + '.';
}
