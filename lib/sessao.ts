import { criarClienteServidor } from '@/lib/supabase/server';
import type { PapelConta } from '@/lib/tipos';

// Dados da sessao atual, incluindo o papel (admin ou membro) para a interface
// mostrar ou esconder as accoes reservadas ao admin. O RLS continua a ser a
// barreira real no servidor; isto e apenas para a experiencia de utilizacao.
export interface Sessao {
  id: string | null;
  email: string | null;
  papel: PapelConta;
  ehAdmin: boolean;
}

export async function obterSessao(): Promise<Sessao> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { id: null, email: null, papel: 'membro', ehAdmin: false };
  }

  const { data: perfil } = await supabase.from('perfis').select('papel').eq('id', user.id).single();
  const papel = (perfil?.papel ?? 'membro') as PapelConta;

  return { id: user.id, email: user.email ?? null, papel, ehAdmin: papel === 'admin' };
}
