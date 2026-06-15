'use strict';

const db = require('./index');
const { criarEsquema } = require('./schema');
const {
  MODELOS_DEFEITO,
  CORES_DEFEITO,
  TIPOS_PRECO_DEFEITO,
  TAMANHOS,
  DEFINICOES_DEFEITO,
} = require('../config/catalog');

function tabelaExiste(nome) {
  return !!db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(nome);
}

function temColuna(tabela, coluna) {
  return db
    .prepare(`PRAGMA table_info(${tabela})`)
    .all()
    .some((c) => c.name === coluna);
}

/**
 * Migra bases de dados anteriores que ainda nao tinham a dimensao de cor no stock.
 * Renomeia as tabelas antigas para depois copiar os dados para o novo formato,
 * preservando as quantidades e minimos ja registados.
 */
function prepararMigracao() {
  if (tabelaExiste('stock_branco') && !temColuna('stock_branco', 'cor')) {
    db.exec('ALTER TABLE stock_branco RENAME TO stock_branco_legado');
  }
  if (tabelaExiste('stock_estampado') && !temColuna('stock_estampado', 'cor')) {
    db.exec('ALTER TABLE stock_estampado RENAME TO stock_estampado_legado');
  }
}

function concluirMigracao() {
  if (tabelaExiste('stock_branco_legado')) {
    db.exec(
      `INSERT OR IGNORE INTO stock_branco (cor, tamanho, quantidade, minimo)
       SELECT 'Branca', tamanho, quantidade, minimo FROM stock_branco_legado`
    );
    db.exec('DROP TABLE stock_branco_legado');
  }
  if (tabelaExiste('stock_estampado_legado')) {
    db.exec(
      `INSERT OR IGNORE INTO stock_estampado (modelo, cor, tamanho, quantidade, minimo)
       SELECT modelo, 'Cores', tamanho, quantidade, minimo FROM stock_estampado_legado`
    );
    db.exec('DROP TABLE stock_estampado_legado');
  }
}

/**
 * Garante as linhas de stock para todas as combinacoes de cores, modelos e tamanhos ativos.
 * Nunca apaga linhas existentes, apenas cria as que faltam.
 */
function semearStock() {
  const cores = db.prepare('SELECT nome FROM cores WHERE ativo = 1').all().map((c) => c.nome);
  const modelos = db.prepare('SELECT nome FROM modelos WHERE ativo = 1').all().map((m) => m.nome);

  const inserirBranco = db.prepare(
    'INSERT OR IGNORE INTO stock_branco (cor, tamanho, quantidade, minimo) VALUES (?, ?, 0, 5)'
  );
  const inserirEstampado = db.prepare(
    'INSERT OR IGNORE INTO stock_estampado (modelo, cor, tamanho, quantidade, minimo) VALUES (?, ?, ?, 0, 2)'
  );

  const tx = db.transaction(() => {
    for (const cor of cores) {
      for (const tamanho of TAMANHOS) {
        inserirBranco.run(cor, tamanho);
      }
    }
    for (const modelo of modelos) {
      for (const cor of cores) {
        for (const tamanho of TAMANHOS) {
          inserirEstampado.run(modelo, cor, tamanho);
        }
      }
    }
  });
  tx();
}

/**
 * Cria o esquema e preenche os dados base necessarios ao funcionamento.
 * E seguro correr varias vezes, nunca apaga dados existentes do utilizador.
 */
function semear() {
  prepararMigracao();
  criarEsquema();
  concluirMigracao();

  // Definicoes por defeito
  const inserirDefinicao = db.prepare(
    'INSERT OR IGNORE INTO definicoes (chave, valor) VALUES (?, ?)'
  );
  for (const [chave, valor] of Object.entries(DEFINICOES_DEFEITO)) {
    inserirDefinicao.run(chave, String(valor));
  }

  // Modelos de desenho iniciais da 3 Sigilos
  const inserirModelo = db.prepare(
    "INSERT OR IGNORE INTO modelos (nome, marca, ativo) VALUES (?, '3 Sigilos', 1)"
  );
  for (const nome of MODELOS_DEFEITO) {
    inserirModelo.run(nome);
  }

  // Cores iniciais
  const inserirCor = db.prepare('INSERT OR IGNORE INTO cores (nome, ativo) VALUES (?, 1)');
  for (const nome of CORES_DEFEITO) {
    inserirCor.run(nome);
  }

  // Tipos de preco iniciais
  const inserirTipo = db.prepare(
    'INSERT OR IGNORE INTO tipos_preco (slug, etiqueta, preco, manual, ativo, ordem) VALUES (?, ?, ?, ?, 1, ?)'
  );
  for (const t of TIPOS_PRECO_DEFEITO) {
    inserirTipo.run(t.slug, t.etiqueta, t.preco, t.manual, t.ordem);
  }

  semearStock();

  return { ok: true };
}

// Permite correr diretamente com `npm run seed`
if (require.main === module) {
  semear();
  console.log('Base de dados preparada com sucesso.');
}

module.exports = { semear, semearStock };
