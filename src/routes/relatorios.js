'use strict';

const express = require('express');
const router = express.Router();
const relatorios = require('../services/relatorios');

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/mensal', (req, res) => {
  const mes = req.query.mes || mesAtual();
  res.json(relatorios.resumoMensal(mes));
});

module.exports = router;
