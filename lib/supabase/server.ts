// Cliente do Supabase para uso no servidor (Server Components, Route Handlers, Server Actions).
// Faz a ponte com os cookies de sessao geridos pelo Next.js.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Forma de cada cookie passado pelo Supabase ao definir a sessao.
type CookieParaDefinir = { name: string; value: string; options?: CookieOptions };

export async function criarClienteServidor() {
  const armazemCookies = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return armazemCookies.getAll();
        },
        setAll(cookiesParaDefinir: CookieParaDefinir[]) {
          try {
            cookiesParaDefinir.forEach(({ name, value, options }) =>
              armazemCookies.set(name, value, options)
            );
          } catch {
            // O metodo setAll foi chamado a partir de um Server Component.
            // Pode ser ignorado se houver middleware a renovar as sessoes.
          }
        },
      },
    }
  );
}
