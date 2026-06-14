'use strict';

const db = require('./index');

/**
 * Define e cria todas as tabelas da base de dados.
 * O esquema e idempotente: usar IF NOT EXISTS permite arrancar varias vezes em seguranca.
 */
function criarEsquema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      contacto TEXT,
      morada TEXT,
      nif TEXT,
      vip INTEGER NOT NULL DEFAULT 0,
      terreiro INTEGER NOT NULL DEFAULT 0,
      notas TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS encomendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      cliente_nome TEXT NOT NULL,
      itens TEXT NOT NULL DEFAULT '[]',
      pedido_texto TEXT,
      is_pack_tarot INTEGER NOT NULL DEFAULT 0,
      tipo_preco TEXT NOT NULL DEFAULT 'normal',
      preco_unitario REAL NOT NULL DEFAULT 0,
      desconto REAL NOT NULL DEFAULT 0,
      preco_total REAL NOT NULL DEFAULT 0,
      custo_total REAL NOT NULL DEFAULT 0,
      margem REAL NOT NULL DEFAULT 0,
      metodo_pagamento TEXT,
      estado_pagamento TEXT NOT NULL DEFAULT 'Nao pago',
      data_pagamento TEXT,
      estado_entrega TEXT NOT NULL DEFAULT 'Por preparar',
      data_envio TEXT,
      tracking TEXT,
      canal TEXT,
      etsy_venda TEXT,
      etsy_taxas REAL NOT NULL DEFAULT 0,
      estampagem_atribuida INTEGER NOT NULL DEFAULT 0,
      stock_baixado INTEGER NOT NULL DEFAULT 0,
      regiao TEXT NOT NULL DEFAULT 'Portugal',
      notas TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS stock_branco (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tamanho TEXT NOT NULL UNIQUE,
      quantidade INTEGER NOT NULL DEFAULT 0,
      minimo INTEGER NOT NULL DEFAULT 0,
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_estampado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modelo TEXT NOT NULL,
      tamanho TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      minimo INTEGER NOT NULL DEFAULT 0,
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (modelo, tamanho)
    );

    CREATE TABLE IF NOT EXISTS producao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      fornecedor TEXT,
      itens TEXT NOT NULL DEFAULT '[]',
      data_pedido TEXT,
      data_prevista TEXT,
      estado TEXT NOT NULL DEFAULT 'Pendente',
      recebido_em TEXT,
      notas TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS definicoes (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alertas_estado (
      chave TEXT PRIMARY KEY,
      resolvido INTEGER NOT NULL DEFAULT 1,
      resolvido_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_encomendas_estado_entrega ON encomendas(estado_entrega);
    CREATE INDEX IF NOT EXISTS idx_encomendas_estado_pagamento ON encomendas(estado_pagamento);
    CREATE INDEX IF NOT EXISTS idx_encomendas_canal ON encomendas(canal);
    CREATE INDEX IF NOT EXISTS idx_encomendas_criado_em ON encomendas(criado_em);
    CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
  `);
}

module.exports = { criarEsquema };
