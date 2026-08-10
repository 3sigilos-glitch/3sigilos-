// Cliente do Supabase para uso no browser (componentes de cliente).
// Le as chaves a partir das variaveis de ambiente publicas.
import { createBrowserClient } from '@supabase/ssr';

export function criarClienteBrowser() {
  const endereco = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!endereco || !chaveAnonima) {
    // Mensagem clara em vez de um erro tecnico: sem estas variaveis definidas
    // no Vercel, a app nao consegue falar com o Supabase (nem fazer login).
    throw new Error(
      'Faltam as chaves do Supabase nesta versao da app (variaveis de ambiente). Avisa o admin.'
    );
  }
  return createBrowserClient(endereco, chaveAnonima);
}
