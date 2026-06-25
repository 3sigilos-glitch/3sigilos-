import { obterEvento, obterDefinicoes } from '@/lib/consultas';
import { gerarPdfProposta } from '@/lib/propostaPdf';

// O pdf-lib e a leitura de ficheiros precisam do ambiente Node.
export const runtime = 'nodejs';

// Devolve o PDF da proposta deste evento, para ver ou descarregar.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evento, definicoes] = await Promise.all([obterEvento(id), obterDefinicoes()]);
  if (!evento) return new Response('Evento nao encontrado', { status: 404 });

  const pdf = await gerarPdfProposta(evento, definicoes);
  const nome = `proposta-${evento.referencia ?? id}.pdf`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nome}"`,
    },
  });
}
