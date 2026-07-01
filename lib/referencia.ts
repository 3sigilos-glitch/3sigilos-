import type { TipoCliente } from '@/lib/tipos';

// Custo por defeito por peca, em euros. Fica sempre editavel na encomenda.
export const CUSTO_POR_DEFEITO = 4;

// Tabela de referencia de precos por peca, em euros:
//   comunidade ou terreiro ... 6
//   normal ................... 19
//   Pack Tarot ............... 50
// O Pack Tarot tem prioridade: seja qual for o cliente, a referencia e 50.
// O preco devolvido e apenas uma sugestao e fica sempre editavel.
export function precoReferencia(
  tipoCliente: TipoCliente | null | undefined,
  nomeDesenho: string | null | undefined
): number {
  if (nomeDesenho && nomeDesenho.trim().toLowerCase() === 'pack tarot') {
    return 50;
  }
  if (tipoCliente === 'Terreiro' || tipoCliente === 'Cliente marca') {
    return 6;
  }
  return 19;
}
