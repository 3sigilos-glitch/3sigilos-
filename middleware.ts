import { type NextRequest } from 'next/server';
import { atualizarSessao } from '@/lib/supabase/middleware';

// Corre em todos os pedidos para renovar a sessao do Supabase
// e proteger as rotas privadas da aplicacao.
export async function middleware(request: NextRequest) {
  return await atualizarSessao(request);
}

export const config = {
  // Ignora ficheiros estaticos, imagens e o service worker.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
