'use strict';

const express = require('express');
const router = express.Router();
const stock = require('../services/stock');
const { inteiro } = require('./utils');

router.get('/', (req, res) => {
  res.json({
    branco: stock.listarBranco(),
    estampado: stock.listarEstampado(),
  });
});

router.put('/branco/:id', (req, res) => {
  res.json(stock.atualizarBranco(inteiro(req.params.id), req.body));
});

router.put('/estampado/:id', (req, res) => {
  res.json(stock.atualizarEstampado(inteiro(req.params.id), req.body));
});

module.exports = router;
