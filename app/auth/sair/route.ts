import { NextResponse } from 'next/server';
import { criarClienteServidor } from '@/lib/supabase/server';

// Termina a sessao e volta ao ecra de entrada.
export async function POST(request: Request) {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
