'use strict';

const fs = require('fs');
const path = require('path');
const db = require('../db');

/**
 * Sistema de backup da base de dados.
 * Cria copias completas do ficheiro SQLite e permite exportar e importar
 * todos os dados em JSON, garantindo que nada se perde.
 */

const DATA_DIR = db.DATA_DIR;
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

function garantirPasta() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Cria uma copia de seguranca binaria da base de dados usando a API nativa do SQLite.
 */
async function criarBackup() {
  garantirPasta();
  const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(BACKUP_DIR, `3sigilos-${carimbo}.db`);
  await db.backup(destino);
  const stats = fs.statSync(destino);
  return {
    ficheiro: path.basename(destino),
    caminho: destino,
    tamanho: stats.size,
    criado_em: new Date().toISOString(),
  };
}

function listarBackups() {
  garantirPasta();
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        ficheiro: f,
        tamanho: stats.size,
        criado_em: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
}

/**
 * Exporta todos os dados em JSON, util para arquivo e para a futura sincronizacao com o Notion.
 */
function exportarJson() {
  const tabelas = [
    'clientes',
    'encomendas',
    'stock_branco',
    'stock_estampado',
    'producao',
    'definicoes',
    'alertas_estado',
  ];
  const dados = { gerado_em: new Date().toISOString(), versao: 1, tabelas: {} };
  for (const tabela of tabelas) {
    dados.tabelas[tabela] = db.prepare(`SELECT * FROM ${tabela}`).all();
  }
  return dados;
}

/**
 * Importa dados de um objeto JSON exportado anteriormente.
 * Substitui o conteudo das tabelas indicadas dentro de uma transacao.
 */
function importarJson(dados) {
  if (!dados || !dados.tabelas) {
    throw new Error('Ficheiro de importacao invalido.');
  }
  const tabelas = Object.keys(dados.tabelas);
  const importar = db.transaction(() => {
    for (const tabela of tabelas) {
      const linhas = dados.tabelas[tabela];
      if (!Array.isArray(linhas) || linhas.length === 0) continue;
      db.prepare(`DELETE FROM ${tabela}`).run();
      const colunas = Object.keys(linhas[0]);
      const placeholders = colunas.map((c) => '@' + c).join(', ');
      const stmt = db.prepare(
        `INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES (${placeholders})`
      );
      for (const linha of linhas) {
        stmt.run(linha);
      }
    }
  });
  importar();
  return { ok: true, tabelas: tabelas.length };
}

module.exports = {
  criarBackup,
  listarBackups,
  exportarJson,
  importarJson,
  BACKUP_DIR,
};
