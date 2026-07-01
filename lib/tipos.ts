// Tipos do dominio da 3 Sigilos, a espelhar o esquema da base de dados.
// Servem para acesso tipado ao Supabase e para reutilizar os rotulos em PT-PT.

export type Tamanho = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type CategoriaDesenho =
  | 'Umbanda'
  | 'Tarot'
  | 'Mitologia'
  | 'Oculto'
  | 'Personalizado de cliente';

export type EstadoDesenho = 'Pronto a estampar' | 'Por testar em DTF' | 'Só ideia';

export type TipoCliente = 'Normal' | 'Terreiro' | 'Pontual' | 'Cliente marca';

export type MetodoPagamento = 'Transferência' | 'MB Way' | 'Paypal' | 'Dinheiro';

export type EstadoEncomenda = 'Por estampar' | 'Entregue';

export interface TshirtBranca {
  id: string;
  cor: string;
  tamanho: Tamanho;
  quantidade: number;
  minimo: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Desenho {
  id: string;
  nome: string;
  categoria: CategoriaDesenho;
  estado: EstadoDesenho;
  descricao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Cliente {
  id: string;
  nome: string;
  contacto: string | null;
  tipo: TipoCliente;
  morada: string | null;
  nif: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Encomenda {
  id: string;
  data: string;
  cliente_id: string | null;
  desenho_id: string | null;
  descricao_livre: string | null;
  cor: string | null;
  tamanho: Tamanho | null;
  quantidade: number;
  preco: number;
  custo: number;
  metodo_pagamento: MetodoPagamento | null;
  pago: boolean;
  data_pagamento: string | null;
  estado: EstadoEncomenda;
  faturado: boolean;
  data_faturacao: string | null;
  notas: string | null;
  stock_abatido: boolean;
  total: number; // calculado pela base de dados
  margem: number; // calculado pela base de dados
  criado_em: string;
  atualizado_em: string;
}

// Encomenda com os dados do cliente e do desenho ja resolvidos (para listagens).
export interface EncomendaComRelacoes extends Encomenda {
  cliente: Pick<Cliente, 'id' | 'nome' | 'nif' | 'tipo'> | null;
  desenho: Pick<Desenho, 'id' | 'nome'> | null;
}

// -----------------------------------------------------------------------------
// Listas de opcoes, reutilizadas nos formularios e nos filtros.
// -----------------------------------------------------------------------------

export const TAMANHOS: Tamanho[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const CATEGORIAS_DESENHO: CategoriaDesenho[] = [
  'Umbanda',
  'Tarot',
  'Mitologia',
  'Oculto',
  'Personalizado de cliente',
];

export const ESTADOS_DESENHO: EstadoDesenho[] = [
  'Pronto a estampar',
  'Por testar em DTF',
  'Só ideia',
];

export const TIPOS_CLIENTE: TipoCliente[] = ['Normal', 'Terreiro', 'Pontual', 'Cliente marca'];

export const METODOS_PAGAMENTO: MetodoPagamento[] = [
  'Transferência',
  'MB Way',
  'Paypal',
  'Dinheiro',
];

export const ESTADOS_ENCOMENDA: EstadoEncomenda[] = ['Por estampar', 'Entregue'];

// Cor (token do Tailwind) de cada estado, para as etiquetas visuais.
export const COR_ESTADO_DESENHO: Record<EstadoDesenho, string> = {
  'Pronto a estampar': 'text-estado-ok',
  'Por testar em DTF': 'text-estado-aviso',
  'Só ideia': 'text-texto-suave',
};

export const COR_ESTADO_ENCOMENDA: Record<EstadoEncomenda, string> = {
  'Por estampar': 'text-estado-aviso',
  Entregue: 'text-estado-ok',
};
