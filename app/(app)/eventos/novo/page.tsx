import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioEvento from '@/components/eventos/FormularioEvento';
import { carregarOpcoesEvento } from '@/lib/consultas';
import { criarEvento } from '../acoes';

export default async function PaginaNovoEvento() {
  const opcoes = await carregarOpcoesEvento();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BotaoVoltar href="/eventos" />
      </div>
      <h1 style={{ fontSize: 30 }}>Novo evento</h1>
      <FormularioEvento acao={criarEvento} {...opcoes} />
    </section>
  );
}
