import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioRecibo from '@/components/recibos/FormularioRecibo';
import { carregarOpcoesRecibo } from '@/lib/consultas';
import { criarRecibo } from '../acoes';

export default async function PaginaNovoRecibo({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const { evento } = await searchParams;
  const { eventos, membros } = await carregarOpcoesRecibo();
  // Vindo de "Por passar" (com concerto na ligacao): ja pre-seleciona o concerto
  // e marca como passado, para so escolher quem passou, o valor e a data.
  const aPassar = Boolean(evento);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/recibos" />
      <h1 style={{ fontSize: 30 }}>{aPassar ? 'Passar recibo' : 'Novo recibo'}</h1>
      {aPassar && (
        <p style={{ color: 'var(--texto-suave)', fontSize: 14, lineHeight: 1.6, marginTop: -8 }}>
          Escolhe quem passou o recibo, o valor e a data. Fica marcado como passado.
        </p>
      )}
      <FormularioRecibo
        acao={criarRecibo}
        eventos={eventos}
        membros={membros}
        eventoInicial={evento}
        passadoInicial={aPassar}
      />
    </section>
  );
}
