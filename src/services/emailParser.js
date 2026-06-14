'use strict';

const { MODELOS, TAMANHOS } = require('../config/catalog');

/**
 * Extrai dados de uma encomenda a partir do texto colado de um email.
 * Devolve nome, contacto, morada, NIF e itens encontrados.
 * O resultado e sempre uma sugestao: o utilizador confirma e corrige antes de guardar.
 */

// Normaliza texto removendo acentos para comparacoes tolerantes
function semAcentos(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Procura o valor a seguir a uma das etiquetas indicadas na mesma linha
function valorPorEtiqueta(linhas, etiquetas) {
  for (const linha of linhas) {
    const semAc = semAcentos(linha);
    for (const etiqueta of etiquetas) {
      const alvo = semAcentos(etiqueta);
      const idx = semAc.indexOf(alvo);
      if (idx !== -1) {
        const resto = linha.slice(idx + etiqueta.length);
        const limpo = resto.replace(/^[\s:\-=]+/, '').trim();
        if (limpo) return limpo;
      }
    }
  }
  return '';
}

function extrairEmail(texto) {
  const m = texto.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : '';
}

function extrairTelefone(texto) {
  // Numeros portugueses e internacionais simples
  const m = texto.match(/(\+?\d[\d\s]{7,14}\d)/);
  return m ? m[0].replace(/\s+/g, ' ').trim() : '';
}

function extrairNif(texto) {
  const linhas = texto.split(/\r?\n/);
  const porEtiqueta = valorPorEtiqueta(linhas, ['NIF', 'Contribuinte', 'NIPC']);
  if (porEtiqueta) {
    const m = porEtiqueta.match(/\d{9}/);
    if (m) return m[0];
  }
  return '';
}

// Tenta identificar modelos e tamanhos mencionados no texto
function extrairItens(texto) {
  const semAc = semAcentos(texto);
  const itens = [];

  for (const modelo of MODELOS) {
    const modeloSemAc = semAcentos(modelo);
    let pos = semAc.indexOf(modeloSemAc);
    while (pos !== -1) {
      // Procura um tamanho perto da mencao do modelo
      const janela = texto.slice(pos, pos + modelo.length + 40);
      const tamanho = encontrarTamanho(janela);
      const quantidade = encontrarQuantidade(janela);
      itens.push({
        modelo,
        tamanho: tamanho || 'M',
        quantidade: quantidade || 1,
      });
      pos = semAc.indexOf(modeloSemAc, pos + modeloSemAc.length);
    }
  }

  return itens;
}

function encontrarTamanho(janela) {
  const up = janela.toUpperCase();
  // Procura tamanhos do maior para o menor para evitar apanhar S dentro de XS
  for (const tamanho of ['XXL', 'XL', 'L', 'M', 'S']) {
    const re = new RegExp(`(^|[^A-Z])${tamanho}([^A-Z]|$)`);
    if (re.test(up)) return tamanho;
  }
  return '';
}

function encontrarQuantidade(janela) {
  const m = janela.match(/(\d+)\s*(x|unid|unidade|t-?shirt|tshirt)/i);
  if (m) return Number(m[1]);
  const m2 = janela.match(/(?:qtd|quantidade)[\s:]*(\d+)/i);
  if (m2) return Number(m2[1]);
  return 0;
}

// Tenta extrair a morada juntando linhas com indicios de endereco
function extrairMorada(texto) {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim());

  const porEtiqueta = valorPorEtiqueta(linhas, ['Morada', 'Endereco', 'Address']);
  if (porEtiqueta) {
    return porEtiqueta;
  }

  // Procura linhas com codigo postal portugues (0000-000) e junta a anterior
  const partes = [];
  for (let i = 0; i < linhas.length; i++) {
    if (/\d{4}-\d{3}/.test(linhas[i])) {
      if (i > 0 && linhas[i - 1] && !partes.includes(linhas[i - 1])) {
        partes.push(linhas[i - 1]);
      }
      partes.push(linhas[i]);
    }
  }
  return partes.join(', ');
}

function extrairNome(texto) {
  const linhas = texto.split(/\r?\n/).map((l) => l.trim());
  const porEtiqueta = valorPorEtiqueta(linhas, ['Nome', 'Cliente', 'Name']);
  if (porEtiqueta) return porEtiqueta;

  // Procura formula tipica de email de saudacao
  for (const linha of linhas) {
    const m = linha.match(/(?:de|from|enviado por)[\s:]+(.+)/i);
    if (m && m[1].length < 60) return m[1].trim();
  }
  return '';
}

/**
 * Funcao principal: recebe o texto bruto e devolve a sugestao estruturada.
 */
function analisar(texto) {
  if (!texto || typeof texto !== 'string') {
    return { nome: '', contacto: '', email: '', morada: '', nif: '', itens: [] };
  }

  const email = extrairEmail(texto);
  const telefone = extrairTelefone(texto);
  const contacto = email || telefone;

  return {
    nome: extrairNome(texto),
    email,
    telefone,
    contacto,
    morada: extrairMorada(texto),
    nif: extrairNif(texto),
    itens: extrairItens(texto),
  };
}

module.exports = { analisar };
