'use strict';

const path = require('path');
const express = require('express');
const { semear } = require('./src/db/seed');
const rotasApi = require('./src/routes');

/**
 * Ponto de entrada da aplicacao.
 * Prepara a base de dados, serve a API e a interface estatica.
 */

// Garante o esquema e os dados base ao arrancar
semear();

const app = express();
const PORTA = process.env.PORT || 3000;

// Limite generoso para aceitar textos de email e importacoes JSON
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API
app.use('/api', rotasApi);

// Interface estatica
app.use(express.static(path.join(__dirname, 'public')));

// Encaminha qualquer outro pedido para a aplicacao de pagina unica
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros, devolve sempre JSON coerente
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erro na aplicacao:', err);
  res.status(500).json({ erro: err.message || 'Erro interno do servidor.' });
});

app.listen(PORTA, () => {
  console.log(`Plataforma 3 Sigilos a correr em http://localhost:${PORTA}`);
});

module.exports = app;
