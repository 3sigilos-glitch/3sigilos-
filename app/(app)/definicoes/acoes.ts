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

// Meses por extenso e abreviados, em portugues e ingles (a folha pode ter as
// datas escritas, conforme o formato).
const MESES: Record<string, number> = {
  jan: 1, janeiro: 1, january: 1,
  fev: 2, fevereiro: 2, feb: 2, february: 2,
  mar: 3, marco: 3, 'março': 3, march: 3,
  abr: 4, abril: 4, apr: 4, april: 4,
  mai: 5, maio: 5, may: 5,
  jun: 6, junho: 6, june: 6,
  jul: 7, julho: 7, july: 7,
  ago: 8, agosto: 8, aug: 8, august: 8,
  set: 9, setembro: 9, sep: 9, sept: 9, september: 9,
  out: 10, outubro: 10, oct: 10, october: 10,
  nov: 11, novembro: 11, november: 11,
  dez: 12, dezembro: 12, dec: 12, december: 12,
};

const doisDigitos = (n: number | string) => String(n).padStart(2, '0');

// Le uma data da folha e devolve YYYY-MM-DD (com hora, se existir), ou null.
// Aceita: 10/05/2026, 10-05-2026, 10.05.2026, 2026-05-10, 10/05/26,
// "sab, 10/05/2026", "10 de maio de 2026", "10 mai 2026", "maio 10, 2026", a
// hora (22:00 ou 22h30) e o numero de serie das folhas de calculo. So o ano
// fica sem data (nao inventa um dia 1 de Janeiro errado).
function parseDataFolha(bruto: string): string | null {
  let s = (bruto ?? '').trim();
  if (!s) return null;

  // Hora, se existir. Nunca se inventa uma hora.
  let hora = '';
  const mh = s.match(/\b(\d{1,2})[:h](\d{2})\b|\b(\d{1,2})h\b/);
  if (mh) {
    const hh = doisDigitos(mh[1] ?? mh[3] ?? '0');
    const mm = doisDigitos(mh[2] ?? '00');
    if (Number(hh) < 24 && Number(mm) < 60) hora = `T${hh}:${mm}:00`;
    s = s.replace(mh[0], ' ').trim();
  }
  const comHora = (ymd: string) => `${ymd}${hora}`;

  // Tira um dia da semana no inicio, se existir (lista explicita para nao comer
  // o nome de um mes).
  s = s
    .replace(
      /^(seg|ter|qua|qui|sex|sab|sáb|dom|segunda|terca|terça|quarta|quinta|sexta|sabado|sábado|domingo|mon|tue|wed|thu|fri|sat|sun)(-feira)?\.?,?\s+/i,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return null;

  const noAno = (a: string) => (a.length === 2 ? `20${a}` : a);

  let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (m) return comHora(`${m[1]}-${doisDigitos(m[2])}-${doisDigitos(m[3])}`);

  m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2}|\d{4})$/);
  if (m) return comHora(`${noAno(m[3])}-${doisDigitos(m[2])}-${doisDigitos(m[1])}`);

  m = s.match(/^(\d{1,2})\s*(?:de\s+)?[-\s]?([a-zA-Zçãáéíóúâêô]{3,9})\.?\s*(?:de\s+)?[-\s]?(\d{2}|\d{4})$/i);
  if (m) {
    const mes = MESES[m[2].toLowerCase()];
    if (mes) return comHora(`${noAno(m[3])}-${doisDigitos(mes)}-${doisDigitos(m[1])}`);
  }

  m = s.match(/^([a-zA-Zçãáéíóúâêô]{3,9})\.?\s+(\d{1,2}),?\s+(\d{2}|\d{4})$/i);
  if (m) {
    const mes = MESES[m[1].toLowerCase()];
    if (mes) return comHora(`${noAno(m[3])}-${doisDigitos(mes)}-${doisDigitos(m[2])}`);
  }

  m = s.match(/^(\d{5})$/);
  if (m) {
    const serie = Number(m[1]);
    if (serie > 20000 && serie < 80000) {
      const d = new Date(Date.UTC(1899, 11, 30) + serie * 86400000);
      return comHora(d.toISOString().slice(0, 10));
    }
  }

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

  // Eventos existentes, para nao duplicar.
  const { data: evsData } = await supabase.from('eventos').select('id, evento, data');
  const existentes = (evsData ?? []) as { id: string; evento: string; data: string | null }[];
  const normalizar = (nome: string) => nome.trim().toLowerCase().replace(/\s+/g, ' ');
  const chave = (nome: string, data: string | null) => `${normalizar(nome)}|${data ? data.slice(0, 10) : ''}`;
  const mapaEventos = new Map<string, string>(existentes.map((e) => [chave(e.evento, e.data), e.id]));

  // Eventos com o mesmo nome mas ainda SEM data. Se a folha trouxer a data,
  // preenche-se a do evento que ja existe em vez de criar um duplicado. E o que
  // corrige de uma vez uma importacao anterior feita sem datas.
  const semData = new Map<string, string[]>();
  for (const e of existentes) {
    if (!e.data) {
      const n = normalizar(e.evento);
      semData.set(n, [...(semData.get(n) ?? []), e.id]);
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  let criados = 0;
  let jaExistiam = 0;
  let datasPreenchidas = 0;
  let recibosCriados = 0;
  let ignoradas = 0;
  let semDataReconhecida = 0;
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
    if (dataBruta.trim() && !data) semDataReconhecida++;

    // Concerto: 1) mesmo nome e data ja existe, nao mexe; 2) existe com o mesmo
    // nome mas sem data, preenche-lhe a data; 3) senao, cria.
    let eventoId = mapaEventos.get(chave(local, data));
    if (eventoId) jaExistiam++;

    if (!eventoId && data) {
      const candidatos = semData.get(normalizar(local)) ?? [];
      const porCorrigir = candidatos.shift();
      if (porCorrigir) {
        const { error } = await supabase.from('eventos').update({ data }).eq('id', porCorrigir);
        if (!error) {
          eventoId = porCorrigir;
          mapaEventos.set(chave(local, data), eventoId);
          datasPreenchidas++;
        }
      }
    }

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

  const partes = [`${criados} concertos criados`, `${jaExistiam} ja existiam`];
  if (datasPreenchidas > 0) partes.push(`${datasPreenchidas} datas preenchidas em concertos que estavam sem data`);
  partes.push(`${recibosCriados} recibos passados criados`);
  if (naoEncontrados.size > 0) {
    partes.push(`sem correspondencia na equipa: ${[...naoEncontrados].join(', ')} (adiciona-os em Equipa e volta a importar)`);
  }
  if (semDataReconhecida > 0) {
    partes.push(`${semDataReconhecida} linhas tinham data que nao consegui ler (ficam sem data; confirma o formato da coluna)`);
  }
  if (ignoradas > 0) partes.push(`${ignoradas} linhas ignoradas`);
  return partes.join('. ') + '.';
}
