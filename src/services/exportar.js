'use strict';

const PDFDocument = require('pdfkit');

/**
 * Servico de exportacao de dados em CSV e PDF.
 * Funciona de forma generica a partir de colunas e linhas, para reutilizar
 * em encomendas, clientes, faturacao e relatorios.
 */

// Escapa um valor para CSV seguindo a convencao de aspas duplas
function escaparCsv(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  if (/[",\n;]/.test(texto)) {
    return '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

/**
 * Gera uma string CSV. colunas e um array de { chave, etiqueta }.
 * Usa ponto e virgula como separador, comum em folhas de calculo em portugues.
 */
function gerarCsv(colunas, linhas) {
  const cabecalho = colunas.map((c) => escaparCsv(c.etiqueta)).join(';');
  const corpo = linhas
    .map((linha) => colunas.map((c) => escaparCsv(linha[c.chave])).join(';'))
    .join('\n');
  // BOM para o Excel reconhecer acentuacao em UTF-8
  return '﻿' + cabecalho + '\n' + corpo;
}

/**
 * Gera um PDF em memoria e devolve uma Promise com o Buffer.
 * Aceita um titulo, colunas e linhas. Inclui um rodape com a data.
 */
function gerarPdf({ titulo, subtitulo, colunas, linhas, totaisTexto }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
      const blocos = [];
      doc.on('data', (b) => blocos.push(b));
      doc.on('end', () => resolve(Buffer.concat(blocos)));
      doc.on('error', reject);

      // Cabecalho da marca
      doc.fillColor('#111').fontSize(20).text('3 Sigilos', { align: 'left' });
      doc.moveDown(0.2);
      doc.fillColor('#333').fontSize(14).text(titulo || 'Exportacao');
      if (subtitulo) {
        doc.fillColor('#666').fontSize(10).text(subtitulo);
      }
      doc.moveDown(0.5);

      const larguraPagina = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const larguraColuna = larguraPagina / colunas.length;
      const alturaLinha = 18;
      let y = doc.y + 5;
      const x0 = doc.page.margins.left;

      // Cabecalho da tabela
      function desenharCabecalho() {
        doc.fillColor('#000').fontSize(9).font('Helvetica-Bold');
        colunas.forEach((c, i) => {
          doc.text(String(c.etiqueta), x0 + i * larguraColuna, y, {
            width: larguraColuna - 4,
            ellipsis: true,
          });
        });
        y += alturaLinha;
        doc
          .moveTo(x0, y - 4)
          .lineTo(x0 + larguraPagina, y - 4)
          .strokeColor('#ccc')
          .stroke();
        doc.font('Helvetica');
      }

      desenharCabecalho();

      doc.fontSize(8).fillColor('#222');
      for (const linha of linhas) {
        if (y > doc.page.height - doc.page.margins.bottom - alturaLinha) {
          doc.addPage();
          y = doc.page.margins.top;
          desenharCabecalho();
          doc.fontSize(8).fillColor('#222');
        }
        colunas.forEach((c, i) => {
          const valor = linha[c.chave];
          doc.text(valor === null || valor === undefined ? '' : String(valor), x0 + i * larguraColuna, y, {
            width: larguraColuna - 4,
            ellipsis: true,
          });
        });
        y += alturaLinha;
      }

      if (totaisTexto) {
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(totaisTexto, x0, y + 10, {
          width: larguraPagina,
        });
      }

      // Rodape com data de geracao
      const dataGeracao = new Date().toLocaleString('pt-PT');
      doc.fontSize(8).fillColor('#999').text(
        `Gerado em ${dataGeracao}`,
        doc.page.margins.left,
        doc.page.height - doc.page.margins.bottom + 5,
        { align: 'right', width: larguraPagina }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { gerarCsv, gerarPdf };
