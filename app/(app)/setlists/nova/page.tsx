import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioSetlist from '@/components/setlists/FormularioSetlist';
import { criarSetlist } from '../acoes';

export default function PaginaNovaSetlist() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/setlists" />
      <h1 style={{ fontSize: 30 }}>Nova setlist</h1>
      <FormularioSetlist acao={criarSetlist} />
    </section>
  );
}
