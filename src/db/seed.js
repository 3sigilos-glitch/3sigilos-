'use strict';

const db = require('./index');
const { criarEsquema } = require('./schema');
const {
  MODELOS,
  TAMANHOS,
  DEFINICOES_DEFEITO,
} = require('../config/catalog');

/**
 * Cria o esquema e preenche os dados base necessarios ao funcionamento:
 * definicoes por defeito, linhas de stock em branco por tamanho e
 * linhas de stock estampado por modelo e tamanho.
 * E seguro correr varias vezes, nunca apaga dados existentes.
 */
function semear() {
  criarEsquema();

  const inserirDefinicao = db.prepare(
    'INSERT OR IGNORE INTO definicoes (chave, valor) VALUES (?, ?)'
  );
  for (const [chave, valor] of Object.entries(DEFINICOES_DEFEITO)) {
    inserirDefinicao.run(chave, String(valor));
  }

  const inserirBranco = db.prepare(
    'INSERT OR IGNORE INTO stock_branco (tamanho, quantidade, minimo) VALUES (?, 0, 5)'
  );
  for (const tamanho of TAMANHOS) {
    inserirBranco.run(tamanho);
  }

  const inserirEstampado = db.prepare(
    'INSERT OR IGNORE INTO stock_estampado (modelo, tamanho, quantidade, minimo) VALUES (?, ?, 0, 2)'
  );
  const semearEstampado = db.transaction(() => {
    for (const modelo of MODELOS) {
      for (const tamanho of TAMANHOS) {
        inserirEstampado.run(modelo, tamanho);
      }
    }
  });
  semearEstampado();

  return { ok: true };
}

// Permite correr diretamente com `npm run seed`
if (require.main === module) {
  semear();
  console.log('Base de dados preparada com sucesso.');
}

module.exports = { semear };
