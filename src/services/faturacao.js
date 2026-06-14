'use strict';

const db = require('../db');
const definicoes = require('./definicoes');

/**
 * Servico de faturacao.
 * Para cada encomenda paga prepara um resumo pronto para emitir fatura
 * no Portal das Financas, com separacao entre vendas Portugal e Europa.
 */

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

function descricaoItens(enc) {
  const itens = parseItens(enc.itens);
  if (itens.length) {
    return itens
      .map((i) => `${i.quantidade}x ${i.modelo} (${i.tamanho})`)
      .join(', ');
  }
  return enc.pedido_texto || 'T-shirt 3 Sigilos';
}

/**
 * Lista as linhas de faturacao das encomendas pagas, opcionalmente filtradas por mes e regiao.
 */
function listar({ mes, regiao } = {}) {
  const condicoes = ["estado_pagamento = 'Pago'"];
  const params = [];

  if (mes) {
    const [ano, m] = mes.split('-').map(Number);
    const inicio = `${ano}-${String(m).padStart(2, '0')}-01`;
    const proximo = m === 12 ? `${ano + 1}-01-01` : `${ano}-${String(m + 1).padStart(2, '0')}-01`;
    condicoes.push('date(COALESCE(data_pagamento, criado_em)) >= date(?)');
    condicoes.push('date(COALESCE(data_pagamento, criado_em)) < date(?)');
    params.push(inicio, proximo);
  }
  if (regiao) {
    condicoes.push('regiao = ?');
    params.push(regiao);
  }

  const encomendas = db
    .prepare(`SELECT * FROM encomendas WHERE ${condicoes.join(' AND ')} ORDER BY data_pagamento, id`)
    .all(...params);

  const ivaTaxa = Number(definicoes.obter('iva_taxa')) || 23;

  const linhas = encomendas.map((enc) => {
    const itens = parseItens(enc.itens);
    const unidades = itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0) || 1;
    const totalComIva = enc.preco_total || 0;
    // Decompoe o valor total em base tributavel e IVA (preco ja inclui IVA)
    const base = Number((totalComIva / (1 + ivaTaxa / 100)).toFixed(2));
    const valorIva = Number((totalComIva - base).toFixed(2));
    const cliente = enc.cliente_id
      ? db.prepare('SELECT nif FROM clientes WHERE id = ?').get(enc.cliente_id)
      : null;

    return {
      encomenda_id: enc.id,
      data: enc.data_pagamento || enc.criado_em,
      nome: enc.cliente_nome,
      nif: cliente && cliente.nif ? cliente.nif : '',
      descricao: descricaoItens(enc),
      quantidade: unidades,
      valor_unitario: Number((totalComIva / unidades).toFixed(2)),
      valor_total: Number(totalComIva.toFixed(2)),
      base_tributavel: base,
      iva_taxa: ivaTaxa,
      valor_iva: valorIva,
      regiao: enc.regiao || 'Portugal',
    };
  });

  const totais = {
    portugal: somaRegiao(linhas, 'Portugal'),
    europa: somaRegiao(linhas, 'Europa'),
    total: Number(linhas.reduce((s, l) => s + l.valor_total, 0).toFixed(2)),
  };

  return { linhas, totais, iva_taxa: ivaTaxa };
}

function somaRegiao(linhas, regiao) {
  const filtradas = linhas.filter((l) => l.regiao === regiao);
  return {
    numero: filtradas.length,
    base: Number(filtradas.reduce((s, l) => s + l.base_tributavel, 0).toFixed(2)),
    iva: Number(filtradas.reduce((s, l) => s + l.valor_iva, 0).toFixed(2)),
    total: Number(filtradas.reduce((s, l) => s + l.valor_total, 0).toFixed(2)),
  };
}

module.exports = { listar };
