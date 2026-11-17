import { createClient } from '@supabase/supabase-js';

// Cliente de servico (service role), apenas para o servidor (rotas de cron).
// Ignora o RLS, por isso NUNCA deve ser exposto ao browser. Usa a chave de
// servico do Supabase, guardada em variavel de ambiente.
export function criarClienteServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(url, chave, {
    auth: { persistSession: false },
    // Nunca guardar em cache pedidos a base de dados. Numa rota sem sessao, o
    // Next.js pode reaproveitar respostas antigas (ate de gravacoes) se outro
    // pedido no mesmo processamento tiver pedido cache (o do calendario pede).
    global: { fetch: (entrada, opcoes) => fetch(entrada, { ...opcoes, cache: 'no-store' }) },
  });
}
