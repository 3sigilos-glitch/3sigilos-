'use strict';

const db = require('../db');
const { MODELOS, TAMANHOS } = require('../config/catalog');

/**
 * Servico de gestao de stocks.
 * Separa t-shirts em branco (por tamanho) de t-shirts estampadas (por modelo e tamanho).
 */

function listarBranco() {
  return db
    .prepare('SELECT * FROM stock_branco ORDER BY id')
    .all();
}

function listarEstampado() {
  return db
    .prepare('SELECT * FROM stock_estampado ORDER BY modelo, tamanho')
    .all();
}

function atualizarBranco(id, { quantidade, minimo }) {
  db.prepare(
    `UPDATE stock_branco
     SET quantidade = COALESCE(?, quantidade),
         minimo = COALESCE(?, minimo),
         atualizado_em = datetime('now')
     WHERE id = ?`
  ).run(
    quantidade === undefined ? null : Number(quantidade),
    minimo === undefined ? null : Number(minimo),
    id
  );
  return db.prepare('SELECT * FROM stock_branco WHERE id = ?').get(id);
}

function atualizarEstampado(id, { quantidade, minimo }) {
  db.prepare(
    `UPDATE stock_estampado
     SET quantidade = COALESCE(?, quantidade),
         minimo = COALESCE(?, minimo),
         atualizado_em = datetime('now')
     WHERE id = ?`
  ).run(
    quantidade === undefined ? null : Number(quantidade),
    minimo === undefined ? null : Number(minimo),
    id
  );
  return db.prepare('SELECT * FROM stock_estampado WHERE id = ?').get(id);
}

// Soma uma quantidade ao stock estampado de um modelo e tamanho (pode ser negativa)
function ajustarEstampado(modelo, tamanho, delta) {
  const linha = db
    .prepare('SELECT * FROM stock_estampado WHERE modelo = ? AND tamanho = ?')
    .get(modelo, tamanho);
  if (!linha) {
    // Cria a linha caso ainda nao exista
    db.prepare(
      'INSERT INTO stock_estampado (modelo, tamanho, quantidade, minimo) VALUES (?, ?, ?, 2)'
    ).run(modelo, tamanho, Math.max(0, delta));
    return;
  }
  const nova = Math.max(0, linha.quantidade + delta);
  db.prepare(
    "UPDATE stock_estampado SET quantidade = ?, atualizado_em = datetime('now') WHERE id = ?"
  ).run(nova, linha.id);
}

// Soma uma quantidade ao stock em branco de um tamanho
function ajustarBranco(tamanho, delta) {
  const linha = db
    .prepare('SELECT * FROM stock_branco WHERE tamanho = ?')
    .get(tamanho);
  if (!linha) return;
  const nova = Math.max(0, linha.quantidade + delta);
  db.prepare(
    "UPDATE stock_branco SET quantidade = ?, atualizado_em = datetime('now') WHERE id = ?"
  ).run(nova, linha.id);
}

// Itens estampados abaixo do minimo configurado
function estampadoAbaixoMinimo() {
  return db
    .prepare(
      'SELECT * FROM stock_estampado WHERE quantidade < minimo ORDER BY modelo, tamanho'
    )
    .all();
}

// Itens em branco abaixo do minimo configurado
function brancoAbaixoMinimo() {
  return db
    .prepare('SELECT * FROM stock_branco WHERE quantidade < minimo ORDER BY id')
    .all();
}

module.exports = {
  listarBranco,
  listarEstampado,
  atualizarBranco,
  atualizarEstampado,
  ajustarEstampado,
  ajustarBranco,
  estampadoAbaixoMinimo,
  brancoAbaixoMinimo,
  MODELOS,
  TAMANHOS,
};
