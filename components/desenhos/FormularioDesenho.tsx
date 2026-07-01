'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIAS_DESENHO, ESTADOS_DESENHO, type Desenho } from '@/lib/tipos';

// Formulario de desenho, usado para criar e editar.
// Serve tanto para os desenhos do catalogo como para os personalizados de cliente.
export default function FormularioDesenho({
  desenho,
  acao,
}: {
  desenho?: Desenho;
  acao: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [aGuardar, setAGuardar] = useState(false);
  const edicao = Boolean(desenho);

  return (
    <form
      action={async (fd) => {
        setAGuardar(true);
        await acao(fd);
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor="nome" className="rotulo">
          Nome do desenho
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="campo"
          placeholder="Ex: Exu Guardião"
          defaultValue={desenho?.nome ?? ''}
        />
      </div>

      <div>
        <label htmlFor="categoria" className="rotulo">
          Categoria
        </label>
        <select
          id="categoria"
          name="categoria"
          className="campo"
          defaultValue={desenho?.categoria ?? 'Personalizado de cliente'}
        >
          {CATEGORIAS_DESENHO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="estado" className="rotulo">
          Estado
        </label>
        <select id="estado" name="estado" className="campo" defaultValue={desenho?.estado ?? 'Só ideia'}>
          {ESTADOS_DESENHO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descricao" className="rotulo">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          className="campo py-2.5"
          placeholder="Notas, referência, ou detalhes do pedido do cliente"
          defaultValue={desenho?.descricao ?? ''}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="submit" className="botao" disabled={aGuardar}>
          {aGuardar ? 'A guardar...' : edicao ? 'Guardar alterações' : 'Criar desenho'}
        </button>
        <button type="button" className="botao-secundario" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
