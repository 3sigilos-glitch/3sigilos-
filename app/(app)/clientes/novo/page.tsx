import FormularioCliente from '@/components/clientes/FormularioCliente';
import { criarCliente } from '../acoes';

// Criar um cliente novo.
export default function PaginaNovoCliente() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Novo cliente</h1>
      <FormularioCliente acao={criarCliente} />
    </div>
  );
}
