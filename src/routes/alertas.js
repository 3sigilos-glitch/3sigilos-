'use strict';

const express = require('express');
const router = express.Router();
const alertas = require('../services/alertas');

router.get('/', (req, res) => {
  res.json(alertas.calcular());
});

router.post('/resolver', (req, res) => {
  const chave = req.body && req.body.chave;
  if (!chave) return res.status(400).json({ erro: 'Chave em falta.' });
  res.json(alertas.resolver(chave));
});

router.post('/reativar', (req, res) => {
  const chave = req.body && req.body.chave;
  if (!chave) return res.status(400).json({ erro: 'Chave em falta.' });
  res.json(alertas.reativar(chave));
});

module.exports = router;
