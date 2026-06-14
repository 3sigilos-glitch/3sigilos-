'use strict';

const express = require('express');
const router = express.Router();
const dashboard = require('../services/dashboard');

router.get('/', (req, res) => {
  res.json(dashboard.resumo());
});

module.exports = router;
