// Service worker da 3 Sigilos.
// Objetivo: tornar a app instalavel e dar um arranque rapido.
// Estrategia conservadora, para nao servir dados desatualizados do Supabase:
//  - A navegacao e os dados vao sempre a rede primeiro.
//  - So os recursos estaticos ficam em cache.

const CACHE = '3sigilos-cache-v1';

self.addEventListener('install', (evento) => {
  // Ativa esta versao imediatamente.
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      // Limpa caches antigas de versoes anteriores.
      const chaves = await caches.keys();
      await Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;

  // So tratamos pedidos GET do mesmo dominio.
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  // Navegacao e dados: rede primeiro, com a cache apenas como rede de seguranca.
  const ehNavegacao = pedido.mode === 'navigate';
  if (ehNavegacao) {
    evento.respondWith(
      fetch(pedido).catch(() => caches.match(pedido).then((r) => r || caches.match('/painel')))
    );
    return;
  }

  // Recursos estaticos: cache primeiro, atualizando em segundo plano.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    evento.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const emCache = await cache.match(pedido);
        const daRede = fetch(pedido)
          .then((resposta) => {
            if (resposta.ok) cache.put(pedido, resposta.clone());
            return resposta;
          })
          .catch(() => emCache);
        return emCache || daRede;
      })
    );
  }
});
