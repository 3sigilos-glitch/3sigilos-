'use strict';

const express = require('express');
const router = express.Router();
const definicoes = require('../services/definicoes');

router.get('/', (req, res) => {
  res.json(definicoes.obterTodas());
});

router.put('/', (req, res) => {
  res.json(definicoes.guardarVarias(req.body || {}));
});

module.exports = router;
