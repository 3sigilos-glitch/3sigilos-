'use strict';

/**
 * Catalogo base da marca 3 Sigilos e da marca do Colegio Rompe Mato.
 *
 * Os modelos de desenho, as cores de t-shirt e os tipos de preco passaram a ser
 * geridos na base de dados, para que seja possivel adicionar, editar e remover
 * pela interface. Os valores aqui definidos servem apenas para preencher a base
 * de dados no primeiro arranque.
 */

// Marcas conhecidas. Servem de sugestao, e possivel usar outras.
const MARCAS = ['3 Sigilos', 'Colegio Rompe Mato'];

// Modelos de desenho iniciais da 3 Sigilos
const MODELOS_DEFEITO = [
  'Exu Guardiao',
  'Pombagira Guardia',
  'Celestial Balance',
  'Ciclo Eterno',
  'Mitologia Nordica',
  'Ouija',
  'Cards Never Lie',
  'Forca Draconiana',
  'Ze Pilintra',
  'Maria Navalha',
  'Hecate',
  'Roda da Fortuna',
  'A Estrela',
  'O Mundo',
];

// Modelos que compoem o Pack Tarot
const PACK_TAROT_MODELOS = ['Roda da Fortuna', 'A Estrela', 'O Mundo'];

// Tamanhos aplicaveis a todos os modelos
const TAMANHOS = ['S', 'M', 'L', 'XL', 'XXL'];

// Cores de t-shirt iniciais
const CORES_DEFEITO = ['Branca', 'Cores'];

/**
 * Tipos de preco iniciais.
 * preco a null significa que o valor e introduzido manualmente (personalizado).
 */
const TIPOS_PRECO_DEFEITO = [
  { slug: 'normal', etiqueta: 'Normal', preco: 19, manual: 0, ordem: 1 },
  { slug: 'vip', etiqueta: 'VIP', preco: 12, manual: 0, ordem: 2 },
  { slug: 'terreiro', etiqueta: 'Terreiro', preco: 6, manual: 0, ordem: 3 },
  { slug: 'europa', etiqueta: 'Europa (portes incluidos)', preco: 33, manual: 0, ordem: 4 },
  { slug: 'rm_cores', etiqueta: 'Rompe Mato cores', preco: 6, manual: 0, ordem: 5 },
  { slug: 'rm_branca', etiqueta: 'Rompe Mato branca', preco: 5, manual: 0, ordem: 6 },
  { slug: 'personalizado', etiqueta: 'Personalizado', preco: null, manual: 1, ordem: 99 },
];

// Canais de origem das encomendas
const CANAIS = ['Instagram', 'Facebook', 'Etsy', 'Terreiro', 'Outro'];

// Metodos de pagamento aceites
const METODOS_PAGAMENTO = ['Transferencia', 'MB Way', 'Paypal', 'Etsy', 'Dinheiro'];

// Estados de entrega possiveis
const ESTADOS_ENTREGA = ['Por preparar', 'Enviado', 'Entregue'];

// Estados de pagamento possiveis
const ESTADOS_PAGAMENTO = ['Nao pago', 'Pago'];

// Valores por defeito das definicoes configuraveis
const DEFINICOES_DEFEITO = {
  custo_producao: 4, // custo base por t-shirt em euros
  preco_pack_tarot: 50, // preco do conjunto das 3 t-shirts do tarot
  iva_taxa: 23, // taxa de IVA aplicavel em percentagem
  meta_mensal: 1000, // meta de vendas mensal em euros
  dias_atraso_estampagem: 3, // dias apos pagamento sem estampagem atribuida
  dias_nao_pago: 7, // dias sem pagamento que geram alerta
  dias_sem_entrega: 7, // dias apos envio sem confirmacao de entrega
};

module.exports = {
  MARCAS,
  MODELOS_DEFEITO,
  PACK_TAROT_MODELOS,
  TAMANHOS,
  CORES_DEFEITO,
  TIPOS_PRECO_DEFEITO,
  CANAIS,
  METODOS_PAGAMENTO,
  ESTADOS_ENTREGA,
  ESTADOS_PAGAMENTO,
  DEFINICOES_DEFEITO,
};
