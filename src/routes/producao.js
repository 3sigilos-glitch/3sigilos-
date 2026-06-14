'use strict';

const express = require('express');
const router = express.Router();
const producao = require('../services/producao');
const { inteiro } = require('./utils');

router.get('/', (req, res) => {
  res.json(producao.listar({ tipo: req.query.tipo, estado: req.query.estado }));
});

router.get('/lista-trabalho', (req, res) => {
  res.json(producao.listaTrabalhoDiaria());
});

router.get('/:id', (req, res) => {
  const ped = producao.obter(inteiro(req.params.id));
  if (!ped) return res.status(404).json({ erro: 'Pedido nao encontrado.' });
  res.json(ped);
});

router.post('/', (req, res) => {
  res.status(201).json(producao.criar(req.body));
});

router.put('/:id', (req, res) => {
  const atualizado = producao.atualizar(inteiro(req.params.id), req.body);
  if (!atualizado) return res.status(404).json({ erro: 'Pedido nao encontrado.' });
  res.json(atualizado);
});

router.delete('/:id', (req, res) => {
  res.json(producao.eliminar(inteiro(req.params.id)));
});

module.exports = router;
