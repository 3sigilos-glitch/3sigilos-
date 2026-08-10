import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { criarClienteServidor } from '@/lib/supabase/server';

// Esta rota trata do link magico e nunca pode rebentar: se falhar, o utilizador
// fica sem forma de entrar na app. Qualquer problema leva de volta ao login com
// o motivo a vista, em vez de um erro 500 sem explicacao.
export const dynamic = 'force-dynamic';

// Confirma o link magico recebido por email e cria a sessao.
// Suporta os dois formatos do Supabase: token_hash (verifyOtp) e code (PKCE).
export async function GET(request: NextRequest) {
  // Volta ao login, com um motivo curto para se perceber o que falhou.
  const paraLogin = (motivo?: string) => {
    const url = new URL('/login', request.url);
    if (motivo) url.searchParams.set('erro', motivo.slice(0, 200));
    return NextResponse.redirect(url);
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenHash = searchParams.get('token_hash');
    const tipo = searchParams.get('type') as EmailOtpType | null;
    const code = searchParams.get('code');

    // O destino vem do endereco e nunca deve poder levar para fora da app.
    // So aceita um caminho interno simples (comeca por "/" e nao por "//" nem
    // "/\"), senao volta ao painel. Evita que um link forjado use o nosso
    // dominio para atirar alguem para um site falso depois de entrar.
    const destinoBruto = searchParams.get('next');
    const destino = destinoBruto && /^\/(?![/\\])/.test(destinoBruto) ? destinoBruto : '/painel';

    // Constroi o destino a partir do proprio pedido, para o endereco de base
    // ser sempre o correto (evita redirecionar para o sitio errado).
    const irPara = () => NextResponse.redirect(new URL(destino, request.url));

    const supabase = await criarClienteServidor();

    if (tokenHash && tipo) {
      const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
      if (!error) return irPara();
      return paraLogin(error.message);
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return irPara();
      // Falha tipica: o link foi aberto noutro browser ou noutra aplicacao (por
      // exemplo, o browser interno do email), onde falta a chave de conferencia
      // que ficou no browser em que se pediu o link. Explica-se em vez de
      // mostrar o erro tecnico.
      if (/verifier|storage/i.test(error.message)) {
        return paraLogin(
          'abre o link no mesmo browser onde o pediste. Pede um link novo aqui e, ' +
            'no email, mantem premido o link e escolhe abrir no browser.'
        );
      }
      return paraLogin(error.message);
    }

    return paraLogin('O link nao trazia codigo de confirmacao. Pede um link novo.');
  } catch (e: any) {
    return paraLogin(e?.message ?? 'Falha inesperada ao confirmar o link.');
  }
}
