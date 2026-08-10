import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { criarClienteServidor } from '@/lib/supabase/server';

// Confirma o link magico recebido por email e cria a sessao.
// Suporta os dois formatos do Supabase: token_hash (verifyOtp) e code (PKCE).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const destino = searchParams.get('next') ?? '/painel';

  const supabase = await criarClienteServidor();

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  // Falhou a confirmacao: volta ao login.
  return NextResponse.redirect(`${origin}/login`);
}
