'use strict';

const express = require('express');
const router = express.Router();
const catalogo = require('../config/catalog');

/**
 * Disponibiliza o catalogo fixo ao frontend: modelos, tamanhos, tipos de preco,
 * canais, metodos de pagamento e estados.
 */
router.get('/', (req, res) => {
  res.json({
    modelos: catalogo.MODELOS,
    pack_tarot_modelos: catalogo.PACK_TAROT_MODELOS,
    tamanhos: catalogo.TAMANHOS,
    tipos_preco: catalogo.TIPOS_PRECO,
    canais: catalogo.CANAIS,
    metodos_pagamento: catalogo.METODOS_PAGAMENTO,
    estados_entrega: catalogo.ESTADOS_ENTREGA,
    estados_pagamento: catalogo.ESTADOS_PAGAMENTO,
  });
});

module.exports = router;
