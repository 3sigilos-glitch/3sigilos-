import { redirect } from 'next/navigation';

// A raiz encaminha sempre para o painel.
// O middleware trata de enviar para o login quem nao tiver sessao.
export default function Pagina() {
  redirect('/painel');
}
