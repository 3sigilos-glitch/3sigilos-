'use strict';

const backup = require('../services/backup');

/**
 * Cria uma copia de seguranca da base de dados a partir da linha de comandos.
 * Uso: npm run backup
 */
(async () => {
  try {
    const resultado = await backup.criarBackup();
    console.log('Copia de seguranca criada:', resultado.ficheiro);
    console.log('Caminho:', resultado.caminho);
  } catch (e) {
    console.error('Falha ao criar copia de seguranca:', e.message);
    process.exit(1);
  }
})();
