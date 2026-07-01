import { criarClienteServico } from '@/lib/supabase/admin';
import { exportarComCliente } from '@/lib/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Backup automatico semanal: exporta toda a informacao e envia por email,
// com o ficheiro JSON em anexo. Pensado para ser chamado pelo Vercel Cron.
//
// Configuracao (Environment Variables no Vercel):
//  - CRON_SECRET: segredo partilhado (cabecalho Authorization: Bearer <segredo>)
//  - SUPABASE_SERVICE_ROLE_KEY: para ler os dados sem sessao de utilizador
//  - RESEND_API_KEY e RESEND_FROM: para enviar o email
//  - BACKUP_EMAIL: destinatario (por omissao, casakmsm.ai@gmail.com)
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
    return Response.json({ ok: false, motivo: 'RESEND_API_KEY nao definido.' });
  }

  const destino = process.env.BACKUP_EMAIL ?? 'casakmsm.ai@gmail.com';

  // Exporta toda a informacao usando a chave de servico (sem sessao).
  let anexoBase64: string;
  let nomeFicheiro: string;
  try {
    const supabase = criarClienteServico();
    const backup = await exportarComCliente(supabase as any);
    const json = JSON.stringify(backup, null, 2);
    anexoBase64 = Buffer.from(json, 'utf8').toString('base64');
    nomeFicheiro = `backup-nasa-${new Date().toISOString().slice(0, 10)}.json`;
  } catch (e: any) {
    return Response.json({ ok: false, motivo: `Falha ao exportar: ${e?.message ?? e}` }, { status: 500 });
  }

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chaveEmail}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'N\'ASA <backup@nasa.pt>',
      to: [destino],
      subject: 'Backup N\'ASA Backoffice app',
      text: `Em anexo, a copia de seguranca automatica da aplicacao dos N'ASA (${nomeFicheiro}).`,
      attachments: [{ filename: nomeFicheiro, content: anexoBase64 }],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    return Response.json({ ok: false, motivo: detalhe }, { status: 502 });
  }

  return Response.json({ ok: true, enviado_para: destino, ficheiro: nomeFicheiro });
}
