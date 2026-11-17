import { criarClienteServico } from '@/lib/supabase/admin';
import { sincronizarComCalendario } from '@/lib/calendarioDados';

export const runtime = 'nodejs';
// Le as variaveis de ambiente e o calendario em cada pedido (nunca em cache).
export const dynamic = 'force-dynamic';

// Revisao automatica do calendario Google, chamada uma vez por dia pelo Vercel
// Cron (antes dos lembretes das 9h). Faz o mesmo que acontece quando alguem
// abre a Agenda: liga eventos as entradas do calendario e atualiza estados
// (confirmado, cancelado). Nao importa concertos novos: isso fica sempre com
// um toque de alguem na Agenda.
//
// Fechada por omissao: sem CRON_SECRET definido, ninguem a consegue chamar.
// Precisa tambem de SUPABASE_SERVICE_ROLE_KEY (nao ha sessao de utilizador).
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return new Response('Rota desativada: falta definir CRON_SECRET.', { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${segredo}`) {
    return new Response('Nao autorizado', { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ ok: false, motivo: 'Falta SUPABASE_SERVICE_ROLE_KEY.' });
  }

  try {
    const r = await sincronizarComCalendario(criarClienteServico());
    return Response.json({
      ok: r.estado === 'ligado',
      calendario: r.estado,
      ligados: r.ligados,
      estadosAtualizados: r.alterados.length,
      aVerificar: r.mudouDia.length + r.desapareceu.length,
    });
  } catch {
    return Response.json({ ok: false, motivo: 'Falha inesperada.' }, { status: 500 });
  }
}
