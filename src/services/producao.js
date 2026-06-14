'use strict';

const db = require('../db');
const stock = require('./stock');

/**
 * Servico de gestao de producao.
 * Regista pedidos de estampagem DTF e pedidos de t-shirts em branco ao fornecedor.
 * Quando um pedido e marcado como recebido, o stock correspondente e reposto.
 */

function desserializar(linha) {
  if (!linha) return null;
  return { ...linha, itens: parseItens(linha.itens) };
}

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

function listar(filtros = {}) {
  const condicoes = [];
  const params = [];
  if (filtros.tipo) {
    condicoes.push('tipo = ?');
    params.push(filtros.tipo);
  }
  if (filtros.estado) {
    condicoes.push('estado = ?');
    params.push(filtros.estado);
  }
  const where = condicoes.length ? 'WHERE ' + condicoes.join(' AND ') : '';
  return db
    .prepare(`SELECT * FROM producao ${where} ORDER BY data_prevista IS NULL, data_prevista, id DESC`)
    .all(...params)
    .map(desserializar);
}

function obter(id) {
  return desserializar(db.prepare('SELECT * FROM producao WHERE id = ?').get(id));
}

function criar(dados) {
  const info = db
    .prepare(
      `INSERT INTO producao (tipo, fornecedor, itens, data_pedido, data_prevista, estado, notas)
       VALUES (@tipo, @fornecedor, @itens, @data_pedido, @data_prevista, @estado, @notas)`
    )
    .run({
      tipo: dados.tipo || 'dtf_estampagem',
      fornecedor: dados.fornecedor || (dados.tipo === 'tshirts_branco' ? 'THC Ankara' : null),
      itens: JSON.stringify(dados.itens || []),
      data_pedido: dados.data_pedido || null,
      data_prevista: dados.data_prevista || null,
      estado: dados.estado || 'Pendente',
      notas: dados.notas || null,
    });
  return obter(info.lastInsertRowid);
}

function atualizar(id, dados) {
  const anterior = obter(id);
  if (!anterior) return null;

  db.prepare(
    `UPDATE producao SET
      tipo = @tipo, fornecedor = @fornecedor, itens = @itens,
      data_pedido = @data_pedido, data_prevista = @data_prevista,
      estado = @estado, notas = @notas, atualizado_em = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    tipo: dados.tipo !== undefined ? dados.tipo : anterior.tipo,
    fornecedor: dados.fornecedor !== undefined ? dados.fornecedor : anterior.fornecedor,
    itens: JSON.stringify(dados.itens !== undefined ? dados.itens : anterior.itens),
    data_pedido: dados.data_pedido !== undefined ? dados.data_pedido : anterior.data_pedido,
    data_prevista: dados.data_prevista !== undefined ? dados.data_prevista : anterior.data_prevista,
    estado: dados.estado !== undefined ? dados.estado : anterior.estado,
    notas: dados.notas !== undefined ? dados.notas : anterior.notas,
  });

  const atual = obter(id);
  // Repor stock quando o pedido passa a recebido pela primeira vez
  if (atual.estado === 'Recebido' && anterior.estado !== 'Recebido') {
    reporStock(atual);
    db.prepare("UPDATE producao SET recebido_em = datetime('now') WHERE id = ?").run(id);
  }
  return obter(id);
}

function reporStock(pedido) {
  const repor = db.transaction(() => {
    for (const item of pedido.itens) {
      const qtd = Number(item.quantidade) || 0;
      if (qtd <= 0) continue;
      if (pedido.tipo === 'tshirts_branco') {
        if (item.tamanho) stock.ajustarBranco(item.tamanho, qtd);
      } else {
        // Estampagem DTF gera t-shirts estampadas e consome t-shirts em branco
        if (item.modelo && item.tamanho) {
          stock.ajustarEstampado(item.modelo, item.tamanho, qtd);
          stock.ajustarBranco(item.tamanho, -qtd);
        }
      }
    }
  });
  repor();
}

function eliminar(id) {
  db.prepare('DELETE FROM producao WHERE id = ?').run(id);
  return { ok: true };
}

/**
 * Lista de trabalho diaria.
 * Reune o que precisa de ser estampado (encomendas pagas sem estampagem)
 * e o que precisa de ser embalado (encomendas por preparar ja estampadas).
 */
function listaTrabalhoDiaria() {
  const porEstampar = db
    .prepare(
      `SELECT * FROM encomendas
       WHERE estado_pagamento = 'Pago'
         AND estampagem_atribuida = 0
         AND estado_entrega != 'Entregue'
       ORDER BY COALESCE(data_pagamento, criado_em)`
    )
    .all()
    .map((e) => ({ ...e, itens: parseItens(e.itens) }));

  const porEmbalar = db
    .prepare(
      `SELECT * FROM encomendas
       WHERE estado_entrega = 'Por preparar'
         AND estado_pagamento = 'Pago'
       ORDER BY criado_em`
    )
    .all()
    .map((e) => ({ ...e, itens: parseItens(e.itens) }));

  return { por_estampar: porEstampar, por_embalar: porEmbalar };
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  eliminar,
  listaTrabalhoDiaria,
};
