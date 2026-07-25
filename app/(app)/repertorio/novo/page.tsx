import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioMusica from '@/components/repertorio/FormularioMusica';
import { criarMusica } from '../acoes';

export default function PaginaNovaMusica() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/repertorio" />
      <h1 style={{ fontSize: 30 }}>Nova musica</h1>
      <FormularioMusica acao={criarMusica} />
    </section>
  );
}
