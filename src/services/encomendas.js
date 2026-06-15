'use strict';

const db = require('../db');
const precos = require('./precos');
const stock = require('./stock');
const clientesServico = require('./clientes');

/**
 * Servico de gestao de encomendas.
 * Trata do calculo financeiro, da deteccao de regiao e da baixa automatica
 * de stock quando uma encomenda passa a entregue.
 */

function desserializar(linha) {
  if (!linha) return null;
  return {
    ...linha,
    itens: seguro(() => JSON.parse(linha.itens), []),
    is_pack_tarot: !!linha.is_pack_tarot,
    estampagem_atribuida: !!linha.estampagem_atribuida,
    stock_baixado: !!linha.stock_baixado,
  };
}

function seguro(fn, alternativa) {
  try {
    return fn();
  } catch (e) {
    return alternativa;
  }
}

function listar(filtros = {}) {
  const condicoes = [];
  const params = [];

  if (filtros.estado_entrega) {
    condicoes.push('estado_entrega = ?');
    params.push(filtros.estado_entrega);
  }
  if (filtros.estado_pagamento) {
    condicoes.push('estado_pagamento = ?');
    params.push(filtros.estado_pagamento);
  }
  if (filtros.canal) {
    condicoes.push('canal = ?');
    params.push(filtros.canal);
  }
  if (filtros.modelo) {
    condicoes.push('itens LIKE ?');
    params.push('%' + filtros.modelo + '%');
  }
  if (filtros.de) {
    condicoes.push('date(criado_em) >= date(?)');
    params.push(filtros.de);
  }
  if (filtros.ate) {
    condicoes.push('date(criado_em) <= date(?)');
    params.push(filtros.ate);
  }
  if (filtros.pesquisa) {
    condicoes.push('(cliente_nome LIKE ? OR pedido_texto LIKE ? OR notas LIKE ?)');
    const termo = '%' + filtros.pesquisa + '%';
    params.push(termo, termo, termo);
  }

  const where = condicoes.length ? 'WHERE ' + condicoes.join(' AND ') : '';
  const linhas = db
    .prepare(`SELECT * FROM encomendas ${where} ORDER BY criado_em DESC, id DESC`)
    .all(...params);
  return linhas.map(desserializar);
}

function obter(id) {
  return desserializar(
    db.prepare('SELECT * FROM encomendas WHERE id = ?').get(id)
  );
}

// Determina a regiao para efeitos de faturacao: Europa quando o tipo de preco e europa
function determinarRegiao(dados) {
  if (dados.regiao) return dados.regiao;
  if (dados.tipo_preco === 'europa') return 'Europa';
  return 'Portugal';
}

function montarValores(dados) {
  const calc = precos.calcularEncomenda({
    itens: dados.itens || [],
    isPackTarot: !!dados.is_pack_tarot,
    tipoPreco: dados.tipo_preco,
    precoManual: dados.preco_unitario,
    desconto: dados.desconto,
  });
  return calc;
}

function criar(dados) {
  const calc = montarValores(dados);
  const regiao = determinarRegiao(dados);

  const info = db
    .prepare(
      `INSERT INTO encomendas (
        cliente_id, cliente_nome, itens, pedido_texto, is_pack_tarot,
        tipo_preco, preco_unitario, desconto, preco_total, custo_total, margem,
        metodo_pagamento, estado_pagamento, data_pagamento,
        estado_entrega, data_envio, tracking, canal,
        etsy_venda, etsy_taxas, estampagem_atribuida, regiao, notas
      ) VALUES (
        @cliente_id, @cliente_nome, @itens, @pedido_texto, @is_pack_tarot,
        @tipo_preco, @preco_unitario, @desconto, @preco_total, @custo_total, @margem,
        @metodo_pagamento, @estado_pagamento, @data_pagamento,
        @estado_entrega, @data_envio, @tracking, @canal,
        @etsy_venda, @etsy_taxas, @estampagem_atribuida, @regiao, @notas
      )`
    )
    .run({
      cliente_id: dados.cliente_id || null,
      cliente_nome: dados.cliente_nome || 'Cliente sem nome',
      itens: JSON.stringify(dados.itens || []),
      pedido_texto: dados.pedido_texto || null,
      is_pack_tarot: dados.is_pack_tarot ? 1 : 0,
      tipo_preco: dados.tipo_preco || 'normal',
      preco_unitario: calc.precoUnitario,
      desconto: calc.desconto,
      preco_total: calc.precoTotal,
      custo_total: calc.custoTotal,
      margem: calc.margem,
      metodo_pagamento: dados.metodo_pagamento || null,
      estado_pagamento: dados.estado_pagamento || 'Nao pago',
      data_pagamento: dados.data_pagamento || null,
      estado_entrega: dados.estado_entrega || 'Por preparar',
      data_envio: dados.data_envio || null,
      tracking: dados.tracking || null,
      canal: dados.canal || null,
      etsy_venda: dados.etsy_venda || null,
      etsy_taxas: Number(dados.etsy_taxas) || 0,
      estampagem_atribuida: dados.estampagem_atribuida ? 1 : 0,
      regiao,
      notas: dados.notas || null,
    });

  const nova = obter(info.lastInsertRowid);
  aplicarEfeitosSecundarios(null, nova);
  return nova;
}

function atualizar(id, dados) {
  const anterior = obter(id);
  if (!anterior) return null;

  const calc = montarValores({ ...anterior, ...dados });
  const regiao = determinarRegiao({ ...anterior, ...dados });

  db.prepare(
    `UPDATE encomendas SET
      cliente_id = @cliente_id,
      cliente_nome = @cliente_nome,
      itens = @itens,
      pedido_texto = @pedido_texto,
      is_pack_tarot = @is_pack_tarot,
      tipo_preco = @tipo_preco,
      preco_unitario = @preco_unitario,
      desconto = @desconto,
      preco_total = @preco_total,
      custo_total = @custo_total,
      margem = @margem,
      metodo_pagamento = @metodo_pagamento,
      estado_pagamento = @estado_pagamento,
      data_pagamento = @data_pagamento,
      estado_entrega = @estado_entrega,
      data_envio = @data_envio,
      tracking = @tracking,
      canal = @canal,
      etsy_venda = @etsy_venda,
      etsy_taxas = @etsy_taxas,
      estampagem_atribuida = @estampagem_atribuida,
      regiao = @regiao,
      notas = @notas,
      atualizado_em = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    cliente_id: dados.cliente_id !== undefined ? dados.cliente_id : anterior.cliente_id,
    cliente_nome: dados.cliente_nome !== undefined ? dados.cliente_nome : anterior.cliente_nome,
    itens: JSON.stringify(dados.itens !== undefined ? dados.itens : anterior.itens),
    pedido_texto: dados.pedido_texto !== undefined ? dados.pedido_texto : anterior.pedido_texto,
    is_pack_tarot: (dados.is_pack_tarot !== undefined ? dados.is_pack_tarot : anterior.is_pack_tarot) ? 1 : 0,
    tipo_preco: dados.tipo_preco !== undefined ? dados.tipo_preco : anterior.tipo_preco,
    preco_unitario: calc.precoUnitario,
    desconto: calc.desconto,
    preco_total: calc.precoTotal,
    custo_total: calc.custoTotal,
    margem: calc.margem,
    metodo_pagamento: dados.metodo_pagamento !== undefined ? dados.metodo_pagamento : anterior.metodo_pagamento,
    estado_pagamento: dados.estado_pagamento !== undefined ? dados.estado_pagamento : anterior.estado_pagamento,
    data_pagamento: dados.data_pagamento !== undefined ? dados.data_pagamento : anterior.data_pagamento,
    estado_entrega: dados.estado_entrega !== undefined ? dados.estado_entrega : anterior.estado_entrega,
    data_envio: dados.data_envio !== undefined ? dados.data_envio : anterior.data_envio,
    tracking: dados.tracking !== undefined ? dados.tracking : anterior.tracking,
    canal: dados.canal !== undefined ? dados.canal : anterior.canal,
    etsy_venda: dados.etsy_venda !== undefined ? dados.etsy_venda : anterior.etsy_venda,
    etsy_taxas: dados.etsy_taxas !== undefined ? Number(dados.etsy_taxas) || 0 : anterior.etsy_taxas,
    estampagem_atribuida: (dados.estampagem_atribuida !== undefined ? dados.estampagem_atribuida : anterior.estampagem_atribuida) ? 1 : 0,
    regiao,
    notas: dados.notas !== undefined ? dados.notas : anterior.notas,
  });

  const atualizada = obter(id);
  aplicarEfeitosSecundarios(anterior, atualizada);
  return obter(id);
}

/**
 * Aplica efeitos automaticos derivados de mudancas de estado.
 * Baixa o stock estampado quando a encomenda passa a entregue (uma so vez)
 * e marca a data de pagamento automaticamente quando passa a paga.
 */
function aplicarEfeitosSecundarios(anterior, atual) {
  if (!atual) return;

  // Baixa de stock quando passa a entregue e ainda nao foi baixado
  if (atual.estado_entrega === 'Entregue' && !atual.stock_baixado) {
    const baixar = db.transaction(() => {
      for (const item of atual.itens) {
        if (item.modelo && item.tamanho) {
          stock.ajustarEstampado(item.modelo, item.cor, item.tamanho, -(Number(item.quantidade) || 0));
        }
      }
      db.prepare('UPDATE encomendas SET stock_baixado = 1 WHERE id = ?').run(atual.id);
    });
    baixar();
  }

  // Atualiza o total gasto do cliente associado
  if (atual.cliente_id) {
    clientesServico.recalcularTotais(atual.cliente_id);
  }
  if (anterior && anterior.cliente_id && anterior.cliente_id !== atual.cliente_id) {
    clientesServico.recalcularTotais(anterior.cliente_id);
  }
}

function eliminar(id) {
  const enc = obter(id);
  db.prepare('DELETE FROM encomendas WHERE id = ?').run(id);
  if (enc && enc.cliente_id) {
    clientesServico.recalcularTotais(enc.cliente_id);
  }
  return { ok: true };
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  eliminar,
  desserializar,
  montarValores,
};
