import { criarClienteServico } from '@/lib/supabase/admin';
import { dataExtenso, hora, diasAte } from '@/lib/formatar';
import type { Evento, Definicoes } from '@/lib/tipos';

export const runtime = 'nodejs';

// Rota para envio automatico de lembretes pre-concerto, pensada para ser
// chamada por um agendador (Vercel Cron). Protegida por um segredo.
//
// Configuracao (opcional):
//  - CRON_SECRET: segredo partilhado (cabecalho Authorization: Bearer <segredo>)
//  - SUPABASE_SERVICE_ROLE_KEY: para ler dados sem sessao de utilizador
//  - RESEND_API_KEY e RESEND_FROM: para enviar os emails
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${segredo}`) {
      return new Response('Nao autorizado', { status: 401 });
    }
  }

  const chaveEmail = process.env.RESEND_API_KEY;
  if (!chaveEmail) {
    return Response.json({ ok: false, motivo: 'RESEND_API_KEY nao definido.' }, { status: 200 });
  }

  const supabase = criarClienteServico();

  const { data: defLinha } = await supabase.from('definicoes').select('*').eq('id', 1).single();
  const definicoes = defLinha as Definicoes | null;
  const dias = definicoes?.dias_lembrete_preconcerto ?? 15;

  const agora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);

  const { data: eventosData } = await supabase
    .from('eventos')
    .select('*')
    .eq('estado', 'confirmado')
    .gte('data', agora.toISOString())
    .lte('data', limite.toISOString())
    .order('data', { ascending: true });

  const eventos = (eventosData as Evento[]) ?? [];
  if (eventos.length === 0) {
    return Response.json({ ok: true, enviados: 0, motivo: 'Sem concertos na janela.' });
  }

  const { data: equipa } = await supabase
    .from('equipa')
    .select('email')
    .eq('papel', 'membro')
    .eq('ativo', true);
  const emails = ((equipa as { email: string | null }[]) ?? [])
    .map((m) => m.email)
    .filter((e): e is string => Boolean(e));

  if (emails.length === 0) {
    return Response.json({ ok: false, motivo: 'Sem emails de membros ativos.' });
  }

  const linhas = eventos.map((ev) => {
    const h = hora(ev.data);
    const sitio = [ev.local, ev.concelho].filter(Boolean).join(', ');
    return `- ${dataExtenso(ev.data)}${h ? `, ${h}` : ''}: ${ev.evento}${sitio ? `, ${sitio}` : ''} (faltam ${diasAte(ev.data) ?? 0} dias)`;
  });
  const texto = `Concertos confirmados nos proximos ${dias} dias:\n\n${linhas.join('\n')}`;

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chaveEmail}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'N\'ASA <agenda@nasa.pt>',
      to: emails,
      subject: 'Lembrete: concertos a chegar',
      text: texto,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    return Response.json({ ok: false, motivo: detalhe }, { status: 502 });
  }

  return Response.json({ ok: true, enviados: emails.length, concertos: eventos.length });
}
