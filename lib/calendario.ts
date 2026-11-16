// Leitura do calendario Google dos N'ASA (formato iCal), so de leitura.
//
// Este ficheiro so tem funcoes puras (sem rede nem base de dados), para se
// poderem testar a parte: ler o iCal, separar indisponibilidades de concertos,
// perceber de que membro e cada indisponibilidade e comparar com a agenda da
// app para nunca sugerir um concerto que ja la esta.
//
// No calendario esta tudo misturado (concertos, indisponibilidades, ensaios,
// aniversarios), por isso a separacao e feita pelo titulo.

export const FUSO = 'Europe/Lisbon';

// ---------------------------------------------------------------------------
// Datas. Trabalha-se sempre com o dia em Portugal no formato AAAA-MM-DD.
// ---------------------------------------------------------------------------

function partesEmFuso(d: Date, fuso: string): { dia: string; hora: string } {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const p: Record<string, string> = {};
  for (const parte of f.formatToParts(d)) p[parte.type] = parte.value;
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

// Dia (em Portugal) de um instante.
export function diaEmPortugal(d: Date): string {
  return partesEmFuso(d, FUSO).dia;
}

export function hojeEmPortugal(): string {
  return diaEmPortugal(new Date());
}

export function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

// Instante real de uma hora "de parede" num dado fuso.
function instanteDeParede(a: number, m: number, d: number, h: number, min: number, fuso: string): Date {
  const palpite = Date.UTC(a, m - 1, d, h, min);
  const p = partesEmFuso(new Date(palpite), fuso);
  const [pa, pm, pd] = p.dia.split('-').map(Number);
  const [ph, pmin] = p.hora.split(':').map(Number);
  const desvio = Date.UTC(pa, pm - 1, pd, ph, pmin) - palpite;
  return new Date(palpite - desvio);
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

// "sab, 12 dez" ou "25 jul a 2 ago" (com o ano se nao for o corrente).
export function intervaloCurto(de: string, ate: string, hoje: string = hojeEmPortugal()): string {
  const [a1, m1, d1] = de.split('-').map(Number);
  const [a2, m2, d2] = ate.split('-').map(Number);
  const anoAtual = Number(hoje.slice(0, 4));
  const sufixo = (a: number) => (a !== anoAtual ? ` ${a}` : '');
  if (de === ate) {
    const semana = DIAS_CURTOS[new Date(Date.UTC(a1, m1 - 1, d1)).getUTCDay()];
    return `${semana}, ${d1} ${MESES_CURTOS[m1 - 1]}${sufixo(a1)}`;
  }
  const inicio = m1 === m2 && a1 === a2 ? `${d1}` : `${d1} ${MESES_CURTOS[m1 - 1]}${a1 !== a2 ? sufixo(a1) : ''}`;
  return `${inicio} a ${d2} ${MESES_CURTOS[m2 - 1]}${sufixo(a2)}`;
}

// "Dezembro 2026" a partir de AAAA-MM-DD.
export function mesAnoDoDia(dia: string): string {
  const [a, m] = dia.split('-').map(Number);
  return `${MESES_LONGOS[m - 1]} ${a}`;
}

// ---------------------------------------------------------------------------
// Leitura do iCal.
// ---------------------------------------------------------------------------

export interface EntradaCalendario {
  uid: string;
  titulo: string;
  descricao: string;
  local: string;
  de: string; // primeiro dia (Portugal), AAAA-MM-DD
  ate: string; // ultimo dia, inclusive
  hora: string | null; // "HH:MM" em Portugal; null se for de dia inteiro
  diaInteiro: boolean;
}

function limparTexto(v: string): string {
  return v
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

interface DataIcs {
  dia: string;
  hora: string | null;
}

function lerDataIcs(parametros: string, valor: string): DataIcs | null {
  const m = valor.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (m[4] === undefined) return { dia: `${m[1]}-${m[2]}-${m[3]}`, hora: null };

  const [h, min] = [Number(m[4]), Number(m[5])];
  const paredeLisboa: DataIcs = { dia: `${m[1]}-${m[2]}-${m[3]}`, hora: `${m[4]}:${m[5]}` };

  if (m[7] === 'Z') return partesEmFuso(new Date(Date.UTC(a, mes - 1, d, h, min)), FUSO);

  const tz = parametros.match(/TZID=([^;:]+)/i)?.[1]?.replace(/"/g, '');
  if (!tz || tz === FUSO) return paredeLisboa;
  try {
    return partesEmFuso(instanteDeParede(a, mes, d, h, min, tz), FUSO);
  } catch {
    // Fuso desconhecido: assume a hora tal como esta escrita.
    return paredeLisboa;
  }
}

export function lerIcs(texto: string): EntradaCalendario[] {
  // Linhas partidas continuam na linha seguinte com um espaco ou tab no inicio.
  const linhas = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '').split('\n');

  const entradas: EntradaCalendario[] = [];
  let atual: Record<string, { parametros: string; valor: string }> | null = null;
  let profundidade = 0; // blocos dentro do evento (alarmes), a ignorar

  for (const linha of linhas) {
    if (linha === 'BEGIN:VEVENT') {
      atual = {};
      profundidade = 0;
      continue;
    }
    if (!atual) continue;
    if (linha.startsWith('BEGIN:')) {
      profundidade++;
      continue;
    }
    if (linha.startsWith('END:') && linha !== 'END:VEVENT') {
      profundidade = Math.max(0, profundidade - 1);
      continue;
    }
    if (linha === 'END:VEVENT') {
      const e = atual;
      atual = null;

      // Ignora anulados e as excecoes de eventos repetidos.
      if ((e.STATUS?.valor ?? '').toUpperCase() === 'CANCELLED') continue;
      if (e['RECURRENCE-ID']) continue;
      if (!e.DTSTART) continue;

      const inicio = lerDataIcs(e.DTSTART.parametros, e.DTSTART.valor);
      if (!inicio) continue;
      const fim = e.DTEND ? lerDataIcs(e.DTEND.parametros, e.DTEND.valor) : null;
      const diaInteiro = inicio.hora === null;

      let ate = inicio.dia;
      if (fim && fim.dia > inicio.dia) {
        // Dia inteiro: o fim do iCal ja e o dia seguinte ao ultimo. Com hora:
        // se acaba de madrugada, conta como a noite do dia anterior.
        const acabaDeMadrugada = fim.hora !== null && fim.hora <= '06:00';
        ate = diaInteiro || acabaDeMadrugada ? somarDias(fim.dia, -1) : fim.dia;
        if (ate < inicio.dia) ate = inicio.dia;
      }

      entradas.push({
        uid: (e.UID?.valor ?? '').trim() || `${e.DTSTART.valor}|${e.SUMMARY?.valor ?? ''}`,
        titulo: limparTexto(e.SUMMARY?.valor ?? ''),
        descricao: limparTexto(e.DESCRIPTION?.valor ?? ''),
        local: limparTexto(e.LOCATION?.valor ?? ''),
        de: inicio.dia,
        ate,
        hora: inicio.hora,
        diaInteiro,
      });
      continue;
    }
    if (profundidade > 0) continue;

    const separador = linha.indexOf(':');
    if (separador < 1) continue;
    const esquerda = linha.slice(0, separador);
    const pontoVirgula = esquerda.indexOf(';');
    const nome = (pontoVirgula === -1 ? esquerda : esquerda.slice(0, pontoVirgula)).toUpperCase();
    const parametros = pontoVirgula === -1 ? '' : esquerda.slice(pontoVirgula + 1);
    if (!(nome in atual)) atual[nome] = { parametros, valor: linha.slice(separador + 1) };
  }

  return entradas;
}

// ---------------------------------------------------------------------------
// Classificacao pelo titulo.
// ---------------------------------------------------------------------------

// Minusculas, sem acentos.
export function normalizar(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function palavras(s: string): string[] {
  return normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);
}

// "indisponivel", "indisp", "ind." ou "off" (por exemplo "Kev indisp", "Marco off.").
const RE_INDISPONIVEL = /\bindisp[a-z]*|\bind\b\.?|\boff\b\.?/g;

export type TipoEntrada = 'indisponibilidade' | 'concerto' | 'anulado' | 'ignorar';

export function classificar(titulo: string): { tipo: TipoEntrada; provavel: boolean } {
  const t = normalizar(titulo).trim();
  if (!t) return { tipo: 'ignorar', provavel: false };

  // A indisponibilidade ganha a tudo ("Hugo indisponivel, concerto com os ...").
  RE_INDISPONIVEL.lastIndex = 0;
  if (RE_INDISPONIVEL.test(t)) return { tipo: 'indisponibilidade', provavel: true };

  if (/\banul|\bsem efeito\b|\bcancel/.test(t)) return { tipo: 'anulado', provavel: false };
  if (/\bensaio|\banivers|\bjantar\b|\balmoco\b|\breuniao\b/.test(t)) return { tipo: 'ignorar', provavel: false };

  // Concerto provavel: fala em N'ASA, concerto, festa, valor, tecnico, etc.
  const provavel =
    /\bn ?'? ?asa\b|\bconcerto|\bfesta|\bfechad|\breserva|\bcasamento|\btecnico|\btec\b|\bsom\b|\btasquinhas\b|\borcamento\b/.test(t) ||
    extrairValor(titulo) > 0;
  return { tipo: 'concerto', provavel };
}

// Valor do concerto escrito no titulo ("1150eur", "950€", "Barreira 1000 a 1150").
// Devolve o primeiro valor plausivel, ou 0.
export function extrairValor(texto: string): number {
  const t = normalizar(texto);
  // Pela ordem em que aparecem: o primeiro numero que pareca um cachet (ignora
  // horas, anos e valores pequenos como o extra de um tecnico).
  for (const m of Array.from(t.matchAll(/(^|[^\d:h.,])(\d{3,4})(?![\d:h])/g))) {
    const n = Number(m[2]);
    if (n >= 2020 && n <= 2035) continue; // e um ano
    if (n >= 200 && n <= 6000) return n;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Indisponibilidades: de quem e.
// ---------------------------------------------------------------------------

export interface MembroRef {
  id: string;
  nome: string;
}

const NAO_SAO_NOMES = new Set(['ind', 'off', 'indisponivel', 'indisp', 'com', 'dos', 'das', 'para', 'que', 'nao']);

// Um bocado de texto ("kev", "brites", "helder") corresponde a que membro?
function membroDaPalavra(palavra: string, equipa: MembroRef[]): MembroRef | null {
  if (palavra.length < 3 || NAO_SAO_NOMES.has(palavra)) return null;
  const partes = equipa.map((m) => ({ m, nomes: palavras(m.nome).filter((p) => p.length >= 3) }));

  const exatos = partes.filter((x) => x.nomes.includes(palavra));
  if (exatos.length === 1) return exatos[0].m;
  if (exatos.length > 1) return null; // ambiguo

  // Diminutivos: "kev" -> Kevin, "tiag" -> Tiago.
  const porInicio = partes.filter((x) => x.nomes.some((n) => n.startsWith(palavra)));
  return porInicio.length === 1 ? porInicio[0].m : null;
}

// Le os nomes escritos antes de cada "indisponivel". Aceita varios no mesmo
// titulo ("Tiago indisponivel torneio + Kevin indisponivel", "Kev e Hugo indisp").
export function identificarMembros(titulo: string, equipa: MembroRef[]): MembroRef[] {
  const t = normalizar(titulo);
  const encontrados = new Map<string, MembroRef>();
  const juntar = (bocado: string, ultimas: number, primeiras: number) => {
    let lista = palavras(bocado);
    if (ultimas) lista = lista.slice(-ultimas);
    if (primeiras) lista = lista.slice(0, primeiras);
    for (const p of lista) {
      const m = membroDaPalavra(p, equipa);
      if (m) encontrados.set(m.id, m);
    }
  };

  RE_INDISPONIVEL.lastIndex = 0;
  const marcas = Array.from(t.matchAll(RE_INDISPONIVEL));
  let anterior = 0;
  for (const marca of marcas) {
    // As (ate 3) palavras imediatamente antes de "indisponivel".
    juntar(t.slice(anterior, marca.index), 3, 0);
    anterior = (marca.index ?? 0) + marca[0].length;
  }
  // Sem nome antes ("Indisponivel Kevin"): tenta as primeiras palavras a seguir.
  if (encontrados.size === 0 && marcas.length > 0) juntar(t.slice(anterior), 0, 2);

  return Array.from(encontrados.values());
}

export interface Indisponibilidade {
  uid: string;
  titulo: string;
  de: string;
  ate: string;
  membros: MembroRef[]; // vazio = nao se percebeu de quem e
}

export function extrairIndisponibilidades(entradas: EntradaCalendario[], equipa: MembroRef[]): Indisponibilidade[] {
  const lista = entradas
    .filter((e) => classificar(e.titulo).tipo === 'indisponibilidade')
    .map((e) => ({
      uid: e.uid,
      titulo: e.titulo.replace(/\s+/g, ' ').trim(),
      de: e.de,
      ate: e.ate,
      membros: identificarMembros(e.titulo, equipa),
    }))
    .sort((a, b) => a.de.localeCompare(b.de) || a.ate.localeCompare(b.ate));

  // A mesma pessoa escrita duas vezes para os mesmos dias conta uma so vez.
  const vistas = new Set<string>();
  return lista.filter((i) => {
    if (i.membros.length === 0) return true;
    const chave = `${i.membros.map((m) => m.id).sort().join('+')}|${i.de}|${i.ate}`;
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });
}

export function indisponiveisNoDia(lista: Indisponibilidade[], dia: string): Indisponibilidade[] {
  return lista.filter((i) => i.de <= dia && dia <= i.ate);
}

// Nomes (sem repetir) de quem esta indisponivel num dia.
export function nomesIndisponiveis(lista: Indisponibilidade[], dia: string): string[] {
  const nomes = new Set<string>();
  for (const i of indisponiveisNoDia(lista, dia)) {
    if (i.membros.length === 0) nomes.add(`"${i.titulo}"`);
    for (const m of i.membros) nomes.add(m.nome);
  }
  return Array.from(nomes);
}

// ---------------------------------------------------------------------------
// Concertos escritos no calendario.
// ---------------------------------------------------------------------------

export interface ConcertoCalendario {
  uid: string;
  titulo: string; // tal como esta no calendario
  nome: string; // nome sugerido para o evento na app
  dia: string;
  hora: string | null;
  local: string;
  descricao: string;
  valor: number;
  estado: 'confirmado' | 'pre_reserva' | 'orcamentado';
  provavel: boolean;
}

// Nome curto para a app: o titulo ate ao valor ("Festa Barreira 1000 a 1150 Tome"
// -> "Festa Barreira"). O titulo completo fica sempre guardado nas notas.
export function nomeSugerido(titulo: string): string {
  const linha = (titulo.split('\n')[0] ?? '').replace(/\s+/g, ' ').trim();
  let nome = linha.replace(/^fechado\s*:?\s+/i, '');
  const valor = nome.match(/[-(\[]?\s*\b\d{3,4}\s*(?:eur|euros|€)?(?![\d:h])/i);
  if (valor && (valor.index ?? 0) > 0 && extrairValor(nome) > 0) nome = nome.slice(0, valor.index);
  nome = nome.replace(/[\s\-,.;:(\[]+$/g, '').trim();
  if (nome.length < 3) nome = linha;
  return nome.slice(0, 90);
}

function estadoSugerido(titulo: string): ConcertoCalendario['estado'] {
  const t = normalizar(titulo);
  if (/\borcamento\b/.test(t)) return 'orcamentado';
  if (/\?|\breserva\b|\bpossivel|\bpor confirmar\b|\btalvez\b/.test(t)) return 'pre_reserva';
  return 'confirmado';
}

export function extrairConcertos(entradas: EntradaCalendario[]): ConcertoCalendario[] {
  const lista: ConcertoCalendario[] = [];
  for (const e of entradas) {
    const c = classificar(e.titulo);
    if (c.tipo !== 'concerto') continue;
    lista.push({
      uid: e.uid,
      titulo: e.titulo.replace(/\s+/g, ' ').trim(),
      nome: nomeSugerido(e.titulo),
      dia: e.de,
      hora: e.hora,
      local: e.local.replace(/\s+/g, ' ').trim(),
      descricao: e.descricao,
      valor: extrairValor(`${e.titulo} ${e.descricao}`),
      estado: estadoSugerido(e.titulo),
      provavel: c.provavel,
    });
  }
  return lista.sort((a, b) => a.dia.localeCompare(b.dia));
}

// ---------------------------------------------------------------------------
// Comparacao com a agenda da app: evitar duplicados a todo o custo.
// ---------------------------------------------------------------------------

// Palavras que nao distinguem um concerto de outro.
const PALAVRAS_VAZIAS = new Set([
  'nasa', 'asa', 'festa', 'festas', 'concerto', 'concertos', 'fechado', 'fechada', 'reserva', 'com', 'sem',
  'dos', 'das', 'del', 'para', 'por', 'que', 'uma', 'nos', 'nas', 'tecnico', 'tec', 'som', 'luz', 'eur', 'euros',
  'nosso', 'deles', 'mais', 'brutos', 'email', 'whatsapp', 'pago', 'empresa', 'importado', 'calendario',
]);

function palavrasFortes(s: string): string[] {
  return palavras(s).filter((p) => p.length >= 3 && !/^\d+$/.test(p) && !PALAVRAS_VAZIAS.has(p));
}

// Dois nomes parecem o mesmo concerto? Basta partilharem uma palavra forte (por
// exemplo o local: "Barreira", "Cortes"). Se algum nao tiver palavras fortes,
// nao ha como distinguir e assume-se que sim (prefere-se nunca duplicar).
export function nomesParecidos(a: string, b: string): boolean {
  const pa = palavrasFortes(a);
  const pb = palavrasFortes(b);
  if (pa.length === 0 || pb.length === 0) return true;
  for (const x of pa) {
    for (const y of pb) {
      if (x === y) return true;
      const [curta, longa] = x.length <= y.length ? [x, y] : [y, x];
      if (curta.length >= 4 && longa.startsWith(curta)) return true;
      if (curta.length >= 5 && longa.slice(0, 5) === curta.slice(0, 5)) return true;
    }
  }
  return false;
}

export interface EventoApp {
  id: string;
  evento: string;
  local: string | null;
  concelho: string | null;
  data: string | null;
  estado: string;
  calendar_event_id: string | null;
}

// Dia de um evento da app (o que a app mostra). A app guarda a hora "de parede"
// tal como foi escrita, por isso o dia e simplesmente o inicio da data.
export function diaDoEvento(dataIso: string | null): string | null {
  if (!dataIso) return null;
  const d = new Date(dataIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function textoDoEvento(e: EventoApp): string {
  return `${e.evento} ${e.local ?? ''} ${e.concelho ?? ''}`;
}

// Procura na agenda um evento que ja corresponda a este concerto do calendario:
//   1. ja ligado a esta entrada do calendario;
//   2. no mesmo dia (ou no dia ao lado) e com nome ou local parecido.
// Devolve tambem um evento no mesmo dia com nome diferente, para avisar.
export function procurarNaAgenda(
  c: Pick<ConcertoCalendario, 'uid' | 'titulo' | 'local' | 'dia'>,
  eventos: EventoApp[]
): { igual: EventoApp | null; mesmoDia: EventoApp | null } {
  const ligado = eventos.find((e) => e.calendar_event_id && e.calendar_event_id === c.uid);
  if (ligado) return { igual: ligado, mesmoDia: null };

  const texto = `${c.titulo} ${c.local}`;
  const perto = [somarDias(c.dia, -1), c.dia, somarDias(c.dia, 1)];
  const noDia = eventos.filter((e) => diaDoEvento(e.data) === c.dia);
  // O dia ao lado tambem conta (um concerto que acaba de madrugada, ou alguem
  // que se enganou num dia ao escrever).
  const aoLado = eventos.filter((e) => perto.includes(diaDoEvento(e.data) ?? ''));

  const parecido =
    noDia.find((e) => nomesParecidos(texto, textoDoEvento(e))) ??
    aoLado.find((e) => nomesParecidos(texto, textoDoEvento(e)));
  if (parecido) return { igual: parecido, mesmoDia: null };

  return { igual: null, mesmoDia: noDia[0] ?? null };
}

export interface Cruzamento {
  novos: ConcertoCalendario[]; // dia livre na app: pode importar
  mesmoDia: { concerto: ConcertoCalendario; existente: EventoApp }[]; // ja ha outro evento nesse dia
  jaNaAgenda: number; // ja estao na app (nao se mostram)
}

export function cruzarComAgenda(concertos: ConcertoCalendario[], eventos: EventoApp[]): Cruzamento {
  const resultado: Cruzamento = { novos: [], mesmoDia: [], jaNaAgenda: 0 };
  for (const c of concertos) {
    const { igual, mesmoDia } = procurarNaAgenda(c, eventos);
    if (igual) resultado.jaNaAgenda++;
    else if (mesmoDia) resultado.mesmoDia.push({ concerto: c, existente: mesmoDia });
    else resultado.novos.push(c);
  }
  return resultado;
}

// Nome de um tecnico escrito no titulo ("com Nuno", "Tome no som").
export function tecnicoNoTitulo(titulo: string, tecnicos: MembroRef[]): MembroRef | null {
  const lista = palavras(titulo);
  const achados = tecnicos.filter((t) => {
    const primeiro = palavras(t.nome)[0];
    return !!primeiro && primeiro.length >= 3 && lista.includes(primeiro);
  });
  return achados.length === 1 ? achados[0] : null;
}
