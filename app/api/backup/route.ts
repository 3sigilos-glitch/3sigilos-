import { exportarTudo } from '@/lib/backup';
import { obterSessao } from '@/lib/sessao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Descarrega uma copia de seguranca de toda a informacao, em JSON.
// Reservado ao admin.
export async function GET() {
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) {
    return new Response('Reservado ao admin.', { status: 403 });
  }

  const backup = await exportarTudo();
  const data = new Date().toISOString().slice(0, 10);
  const nome = `backup-nasa-${data}.json`;

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${nome}"`,
    },
  });
}
