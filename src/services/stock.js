'use strict';

const db = require('../db');
const { TAMANHOS } = require('../config/catalog');

/**
 * Servico de gestao de stocks.
 * Separa t-shirts em branco (por cor e tamanho) de t-shirts estampadas
 * (por modelo, cor e tamanho).
 */

function listarBranco() {
  return db
    .prepare('SELECT * FROM stock_branco ORDER BY cor, tamanho')
    .all();
}

function listarEstampado() {
  return db
    .prepare('SELECT * FROM stock_estampado ORDER BY modelo, cor, tamanho')
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

// Soma uma quantidade ao stock estampado de um modelo, cor e tamanho (pode ser negativa)
function ajustarEstampado(modelo, cor, tamanho, delta) {
  const corFinal = cor || 'Cores';
  const linha = db
    .prepare('SELECT * FROM stock_estampado WHERE modelo = ? AND cor = ? AND tamanho = ?')
    .get(modelo, corFinal, tamanho);
  if (!linha) {
    db.prepare(
      'INSERT INTO stock_estampado (modelo, cor, tamanho, quantidade, minimo) VALUES (?, ?, ?, ?, 2)'
    ).run(modelo, corFinal, tamanho, Math.max(0, delta));
    return;
  }
  const nova = Math.max(0, linha.quantidade + delta);
  db.prepare(
    "UPDATE stock_estampado SET quantidade = ?, atualizado_em = datetime('now') WHERE id = ?"
  ).run(nova, linha.id);
}

// Soma uma quantidade ao stock em branco de uma cor e tamanho
function ajustarBranco(cor, tamanho, delta) {
  const corFinal = cor || 'Branca';
  const linha = db
    .prepare('SELECT * FROM stock_branco WHERE cor = ? AND tamanho = ?')
    .get(corFinal, tamanho);
  if (!linha) {
    db.prepare(
      'INSERT INTO stock_branco (cor, tamanho, quantidade, minimo) VALUES (?, ?, ?, 5)'
    ).run(corFinal, tamanho, Math.max(0, delta));
    return;
  }
  const nova = Math.max(0, linha.quantidade + delta);
  db.prepare(
    "UPDATE stock_branco SET quantidade = ?, atualizado_em = datetime('now') WHERE id = ?"
  ).run(nova, linha.id);
}

// Itens estampados abaixo do minimo configurado
function estampadoAbaixoMinimo() {
  return db
    .prepare(
      'SELECT * FROM stock_estampado WHERE quantidade < minimo ORDER BY modelo, cor, tamanho'
    )
    .all();
}

// Itens em branco abaixo do minimo configurado
function brancoAbaixoMinimo() {
  return db
    .prepare('SELECT * FROM stock_branco WHERE quantidade < minimo ORDER BY cor, tamanho')
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
  TAMANHOS,
};
