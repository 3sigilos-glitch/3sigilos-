import FormularioDesenho from '@/components/desenhos/FormularioDesenho';
import { criarDesenho } from '../acoes';

// Criar um desenho novo (do catalogo ou personalizado de cliente).
export default function PaginaNovoDesenho() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Novo desenho</h1>
      <FormularioDesenho acao={criarDesenho} />
    </div>
  );
}
