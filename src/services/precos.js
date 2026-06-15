'use strict';

const db = require('../db');
const definicoes = require('./definicoes');

/**
 * Motor de calculo de precos e margens.
 * Centraliza a logica para que o servidor seja sempre a fonte de verdade,
 * mesmo quando o navegador mostra uma pre-visualizacao.
 *
 * Os tipos de preco sao geridos na base de dados, o que permite alterar valores
 * e adicionar novos tipos (por exemplo, precos da marca do Colegio Rompe Mato)
 * sem mexer no codigo.
 */

/**
 * Devolve o preco unitario para um tipo de preco.
 * Tipos marcados como manuais usam o valor introduzido pelo utilizador.
 */
function precoUnitario(tipoPreco, precoManual) {
  const tipo = db.prepare('SELECT * FROM tipos_preco WHERE slug = ?').get(tipoPreco);
  if (!tipo) {
    // Tipo desconhecido, assume preco normal se existir, senao zero
    const normal = db.prepare("SELECT preco FROM tipos_preco WHERE slug = 'normal'").get();
    return normal ? Number(normal.preco) || 0 : 0;
  }
  if (tipo.manual) {
    return Number(precoManual) || 0;
  }
  return Number(tipo.preco) || 0;
}

/**
 * Conta o numero total de unidades a partir das linhas de itens.
 */
function totalUnidades(itens) {
  if (!Array.isArray(itens)) return 0;
  return itens.reduce((soma, item) => soma + (Number(item.quantidade) || 0), 0);
}

/**
 * Calcula todos os valores financeiros de uma encomenda.
 * Aceita itens estruturados, indicador de pack tarot, tipo de preco,
 * preco manual e desconto manual. Devolve preco total, custo e margem.
 */
function calcularEncomenda({ itens, isPackTarot, tipoPreco, precoManual, desconto }) {
  const cfg = definicoes.obterTodas();
  const custoProducao = Number(cfg.custo_producao) || 4;
  const unidades = totalUnidades(itens);
  const descontoNumero = Number(desconto) || 0;

  let unitario = 0;
  let subtotal = 0;

  if (isPackTarot) {
    // O Pack Tarot tem preco fixo de conjunto. Cada pack tem 3 t-shirts.
    const precoPack = Number(cfg.preco_pack_tarot) || 50;
    // Numero de packs assume-se pelas unidades divididas por 3, no minimo 1.
    const packs = Math.max(1, Math.round(unidades / 3) || 1);
    unitario = precoPack;
    subtotal = precoPack * packs;
  } else {
    unitario = precoUnitario(tipoPreco, precoManual);
    subtotal = unitario * unidades;
  }

  const precoTotal = Math.max(0, subtotal - descontoNumero);
  const custoTotal = custoProducao * unidades;
  const margem = precoTotal - custoTotal;

  return {
    precoUnitario: Number(unitario.toFixed(2)),
    unidades,
    subtotal: Number(subtotal.toFixed(2)),
    desconto: Number(descontoNumero.toFixed(2)),
    precoTotal: Number(precoTotal.toFixed(2)),
    custoTotal: Number(custoTotal.toFixed(2)),
    margem: Number(margem.toFixed(2)),
  };
}

module.exports = { precoUnitario, totalUnidades, calcularEncomenda };
