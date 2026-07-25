import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioRecibo from '@/components/recibos/FormularioRecibo';
import { carregarOpcoesRecibo } from '@/lib/consultas';
import { criarRecibo } from '../acoes';

export default async function PaginaNovoRecibo() {
  const { eventos, membros } = await carregarOpcoesRecibo();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/recibos" />
      <h1 style={{ fontSize: 30 }}>Novo recibo</h1>
      <FormularioRecibo acao={criarRecibo} eventos={eventos} membros={membros} />
    </section>
  );
}
