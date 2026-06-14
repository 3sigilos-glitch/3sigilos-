'use strict';

const express = require('express');
const router = express.Router();
const clientes = require('../services/clientes');
const exportar = require('../services/exportar');
const { aw, inteiro } = require('./utils');

router.get('/', (req, res) => {
  res.json(clientes.listar(req.query.pesquisa));
});

// Exportacao tem de vir antes de /:id para nao colidir
router.get('/exportar.csv', (req, res) => {
  const lista = clientes.listar(req.query.pesquisa);
  const colunas = [
    { chave: 'id', etiqueta: 'ID' },
    { chave: 'nome', etiqueta: 'Nome' },
    { chave: 'contacto', etiqueta: 'Contacto' },
    { chave: 'morada', etiqueta: 'Morada' },
    { chave: 'nif', etiqueta: 'NIF' },
    { chave: 'vip', etiqueta: 'VIP' },
    { chave: 'terreiro', etiqueta: 'Terreiro' },
  ];
  const csv = exportar.gerarCsv(colunas, lista);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="clientes.csv"');
  res.send(csv);
});

router.get('/exportar.pdf', aw(async (req, res) => {
  const lista = clientes.listar(req.query.pesquisa);
  const colunas = [
    { chave: 'id', etiqueta: 'ID' },
    { chave: 'nome', etiqueta: 'Nome' },
    { chave: 'contacto', etiqueta: 'Contacto' },
    { chave: 'nif', etiqueta: 'NIF' },
  ];
  const pdf = await exportar.gerarPdf({ titulo: 'Lista de clientes', colunas, linhas: lista });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="clientes.pdf"');
  res.send(pdf);
}));

router.get('/:id', (req, res) => {
  const cliente = clientes.obterComHistorico(inteiro(req.params.id));
  if (!cliente) return res.status(404).json({ erro: 'Cliente nao encontrado.' });
  res.json(cliente);
});

router.post('/', (req, res) => {
  res.status(201).json(clientes.criar(req.body));
});

router.put('/:id', (req, res) => {
  const atualizado = clientes.atualizar(inteiro(req.params.id), req.body);
  if (!atualizado) return res.status(404).json({ erro: 'Cliente nao encontrado.' });
  res.json(atualizado);
});

router.delete('/:id', (req, res) => {
  res.json(clientes.eliminar(inteiro(req.params.id)));
});

module.exports = router;
