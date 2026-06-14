'use strict';

const db = require('../db');
const { DEFINICOES_DEFEITO } = require('../config/catalog');

/**
 * Servico de acesso as definicoes configuraveis da aplicacao.
 * As definicoes sao guardadas como texto e convertidas para numero quando aplicavel.
 */

function obterTodas() {
  const linhas = db.prepare('SELECT chave, valor FROM definicoes').all();
  const resultado = { ...DEFINICOES_DEFEITO };
  for (const linha of linhas) {
    const numero = Number(linha.valor);
    resultado[linha.chave] = Number.isNaN(numero) ? linha.valor : numero;
  }
  return resultado;
}

function obter(chave) {
  const linha = db.prepare('SELECT valor FROM definicoes WHERE chave = ?').get(chave);
  if (!linha) {
    return DEFINICOES_DEFEITO[chave];
  }
  const numero = Number(linha.valor);
  return Number.isNaN(numero) ? linha.valor : numero;
}

function guardar(chave, valor) {
  db.prepare(
    `INSERT INTO definicoes (chave, valor) VALUES (?, ?)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`
  ).run(chave, String(valor));
}

function guardarVarias(objeto) {
  const tx = db.transaction((entradas) => {
    for (const [chave, valor] of entradas) {
      guardar(chave, valor);
    }
  });
  tx(Object.entries(objeto));
  return obterTodas();
}

module.exports = { obterTodas, obter, guardar, guardarVarias };
