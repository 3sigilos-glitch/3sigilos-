'use strict';

const express = require('express');
const router = express.Router();
const backup = require('../services/backup');
const { aw } = require('./utils');

router.get('/', (req, res) => {
  res.json(backup.listarBackups());
});

router.post('/criar', aw(async (req, res) => {
  const resultado = await backup.criarBackup();
  res.status(201).json(resultado);
}));

router.get('/exportar.json', (req, res) => {
  const dados = backup.exportarJson();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="3sigilos-dados.json"');
  res.send(JSON.stringify(dados, null, 2));
});

router.post('/importar', (req, res) => {
  res.json(backup.importarJson(req.body));
});

module.exports = router;
