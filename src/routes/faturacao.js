'use strict';

const express = require('express');
const router = express.Router();
const faturacao = require('../services/faturacao');
const exportar = require('../services/exportar');
const { aw } = require('./utils');

const COLUNAS = [
  { chave: 'encomenda_id', etiqueta: 'Encomenda' },
  { chave: 'data', etiqueta: 'Data' },
  { chave: 'nome', etiqueta: 'Nome' },
  { chave: 'nif', etiqueta: 'NIF' },
  { chave: 'descricao', etiqueta: 'Descricao' },
  { chave: 'quantidade', etiqueta: 'Qtd' },
  { chave: 'valor_unitario', etiqueta: 'Valor unitario' },
  { chave: 'base_tributavel', etiqueta: 'Base' },
  { chave: 'iva_taxa', etiqueta: 'IVA %' },
  { chave: 'valor_iva', etiqueta: 'Valor IVA' },
  { chave: 'valor_total', etiqueta: 'Total' },
  { chave: 'regiao', etiqueta: 'Regiao' },
];

router.get('/', (req, res) => {
  res.json(faturacao.listar({ mes: req.query.mes, regiao: req.query.regiao }));
});

router.get('/exportar.csv', (req, res) => {
  const { linhas } = faturacao.listar({ mes: req.query.mes, regiao: req.query.regiao });
  const csv = exportar.gerarCsv(COLUNAS, linhas);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="faturacao.csv"');
  res.send(csv);
});

router.get('/exportar.pdf', aw(async (req, res) => {
  const { linhas, totais } = faturacao.listar({ mes: req.query.mes, regiao: req.query.regiao });
  const totaisTexto =
    `Portugal: ${totais.portugal.total} euros (${totais.portugal.numero} encomendas) | ` +
    `Europa: ${totais.europa.total} euros (${totais.europa.numero} encomendas) | ` +
    `Total: ${totais.total} euros`;
  const pdf = await exportar.gerarPdf({
    titulo: 'Resumo de faturacao',
    subtitulo: req.query.mes ? `Mes ${req.query.mes}` : 'Todas as encomendas pagas',
    colunas: COLUNAS,
    linhas,
    totaisTexto,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="faturacao.pdf"');
  res.send(pdf);
}));

module.exports = router;
