'use strict';

const db = require('../db');
const definicoes = require('./definicoes');

/**
 * Servico de relatorios e indicadores financeiros.
 * Agrega vendas por canal, modelo e tamanho, calcula margem e metricas chave.
 */

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

// Devolve o intervalo de um mes no formato AAAA-MM
function intervaloMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  const inicio = `${ano}-${String(m).padStart(2, '0')}-01`;
  const proximo = m === 12 ? `${ano + 1}-01-01` : `${ano}-${String(m + 1).padStart(2, '0')}-01`;
  return { inicio, proximo };
}

/**
 * Resumo de um mes: total vendido, margem, contagem e distribuicoes.
 */
function resumoMensal(mes) {
  const { inicio, proximo } = intervaloMes(mes);
  const encomendas = db
    .prepare(
      `SELECT * FROM encomendas
       WHERE date(criado_em) >= date(?) AND date(criado_em) < date(?)`
    )
    .all(inicio, proximo);

  let totalVendas = 0;
  let totalMargem = 0;
  let totalPago = 0;
  const porCanal = {};
  const porModelo = {};
  const porTamanho = {};
  const temposEntrega = [];

  for (const enc of encomendas) {
    totalVendas += enc.preco_total || 0;
    totalMargem += enc.margem || 0;
    if (enc.estado_pagamento === 'Pago') {
      totalPago += enc.preco_total || 0;
    }

    const canal = enc.canal || 'Sem canal';
    porCanal[canal] = (porCanal[canal] || 0) + (enc.preco_total || 0);

    for (const item of parseItens(enc.itens)) {
      const qtd = Number(item.quantidade) || 0;
      if (item.modelo) porModelo[item.modelo] = (porModelo[item.modelo] || 0) + qtd;
      if (item.tamanho) porTamanho[item.tamanho] = (porTamanho[item.tamanho] || 0) + qtd;
    }

    // Tempo entre criacao e entrega
    if (enc.estado_entrega === 'Entregue' && enc.data_envio) {
      const criada = new Date(enc.criado_em.replace(' ', 'T'));
      const enviada = new Date(enc.data_envio.replace(' ', 'T'));
      if (!Number.isNaN(criada) && !Number.isNaN(enviada)) {
        const dias = Math.max(0, Math.round((enviada - criada) / (1000 * 60 * 60 * 24)));
        temposEntrega.push(dias);
      }
    }
  }

  const meta = Number(definicoes.obter('meta_mensal')) || 0;
  const tempoMedioEntrega = temposEntrega.length
    ? Number((temposEntrega.reduce((a, b) => a + b, 0) / temposEntrega.length).toFixed(1))
    : null;

  return {
    mes,
    numero_encomendas: encomendas.length,
    total_vendas: Number(totalVendas.toFixed(2)),
    total_pago: Number(totalPago.toFixed(2)),
    total_margem: Number(totalMargem.toFixed(2)),
    meta_mensal: meta,
    progresso_meta: meta ? Number(((totalVendas / meta) * 100).toFixed(1)) : 0,
    por_canal: ordenarObjeto(porCanal),
    por_modelo: ordenarObjeto(porModelo),
    por_tamanho: ordenarObjeto(porTamanho),
    modelo_mais_vendido: topChave(porModelo),
    tamanho_mais_pedido: topChave(porTamanho),
    canal_com_mais_vendas: topChave(porCanal),
    tempo_medio_entrega: tempoMedioEntrega,
  };
}

function ordenarObjeto(obj) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([chave, valor]) => ({ chave, valor: Number(valor.toFixed ? valor.toFixed(2) : valor) }));
}

function topChave(obj) {
  let melhor = null;
  let melhorValor = -Infinity;
  for (const [chave, valor] of Object.entries(obj)) {
    if (valor > melhorValor) {
      melhor = chave;
      melhorValor = valor;
    }
  }
  return melhor ? { chave: melhor, valor: melhorValor } : null;
}

module.exports = { resumoMensal };
