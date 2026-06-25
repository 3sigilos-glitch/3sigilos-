// Utilitarios de formatacao em portugues europeu.

const MESES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

// Valor em euros, ex: 1200 -> "1200 EUR". Sem casas quando e inteiro.
export function euros(valor: number | null | undefined): string {
  const n = Number(valor ?? 0);
  const formatado = Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
  return `${formatado} EUR`;
}

// Data por extenso curta, ex: "sab, 12 julho 2026".
export function dataExtenso(iso: string | null | undefined): string {
  if (!iso) return 'Sem data';
  const d = new Date(iso);
  return `${DIAS_SEMANA[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// Hora, ex: "21:30". Devolve vazio se a hora for meia-noite (sem hora definida).
export function hora(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Nome do mes e ano, ex: "Julho 2026".
export function mesAno(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const nome = MESES[d.getMonth()];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${d.getFullYear()}`;
}

// Contagem de dias a partir de hoje. Negativo no passado.
export function diasAte(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(iso);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

// Texto amigavel da contagem de dias, ex: "daqui a 5 dias", "hoje", "ha 3 dias".
export function textoDias(iso: string | null | undefined): string {
  const d = diasAte(iso);
  if (d === null) return '';
  if (d === 0) return 'hoje';
  if (d === 1) return 'amanha';
  if (d === -1) return 'ontem';
  if (d > 1) return `daqui a ${d} dias`;
  return `ha ${Math.abs(d)} dias`;
}

// Converte um valor datetime-local (sem fuso) para ISO, ou null.
export function deLocalParaIso(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Converte um ISO para o formato aceite por um input datetime-local.
export function deIsoParaLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
