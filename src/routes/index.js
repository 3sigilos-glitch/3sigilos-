'use strict';

const express = require('express');
const router = express.Router();

/**
 * Agrega todas as rotas da API sob /api.
 * Cada area da aplicacao tem o seu modulo de rotas para manter o codigo modular.
 */
router.use('/catalogo', require('./catalogo'));
router.use('/definicoes', require('./definicoes'));
router.use('/clientes', require('./clientes'));
router.use('/encomendas', require('./encomendas'));
router.use('/email', require('./email'));
router.use('/stock', require('./stock'));
router.use('/producao', require('./producao'));
router.use('/alertas', require('./alertas'));
router.use('/faturacao', require('./faturacao'));
router.use('/relatorios', require('./relatorios'));
router.use('/dashboard', require('./dashboard'));
router.use('/calendario', require('./calendario'));
router.use('/backup', require('./backup'));
router.use('/notion', require('./notion'));

module.exports = router;
