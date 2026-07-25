import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioContacto from '@/components/contactos/FormularioContacto';
import { criarContacto } from '../acoes';

export default function PaginaNovoContacto() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/contactos" />
      <h1 style={{ fontSize: 30 }}>Novo contacto</h1>
      <FormularioContacto acao={criarContacto} />
    </section>
  );
}
