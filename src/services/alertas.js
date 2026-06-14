'use strict';

const db = require('../db');
const definicoes = require('./definicoes');
const stock = require('./stock');

/**
 * Servico de alertas do dashboard.
 * Os alertas sao calculados em tempo real a partir do estado atual dos dados.
 * As marcacoes de resolvido ficam guardadas por uma chave estavel para nao reaparecerem.
 */

function diasDesde(dataTexto) {
  if (!dataTexto) return null;
  const data = new Date(dataTexto.replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return null;
  const agora = new Date();
  return Math.floor((agora - data) / (1000 * 60 * 60 * 24));
}

function estaResolvido(chave) {
  const linha = db
    .prepare('SELECT resolvido FROM alertas_estado WHERE chave = ?')
    .get(chave);
  return !!(linha && linha.resolvido);
}

function calcular() {
  const cfg = definicoes.obterTodas();
  const alertas = [];

  // 1. Atraso na estampagem: encomenda paga ha mais de X dias sem estampagem atribuida
  const limiteEstampagem = Number(cfg.dias_atraso_estampagem) || 3;
  const encParaEstampar = db
    .prepare(
      `SELECT * FROM encomendas
       WHERE estado_pagamento = 'Pago'
         AND estampagem_atribuida = 0
         AND estado_entrega != 'Entregue'`
    )
    .all();
  for (const enc of encParaEstampar) {
    const referencia = enc.data_pagamento || enc.criado_em;
    const dias = diasDesde(referencia);
    if (dias !== null && dias >= limiteEstampagem) {
      alertas.push({
        chave: `estampagem:${enc.id}`,
        tipo: 'estampagem',
        gravidade: 'alta',
        titulo: 'Atraso na estampagem',
        descricao: `Encomenda ${enc.id} de ${enc.cliente_nome} paga ha ${dias} dias sem estampagem atribuida.`,
        encomenda_id: enc.id,
      });
    }
  }

  // 2. Stock de t-shirts em branco abaixo do minimo
  for (const item of stock.brancoAbaixoMinimo()) {
    alertas.push({
      chave: `stock_branco:${item.id}:${item.quantidade}`,
      tipo: 'stock_branco',
      gravidade: 'media',
      titulo: 'Stock em branco baixo',
      descricao: `T-shirts em branco tamanho ${item.tamanho}: ${item.quantidade} em stock, minimo ${item.minimo}.`,
    });
  }

  // 3. Stock de t-shirts estampadas abaixo do minimo
  for (const item of stock.estampadoAbaixoMinimo()) {
    alertas.push({
      chave: `stock_estampado:${item.id}:${item.quantidade}`,
      tipo: 'stock_estampado',
      gravidade: 'media',
      titulo: 'Stock estampado baixo',
      descricao: `${item.modelo} tamanho ${item.tamanho}: ${item.quantidade} em stock, minimo ${item.minimo}.`,
    });
  }

  // 4. Encomendas nao pagas ha mais de X dias
  const limiteNaoPago = Number(cfg.dias_nao_pago) || 7;
  const naoPagas = db
    .prepare("SELECT * FROM encomendas WHERE estado_pagamento = 'Nao pago'")
    .all();
  for (const enc of naoPagas) {
    const dias = diasDesde(enc.criado_em);
    if (dias !== null && dias >= limiteNaoPago) {
      alertas.push({
        chave: `nao_pago:${enc.id}`,
        tipo: 'nao_pago',
        gravidade: 'alta',
        titulo: 'Encomenda nao paga',
        descricao: `Encomenda ${enc.id} de ${enc.cliente_nome} sem pagamento ha ${dias} dias.`,
        encomenda_id: enc.id,
      });
    }
  }

  // 5. Encomendas enviadas sem confirmacao de entrega apos X dias
  const limiteEntrega = Number(cfg.dias_sem_entrega) || 7;
  const enviadas = db
    .prepare("SELECT * FROM encomendas WHERE estado_entrega = 'Enviado'")
    .all();
  for (const enc of enviadas) {
    const dias = diasDesde(enc.data_envio);
    if (dias !== null && dias >= limiteEntrega) {
      alertas.push({
        chave: `sem_entrega:${enc.id}`,
        tipo: 'sem_entrega',
        gravidade: 'media',
        titulo: 'Envio sem confirmacao de entrega',
        descricao: `Encomenda ${enc.id} de ${enc.cliente_nome} enviada ha ${dias} dias sem confirmacao de entrega.`,
        encomenda_id: enc.id,
      });
    }
  }

  // Filtra os que ja foram marcados como resolvidos
  return alertas.filter((a) => !estaResolvido(a.chave));
}

function resolver(chave) {
  db.prepare(
    `INSERT INTO alertas_estado (chave, resolvido, resolvido_em)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(chave) DO UPDATE SET resolvido = 1, resolvido_em = datetime('now')`
  ).run(chave);
  return { ok: true };
}

function reativar(chave) {
  db.prepare('DELETE FROM alertas_estado WHERE chave = ?').run(chave);
  return { ok: true };
}

module.exports = { calcular, resolver, reativar };
