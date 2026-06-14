'use strict';

const db = require('../db');

/**
 * Servico de gestao de clientes.
 * Inclui o calculo do historico de compras e do total gasto.
 */

function listar(pesquisa) {
  if (pesquisa) {
    const termo = '%' + pesquisa + '%';
    return db
      .prepare(
        `SELECT * FROM clientes
         WHERE nome LIKE ? OR contacto LIKE ? OR nif LIKE ?
         ORDER BY nome COLLATE NOCASE`
      )
      .all(termo, termo, termo);
  }
  return db.prepare('SELECT * FROM clientes ORDER BY nome COLLATE NOCASE').all();
}

function obter(id) {
  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  if (!cliente) return null;
  cliente.vip = !!cliente.vip;
  cliente.terreiro = !!cliente.terreiro;
  return cliente;
}

// Devolve o cliente com o historico de encomendas associado
function obterComHistorico(id) {
  const cliente = obter(id);
  if (!cliente) return null;
  const encomendas = db
    .prepare('SELECT * FROM encomendas WHERE cliente_id = ? ORDER BY criado_em DESC')
    .all(id);
  const totalGasto = encomendas
    .filter((e) => e.estado_pagamento === 'Pago')
    .reduce((s, e) => s + (e.preco_total || 0), 0);
  return {
    ...cliente,
    historico: encomendas.map((e) => ({
      ...e,
      itens: parseItens(e.itens),
    })),
    total_gasto: Number(totalGasto.toFixed(2)),
    numero_compras: encomendas.length,
  };
}

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

function criar(dados) {
  const info = db
    .prepare(
      `INSERT INTO clientes (nome, contacto, morada, nif, vip, terreiro, notas)
       VALUES (@nome, @contacto, @morada, @nif, @vip, @terreiro, @notas)`
    )
    .run({
      nome: dados.nome || 'Cliente sem nome',
      contacto: dados.contacto || null,
      morada: dados.morada || null,
      nif: dados.nif || null,
      vip: dados.vip ? 1 : 0,
      terreiro: dados.terreiro ? 1 : 0,
      notas: dados.notas || null,
    });
  return obter(info.lastInsertRowid);
}

function atualizar(id, dados) {
  const anterior = obter(id);
  if (!anterior) return null;
  db.prepare(
    `UPDATE clientes SET
      nome = @nome, contacto = @contacto, morada = @morada, nif = @nif,
      vip = @vip, terreiro = @terreiro, notas = @notas,
      atualizado_em = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    nome: dados.nome !== undefined ? dados.nome : anterior.nome,
    contacto: dados.contacto !== undefined ? dados.contacto : anterior.contacto,
    morada: dados.morada !== undefined ? dados.morada : anterior.morada,
    nif: dados.nif !== undefined ? dados.nif : anterior.nif,
    vip: (dados.vip !== undefined ? dados.vip : anterior.vip) ? 1 : 0,
    terreiro: (dados.terreiro !== undefined ? dados.terreiro : anterior.terreiro) ? 1 : 0,
    notas: dados.notas !== undefined ? dados.notas : anterior.notas,
  });
  return obter(id);
}

function eliminar(id) {
  db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  return { ok: true };
}

// Recalcula totais derivados. Mantido como ponto unico para futuras necessidades.
function recalcularTotais(id) {
  // Os totais sao calculados sob procura em obterComHistorico.
  // Esta funcao existe para centralizar o ponto de atualizacao.
  return obter(id);
}

/**
 * Sugere o tipo de preco a aplicar a um cliente segundo as marcacoes VIP e Terreiro.
 */
function tipoPrecoSugerido(cliente) {
  if (!cliente) return 'normal';
  if (cliente.terreiro) return 'terreiro';
  if (cliente.vip) return 'vip';
  return 'normal';
}

module.exports = {
  listar,
  obter,
  obterComHistorico,
  criar,
  atualizar,
  eliminar,
  recalcularTotais,
  tipoPrecoSugerido,
};
