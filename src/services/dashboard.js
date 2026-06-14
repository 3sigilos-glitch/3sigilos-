'use strict';

const db = require('../db');
const definicoes = require('./definicoes');
const alertas = require('./alertas');
const stock = require('./stock');

/**
 * Servico do dashboard principal.
 * Reune os indicadores resumidos apresentados no ecra inicial.
 */

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

function resumo() {
  const encomendasPendentes = db
    .prepare("SELECT COUNT(*) AS n FROM encomendas WHERE estado_entrega != 'Entregue'")
    .get().n;

  const porEnviar = db
    .prepare("SELECT COUNT(*) AS n FROM encomendas WHERE estado_entrega = 'Por preparar'")
    .get().n;

  const naoPagas = db
    .prepare("SELECT COUNT(*) AS n FROM encomendas WHERE estado_pagamento = 'Nao pago'")
    .get();
  const totalNaoPagasNumero = db
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(preco_total),0) AS total FROM encomendas WHERE estado_pagamento = 'Nao pago'")
    .get();

  const totalAReceber = totalNaoPagasNumero.total;

  // Vendas do mes para a barra de progresso da meta
  const mes = mesAtual();
  const inicio = `${mes}-01`;
  const vendasMes = db
    .prepare(
      "SELECT COALESCE(SUM(preco_total),0) AS total FROM encomendas WHERE date(criado_em) >= date(?)"
    )
    .get(inicio).total;
  const meta = Number(definicoes.obter('meta_mensal')) || 0;

  const stockCritico =
    stock.brancoAbaixoMinimo().length + stock.estampadoAbaixoMinimo().length;

  const alertasAtivos = alertas.calcular();

  const recentes = db
    .prepare('SELECT * FROM encomendas ORDER BY criado_em DESC, id DESC LIMIT 10')
    .all()
    .map((e) => ({ ...e, itens: parseItens(e.itens) }));

  return {
    encomendas_pendentes: encomendasPendentes,
    total_a_receber: Number(totalAReceber.toFixed(2)),
    encomendas_nao_pagas: totalNaoPagasNumero.n,
    encomendas_por_enviar: porEnviar,
    stock_critico: stockCritico,
    vendas_mes: Number(vendasMes.toFixed(2)),
    meta_mensal: meta,
    progresso_meta: meta ? Number(((vendasMes / meta) * 100).toFixed(1)) : 0,
    alertas_ativos: alertasAtivos,
    numero_alertas: alertasAtivos.length,
    encomendas_recentes: recentes,
  };
}

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

module.exports = { resumo };
