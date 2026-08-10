// Cliente do Supabase para uso no browser (componentes de cliente).
// Le as chaves a partir das variaveis de ambiente publicas.
import { createBrowserClient } from '@supabase/ssr';

export function criarClienteBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
