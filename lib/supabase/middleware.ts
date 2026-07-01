// Logica de sessao para o middleware do Next.js.
// Renova a sessao do Supabase em cada pedido e protege as rotas privadas,
// reencaminhando para o ecra de entrada quem nao tiver sessao iniciada.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Forma de cada cookie passado pelo Supabase ao definir a sessao.
type CookieParaDefinir = { name: string; value: string; options?: CookieOptions };

// Rotas acessiveis sem sessao iniciada (ecra de entrada e fim de sessao).
const ROTAS_PUBLICAS = ['/login', '/auth'];

export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaDefinir: CookieParaDefinir[]) {
          cookiesParaDefinir.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          resposta = NextResponse.next({ request });
          cookiesParaDefinir.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: nao colocar logica entre a criacao do cliente e o getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => caminho.startsWith(rota));

  // Sem sessao e a tentar aceder a uma rota privada: vai para o login.
  if (!user && !ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Com sessao e a tentar abrir o login: vai para o painel.
  if (user && caminho.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/painel';
    return NextResponse.redirect(url);
  }

  return resposta;
}
