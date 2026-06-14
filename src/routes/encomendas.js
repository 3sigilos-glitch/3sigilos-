'use strict';

const express = require('express');
const router = express.Router();
const encomendas = require('../services/encomendas');
const exportar = require('../services/exportar');
const { aw, inteiro } = require('./utils');

function filtrosDoPedido(query) {
  return {
    estado_entrega: query.estado_entrega,
    estado_pagamento: query.estado_pagamento,
    canal: query.canal,
    modelo: query.modelo,
    de: query.de,
    ate: query.ate,
    pesquisa: query.pesquisa,
  };
}

// Linha legivel para exportacao
function linhaExport(e) {
  const descricao = (e.itens || [])
    .map((i) => `${i.quantidade}x ${i.modelo} ${i.tamanho}`)
    .join(', ');
  return {
    id: e.id,
    data: e.criado_em,
    cliente: e.cliente_nome,
    produtos: descricao || e.pedido_texto || '',
    tipo_preco: e.tipo_preco,
    preco_total: e.preco_total,
    margem: e.margem,
    pagamento: e.estado_pagamento,
    entrega: e.estado_entrega,
    canal: e.canal,
    tracking: e.tracking,
  };
}

router.get('/', (req, res) => {
  res.json(encomendas.listar(filtrosDoPedido(req.query)));
});

// Pre-visualizacao do calculo financeiro sem guardar
router.post('/calcular', (req, res) => {
  res.json(encomendas.montarValores(req.body));
});

router.get('/exportar.csv', (req, res) => {
  const lista = encomendas.listar(filtrosDoPedido(req.query)).map(linhaExport);
  const colunas = [
    { chave: 'id', etiqueta: 'ID' },
    { chave: 'data', etiqueta: 'Data' },
    { chave: 'cliente', etiqueta: 'Cliente' },
    { chave: 'produtos', etiqueta: 'Produtos' },
    { chave: 'tipo_preco', etiqueta: 'Tipo de preco' },
    { chave: 'preco_total', etiqueta: 'Total' },
    { chave: 'margem', etiqueta: 'Margem' },
    { chave: 'pagamento', etiqueta: 'Pagamento' },
    { chave: 'entrega', etiqueta: 'Entrega' },
    { chave: 'canal', etiqueta: 'Canal' },
    { chave: 'tracking', etiqueta: 'Tracking' },
  ];
  const csv = exportar.gerarCsv(colunas, lista);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="encomendas.csv"');
  res.send(csv);
});

router.get('/exportar.pdf', aw(async (req, res) => {
  const lista = encomendas.listar(filtrosDoPedido(req.query)).map(linhaExport);
  const colunas = [
    { chave: 'id', etiqueta: 'ID' },
    { chave: 'data', etiqueta: 'Data' },
    { chave: 'cliente', etiqueta: 'Cliente' },
    { chave: 'produtos', etiqueta: 'Produtos' },
    { chave: 'preco_total', etiqueta: 'Total' },
    { chave: 'pagamento', etiqueta: 'Pagamento' },
    { chave: 'entrega', etiqueta: 'Entrega' },
    { chave: 'canal', etiqueta: 'Canal' },
  ];
  const pdf = await exportar.gerarPdf({ titulo: 'Lista de encomendas', colunas, linhas: lista });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="encomendas.pdf"');
  res.send(pdf);
}));

router.get('/:id', (req, res) => {
  const enc = encomendas.obter(inteiro(req.params.id));
  if (!enc) return res.status(404).json({ erro: 'Encomenda nao encontrada.' });
  res.json(enc);
});

router.post('/', (req, res) => {
  res.status(201).json(encomendas.criar(req.body));
});

router.put('/:id', (req, res) => {
  const atualizada = encomendas.atualizar(inteiro(req.params.id), req.body);
  if (!atualizada) return res.status(404).json({ erro: 'Encomenda nao encontrada.' });
  res.json(atualizada);
});

router.delete('/:id', (req, res) => {
  res.json(encomendas.eliminar(inteiro(req.params.id)));
});

module.exports = router;
