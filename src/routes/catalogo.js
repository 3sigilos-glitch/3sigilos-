'use strict';

const express = require('express');
const router = express.Router();
const catalogo = require('../services/catalogo');
const { inteiro } = require('./utils');

/**
 * Catalogo gerido na base de dados: modelos de desenho, cores de t-shirt e
 * tipos de preco. Inclui tambem os dados fixos (canais, metodos, estados).
 */
router.get('/', (req, res) => {
  res.json(catalogo.catalogoCompleto());
});

/* Modelos de desenho */
router.get('/modelos', (req, res) => {
  res.json(catalogo.listarModelos({ marca: req.query.marca, incluirInativos: true }));
});
router.post('/modelos', (req, res) => {
  res.status(201).json(catalogo.criarModelo(req.body));
});
router.put('/modelos/:id', (req, res) => {
  const r = catalogo.atualizarModelo(inteiro(req.params.id), req.body);
  if (!r) return res.status(404).json({ erro: 'Modelo nao encontrado.' });
  res.json(r);
});
router.delete('/modelos/:id', (req, res) => {
  res.json(catalogo.eliminarModelo(inteiro(req.params.id)));
});

/* Cores de t-shirt */
router.get('/cores', (req, res) => {
  res.json(catalogo.listarCores({ incluirInativos: true }));
});
router.post('/cores', (req, res) => {
  res.status(201).json(catalogo.criarCor(req.body));
});
router.put('/cores/:id', (req, res) => {
  const r = catalogo.atualizarCor(inteiro(req.params.id), req.body);
  if (!r) return res.status(404).json({ erro: 'Cor nao encontrada.' });
  res.json(r);
});
router.delete('/cores/:id', (req, res) => {
  res.json(catalogo.eliminarCor(inteiro(req.params.id)));
});

/* Tipos de preco */
router.get('/tipos-preco', (req, res) => {
  res.json(catalogo.listarTiposPreco({ incluirInativos: true }));
});
router.post('/tipos-preco', (req, res) => {
  res.status(201).json(catalogo.criarTipoPreco(req.body));
});
router.put('/tipos-preco/:slug', (req, res) => {
  const r = catalogo.atualizarTipoPreco(req.params.slug, req.body);
  if (!r) return res.status(404).json({ erro: 'Tipo de preco nao encontrado.' });
  res.json(r);
});
router.delete('/tipos-preco/:slug', (req, res) => {
  res.json(catalogo.eliminarTipoPreco(req.params.slug));
});

module.exports = router;
