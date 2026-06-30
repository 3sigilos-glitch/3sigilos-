import Link from 'next/link';
import { notFound } from 'next/navigation';
import AccoesProposta from '@/components/proposta/AccoesProposta';
import { obterEvento, obterDefinicoes } from '@/lib/consultas';
import { construirTextoProposta } from '@/lib/proposta';
import { gerarProposta } from './acoes';

export default async function PaginaProposta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evento, definicoes] = await Promise.all([obterEvento(id), obterDefinicoes()]);
  if (!evento) notFound();

  const gerar = gerarProposta.bind(null, id);

  // Ainda sem referencia: oferece gerar a proposta (atribui a referencia).
  if (!evento.referencia) {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Link href={`/eventos/${id}`} style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
        <h1 style={{ fontSize: 30 }}>Proposta</h1>
        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ color: 'var(--texto-suave)', lineHeight: 1.6, fontSize: 15 }}>
            Este evento ainda nao tem proposta. Ao gerar, e atribuida uma referencia unica
            (formato NASA, ano e numero) e fica marcada a data da proposta.
          </p>
          <form action={gerar}>
            <button type="submit" className="botao">Gerar proposta</button>
          </form>
        </div>
      </section>
    );
  }

  const texto = construirTextoProposta(evento, definicoes);
  const pdfUrl = `/eventos/${id}/proposta/pdf`;

  // Rascunho de email (mailto) pre-preenchido para o contratante.
  const destino = evento.contratante?.email ?? '';
  const assunto = `Proposta ${evento.referencia} | ${definicoes?.nome_banda ?? "N'ASA"}`;
  const mailtoHref = `mailto:${destino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/eventos/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--texto-suave)', fontSize: 14 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg>Voltar</Link>
        <span className="carimbo carimbo--caixa">{evento.referencia}</span>
      </div>
      <h1 style={{ fontSize: 30 }}>Proposta</h1>

      <AccoesProposta
        eventoId={id}
        texto={texto}
        pdfUrl={pdfUrl}
        mailtoHref={mailtoHref}
        temEmailContratante={Boolean(destino)}
      />

      {/* Pre-visualizacao do texto, pronto a copiar. */}
      <pre
        style={{
          background: 'var(--superficie)',
          border: '1px solid var(--linha)',
          borderRadius: 'var(--raio)',
          padding: 16,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--fonte-corpo)',
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--texto)',
        }}
      >
        {texto}
      </pre>
    </section>
  );
}
