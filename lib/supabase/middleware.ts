// Logica de sessao para o middleware do Next.js.
// Renova a sessao do Supabase em cada pedido e protege as rotas privadas,
// reencaminhando para o ecra de entrada quem nao tiver sessao iniciada.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Forma de cada cookie passado pelo Supabase ao definir a sessao.
type CookieParaDefinir = { name: string; value: string; options?: CookieOptions };

// Rotas acessiveis sem sessao iniciada.
// As rotas /api tratam da sua propria autenticacao (por exemplo, o cron usa um
// segredo proprio), por isso nao sao redirecionadas pelo middleware.
const ROTAS_PUBLICAS = ['/login', '/auth', '/api', '/.well-known', '/assistente-ponto-riscado'];

export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  // Sem as chaves do Supabase, o cliente rebenta e todas as paginas davam um
  // erro 500 mudo. Em vez disso, diz-se claramente o que falta configurar.
  const endereco = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!endereco || !chaveAnonima) {
    return new NextResponse(
      'Configuracao em falta: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Define estas variaveis de ambiente no Vercel (Settings, Environment Variables, ' +
        'ambiente Production) e faz novo deploy.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const supabase = createServerClient(
    endereco,
    chaveAnonima,
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

  const caminho = request.nextUrl.pathname;
  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => caminho.startsWith(rota));

  // O middleware corre em TODOS os pedidos e nao tem nenhum ecra de erro por
  // cima: se lancar, o utilizador ve a pagina nua "500 Internal Server Error" em
  // toda a app, incluindo no link magico. Por isso, qualquer falha aqui (sessao
  // estragada, Supabase inacessivel, renovacao de credenciais) e apanhada.
  try {
    // IMPORTANTE: nao colocar logica entre a criacao do cliente e o getUser.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Sem sessao e a tentar aceder a uma rota privada: vai para o login.
    if (!user && !ehRotaPublica) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      return NextResponse.redirect(url);
    }

    // Com sessao e a tentar abrir o login: vai para o painel.
    if (user && caminho.startsWith('/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/painel';
      url.search = '';
      return NextResponse.redirect(url);
    }

    return resposta;
  } catch {
    // Nas rotas publicas (login e confirmacao do link) deixa passar, para a
    // pessoa conseguir sempre entrar. Nas privadas, manda ao login por seguranca.
    if (ehRotaPublica) return resposta;
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '?erro=A sessao expirou ou nao foi possivel confirma-la. Entra de novo.';
    return NextResponse.redirect(url);
  }
}
