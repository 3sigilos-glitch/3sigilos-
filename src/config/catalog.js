'use strict';

/**
 * Catalogo fixo da marca 3 Sigilos.
 * Centraliza modelos, tamanhos, tipos de preco, canais e metodos de pagamento.
 * Manter aqui torna simples adicionar ou alterar dados sem mexer no resto do codigo.
 */

// Modelos de t-shirt disponiveis no catalogo
const MODELOS = [
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

/**
 * Tipos de preco pre-definidos.
 * O valor pode ser nulo quando depende de configuracao (VIP) ou e manual (Personalizado).
 * Os valores por defeito vivem nas definicoes da aplicacao e podem ser alterados.
 */
const TIPOS_PRECO = [
  { id: 'normal', etiqueta: 'Normal', precoDefeito: 19 },
  { id: 'vip', etiqueta: 'VIP', precoDefeito: 15 },
  { id: 'terreiro', etiqueta: 'Terreiro', precoDefeito: 6 },
  { id: 'europa', etiqueta: 'Europa (portes incluidos)', precoDefeito: 33 },
  { id: 'personalizado', etiqueta: 'Personalizado', precoDefeito: null },
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
  preco_vip: 15, // preco unitario para clientes VIP
  preco_pack_tarot: 50, // preco do conjunto das 3 t-shirts do tarot
  iva_taxa: 23, // taxa de IVA aplicavel em percentagem
  meta_mensal: 1000, // meta de vendas mensal em euros
  dias_atraso_estampagem: 3, // dias apos pagamento sem estampagem atribuida
  dias_nao_pago: 7, // dias sem pagamento que geram alerta
  dias_sem_entrega: 7, // dias apos envio sem confirmacao de entrega
};

module.exports = {
  MODELOS,
  PACK_TAROT_MODELOS,
  TAMANHOS,
  TIPOS_PRECO,
  CANAIS,
  METODOS_PAGAMENTO,
  ESTADOS_ENTREGA,
  ESTADOS_PAGAMENTO,
  DEFINICOES_DEFEITO,
};
