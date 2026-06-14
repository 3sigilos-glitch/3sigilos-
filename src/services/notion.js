'use strict';

const definicoes = require('./definicoes');
const backup = require('./backup');

/**
 * Conector para integracao futura com o Notion.
 *
 * Este modulo esta preparado de forma modular para sincronizar a base de dados
 * de encomendas e clientes com o Notion. Quando uma chave de API e os
 * identificadores das bases de dados do Notion forem configurados, basta
 * implementar as chamadas reais a API dentro dos metodos sincronizar*.
 *
 * Mantem-se isolado do resto da aplicacao para que a integracao nao afete
 * o funcionamento local e fiavel. A aplicacao funciona sem depender do Notion.
 */

function estaConfigurado() {
  const token = definicoes.obter('notion_token');
  const bdEncomendas = definicoes.obter('notion_bd_encomendas');
  const bdClientes = definicoes.obter('notion_bd_clientes');
  return Boolean(token && (bdEncomendas || bdClientes));
}

function estado() {
  return {
    configurado: estaConfigurado(),
    tem_token: Boolean(definicoes.obter('notion_token')),
    bd_encomendas: definicoes.obter('notion_bd_encomendas') || null,
    bd_clientes: definicoes.obter('notion_bd_clientes') || null,
    nota:
      'Integracao preparada. Configure o token e os identificadores das bases de dados ' +
      'do Notion nas definicoes para ativar a sincronizacao.',
  };
}

function guardarConfiguracao({ token, bd_encomendas, bd_clientes }) {
  if (token !== undefined) definicoes.guardar('notion_token', token);
  if (bd_encomendas !== undefined) definicoes.guardar('notion_bd_encomendas', bd_encomendas);
  if (bd_clientes !== undefined) definicoes.guardar('notion_bd_clientes', bd_clientes);
  return estado();
}

/**
 * Prepara o pacote de dados a enviar para o Notion.
 * Reutiliza o exportador para gerar uma fotografia completa e coerente.
 */
function prepararPayload() {
  const dados = backup.exportarJson();
  return {
    clientes: dados.tabelas.clientes,
    encomendas: dados.tabelas.encomendas,
  };
}

/**
 * Ponto de entrada da sincronizacao.
 * Por agora devolve o que seria enviado, sem efetuar chamadas externas,
 * para que a aplicacao continue a funcionar de forma local e fiavel.
 */
async function sincronizar() {
  if (!estaConfigurado()) {
    return {
      ok: false,
      mensagem: 'Integracao com o Notion ainda nao configurada.',
    };
  }
  const payload = prepararPayload();
  // A implementacao real das chamadas a API do Notion entra aqui no futuro.
  return {
    ok: true,
    mensagem: 'Sincronizacao preparada. Implementacao das chamadas ao Notion pendente.',
    total_clientes: payload.clientes.length,
    total_encomendas: payload.encomendas.length,
  };
}

module.exports = {
  estaConfigurado,
  estado,
  guardarConfiguracao,
  prepararPayload,
  sincronizar,
};
