'use strict';

const db = require('../db');

/**
 * Servico do calendario.
 * Reune eventos relevantes: encomendas pendentes, datas de envio previstas
 * e datas previstas de pedidos de producao.
 */

function parseItens(texto) {
  try {
    return JSON.parse(texto);
  } catch (e) {
    return [];
  }
}

function eventos({ de, ate } = {}) {
  const lista = [];

  // Encomendas com data de envio
  const encomendas = db.prepare('SELECT * FROM encomendas').all();
  for (const enc of encomendas) {
    if (enc.data_envio) {
      lista.push({
        data: enc.data_envio.slice(0, 10),
        tipo: 'envio',
        titulo: `Envio encomenda ${enc.id}`,
        descricao: `${enc.cliente_nome}`,
        encomenda_id: enc.id,
      });
    } else if (enc.estado_entrega !== 'Entregue') {
      // Encomenda pendente sem data de envio, mostra na data de criacao
      lista.push({
        data: enc.criado_em.slice(0, 10),
        tipo: 'pendente',
        titulo: `Encomenda pendente ${enc.id}`,
        descricao: `${enc.cliente_nome}`,
        encomenda_id: enc.id,
      });
    }
  }

  // Pedidos de producao com data prevista
  const producao = db.prepare('SELECT * FROM producao').all();
  for (const ped of producao) {
    if (ped.data_prevista) {
      lista.push({
        data: ped.data_prevista.slice(0, 10),
        tipo: 'producao',
        titulo: ped.tipo === 'tshirts_branco' ? 'Chegada t-shirts em branco' : 'Chegada estampagem DTF',
        descricao: ped.fornecedor || '',
        producao_id: ped.id,
      });
    }
  }

  let filtrados = lista;
  if (de) filtrados = filtrados.filter((e) => e.data >= de);
  if (ate) filtrados = filtrados.filter((e) => e.data <= ate);

  filtrados.sort((a, b) => a.data.localeCompare(b.data));
  return filtrados;
}

module.exports = { eventos };
