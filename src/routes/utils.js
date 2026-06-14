'use strict';

/**
 * Utilitarios partilhados pelas rotas.
 */

// Envolve um handler assincrono para encaminhar erros para o middleware de erro
function aw(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// Converte um valor para inteiro seguro
function inteiro(valor) {
  const n = parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
}

module.exports = { aw, inteiro };
