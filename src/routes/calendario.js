'use strict';

const express = require('express');
const router = express.Router();
const calendario = require('../services/calendario');

router.get('/', (req, res) => {
  res.json(calendario.eventos({ de: req.query.de, ate: req.query.ate }));
});

module.exports = router;
