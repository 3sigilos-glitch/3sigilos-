'use strict';

const express = require('express');
const router = express.Router();
const emailParser = require('../services/emailParser');

/**
 * Analisa o texto de um email de encomenda e devolve uma sugestao estruturada.
 * O utilizador confirma e corrige antes de guardar.
 */
router.post('/analisar', (req, res) => {
  const texto = req.body && req.body.texto;
  res.json(emailParser.analisar(texto || ''));
});

module.exports = router;
