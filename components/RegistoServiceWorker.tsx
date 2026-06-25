'use client';

import { useEffect } from 'react';

// Regista o service worker para a aplicacao ser instalavel como PWA
// e ter um arranque rapido. So corre no browser, depois de a pagina carregar.
export default function RegistoServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registar = () => {
        navigator.serviceWorker.register('/sw.js').catch((erro) => {
          console.error('Falha ao registar o service worker:', erro);
        });
      };
      window.addEventListener('load', registar);
      return () => window.removeEventListener('load', registar);
    }
  }, []);

  return null;
}
