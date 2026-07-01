// Utilitarios de formatacao em portugues europeu.

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Valor em euros, ex: 6 -> "6 EUR", 12.5 -> "12,50 EUR".
// Usamos a sigla EUR para manter o texto limpo e sem simbolos ambiguos.
export function euros(valor: number | null | undefined): string {
  const n = Number(valor ?? 0);
  const formatado = Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
  return `${formatado} EUR`;
}

// Data curta em portugues, ex: "12 jul 2026". Devolve vazio se nao houver data.
export function data(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

// Data de hoje no formato aceite por um input de data (AAAA-MM-DD).
export function hoje(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
