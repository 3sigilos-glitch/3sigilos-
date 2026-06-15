'use strict';

const db = require('../db');
const { semearStock } = require('../db/seed');
const {
  TAMANHOS,
  CANAIS,
  METODOS_PAGAMENTO,
  ESTADOS_ENTREGA,
  ESTADOS_PAGAMENTO,
  MARCAS,
  PACK_TAROT_MODELOS,
} = require('../config/catalog');

/**
 * Servico do catalogo gerido na base de dados.
 * Permite adicionar, editar e remover modelos de desenho, cores de t-shirt e
 * tipos de preco pela interface. Os modelos pertencem a uma marca, o que permite
 * separar a 3 Sigilos da marca do Colegio Rompe Mato.
 */

/* Modelos de desenho */

function listarModelos({ marca, incluirInativos } = {}) {
  const cond = [];
  const params = [];
  if (!incluirInativos) cond.push('ativo = 1');
  if (marca) {
    cond.push('marca = ?');
    params.push(marca);
  }
  const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
  return db
    .prepare(`SELECT * FROM modelos ${where} ORDER BY marca, nome COLLATE NOCASE`)
    .all(...params);
}

function nomesModelos() {
  return listarModelos().map((m) => m.nome);
}

function criarModelo({ nome, marca }) {
  if (!nome || !nome.trim()) throw new Error('O nome do modelo e obrigatorio.');
  let info;
  try {
    info = db
      .prepare('INSERT INTO modelos (nome, marca, ativo) VALUES (?, ?, 1)')
      .run(nome.trim(), (marca && marca.trim()) || '3 Sigilos');
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      throw new Error('Ja existe um modelo com esse nome nesta marca.');
    }
    throw e;
  }
  // Cria as linhas de stock estampado para o novo modelo
  semearStock();
  return db.prepare('SELECT * FROM modelos WHERE id = ?').get(info.lastInsertRowid);
}

function atualizarModelo(id, { nome, marca, ativo }) {
  const anterior = db.prepare('SELECT * FROM modelos WHERE id = ?').get(id);
  if (!anterior) return null;
  db.prepare('UPDATE modelos SET nome = ?, marca = ?, ativo = ? WHERE id = ?').run(
    nome !== undefined ? nome.trim() : anterior.nome,
    marca !== undefined ? marca.trim() : anterior.marca,
    ativo !== undefined ? (ativo ? 1 : 0) : anterior.ativo,
    id
  );
  if (ativo) semearStock();
  return db.prepare('SELECT * FROM modelos WHERE id = ?').get(id);
}

function eliminarModelo(id) {
  const m = db.prepare('SELECT * FROM modelos WHERE id = ?').get(id);
  if (!m) return { ok: true };
  // Remove as linhas de stock estampado deste modelo. As encomendas guardam o
  // nome do modelo, por isso o historico mantem-se intacto.
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM stock_estampado WHERE modelo = ?').run(m.nome);
    db.prepare('DELETE FROM modelos WHERE id = ?').run(id);
  });
  tx();
  return { ok: true };
}

/* Cores de t-shirt */

function listarCores({ incluirInativos } = {}) {
  const where = incluirInativos ? '' : 'WHERE ativo = 1';
  return db.prepare(`SELECT * FROM cores ${where} ORDER BY nome COLLATE NOCASE`).all();
}

function nomesCores() {
  return listarCores().map((c) => c.nome);
}

function criarCor({ nome }) {
  if (!nome || !nome.trim()) throw new Error('O nome da cor e obrigatorio.');
  let info;
  try {
    info = db.prepare('INSERT INTO cores (nome, ativo) VALUES (?, 1)').run(nome.trim());
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      throw new Error('Ja existe uma cor com esse nome.');
    }
    throw e;
  }
  // Cria as linhas de stock para a nova cor
  semearStock();
  return db.prepare('SELECT * FROM cores WHERE id = ?').get(info.lastInsertRowid);
}

function atualizarCor(id, { nome, ativo }) {
  const anterior = db.prepare('SELECT * FROM cores WHERE id = ?').get(id);
  if (!anterior) return null;
  db.prepare('UPDATE cores SET nome = ?, ativo = ? WHERE id = ?').run(
    nome !== undefined ? nome.trim() : anterior.nome,
    ativo !== undefined ? (ativo ? 1 : 0) : anterior.ativo,
    id
  );
  if (ativo) semearStock();
  return db.prepare('SELECT * FROM cores WHERE id = ?').get(id);
}

function eliminarCor(id) {
  const c = db.prepare('SELECT * FROM cores WHERE id = ?').get(id);
  if (!c) return { ok: true };
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM stock_branco WHERE cor = ?').run(c.nome);
    db.prepare('DELETE FROM stock_estampado WHERE cor = ?').run(c.nome);
    db.prepare('DELETE FROM cores WHERE id = ?').run(id);
  });
  tx();
  return { ok: true };
}

/* Tipos de preco */

function listarTiposPreco({ incluirInativos } = {}) {
  const where = incluirInativos ? '' : 'WHERE ativo = 1';
  return db.prepare(`SELECT * FROM tipos_preco ${where} ORDER BY ordem, etiqueta`).all();
}

function obterTipoPreco(slug) {
  return db.prepare('SELECT * FROM tipos_preco WHERE slug = ?').get(slug);
}

// Gera um slug simples a partir da etiqueta
function gerarSlug(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'tipo';
}

function criarTipoPreco({ etiqueta, preco, manual }) {
  if (!etiqueta || !etiqueta.trim()) throw new Error('A etiqueta do tipo de preco e obrigatoria.');
  let slug = gerarSlug(etiqueta);
  // Garante unicidade do slug
  let sufixo = 1;
  while (obterTipoPreco(slug)) {
    slug = gerarSlug(etiqueta) + '_' + sufixo++;
  }
  const maxOrdem = db.prepare('SELECT COALESCE(MAX(ordem), 0) AS m FROM tipos_preco WHERE ordem < 99').get().m;
  db.prepare(
    'INSERT INTO tipos_preco (slug, etiqueta, preco, manual, ativo, ordem) VALUES (?, ?, ?, ?, 1, ?)'
  ).run(
    slug,
    etiqueta.trim(),
    manual ? null : Number(preco) || 0,
    manual ? 1 : 0,
    maxOrdem + 1
  );
  return obterTipoPreco(slug);
}

function atualizarTipoPreco(slug, { etiqueta, preco, manual, ativo, ordem }) {
  const anterior = obterTipoPreco(slug);
  if (!anterior) return null;
  const ehManual = manual !== undefined ? (manual ? 1 : 0) : anterior.manual;
  db.prepare(
    'UPDATE tipos_preco SET etiqueta = ?, preco = ?, manual = ?, ativo = ?, ordem = ? WHERE slug = ?'
  ).run(
    etiqueta !== undefined ? etiqueta.trim() : anterior.etiqueta,
    ehManual ? null : preco !== undefined ? Number(preco) || 0 : anterior.preco,
    ehManual,
    ativo !== undefined ? (ativo ? 1 : 0) : anterior.ativo,
    ordem !== undefined ? Number(ordem) : anterior.ordem,
    slug
  );
  return obterTipoPreco(slug);
}

function eliminarTipoPreco(slug) {
  // Protege o tipo personalizado, que e necessario para precos manuais
  if (slug === 'personalizado') {
    throw new Error('O tipo Personalizado nao pode ser removido.');
  }
  db.prepare('DELETE FROM tipos_preco WHERE slug = ?').run(slug);
  return { ok: true };
}

function marcasUsadas() {
  const linhas = db.prepare('SELECT DISTINCT marca FROM modelos ORDER BY marca').all();
  const conjunto = new Set([...MARCAS, ...linhas.map((l) => l.marca)]);
  return [...conjunto];
}

/**
 * Catalogo completo para o frontend.
 */
function catalogoCompleto() {
  return {
    modelos: nomesModelos(),
    modelos_detalhe: listarModelos(),
    marcas: marcasUsadas(),
    cores: nomesCores(),
    cores_detalhe: listarCores(),
    tamanhos: TAMANHOS,
    tipos_preco: listarTiposPreco(),
    pack_tarot_modelos: PACK_TAROT_MODELOS,
    canais: CANAIS,
    metodos_pagamento: METODOS_PAGAMENTO,
    estados_entrega: ESTADOS_ENTREGA,
    estados_pagamento: ESTADOS_PAGAMENTO,
  };
}

module.exports = {
  listarModelos,
  nomesModelos,
  criarModelo,
  atualizarModelo,
  eliminarModelo,
  listarCores,
  nomesCores,
  criarCor,
  atualizarCor,
  eliminarCor,
  listarTiposPreco,
  obterTipoPreco,
  criarTipoPreco,
  atualizarTipoPreco,
  eliminarTipoPreco,
  marcasUsadas,
  catalogoCompleto,
};
