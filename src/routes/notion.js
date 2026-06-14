'use strict';

const express = require('express');
const router = express.Router();
const notion = require('../services/notion');
const { aw } = require('./utils');

router.get('/', (req, res) => {
  res.json(notion.estado());
});

router.put('/', (req, res) => {
  res.json(notion.guardarConfiguracao(req.body || {}));
});

router.post('/sincronizar', aw(async (req, res) => {
  res.json(await notion.sincronizar());
}));

module.exports = router;
