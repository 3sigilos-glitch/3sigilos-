'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIPOS_CLIENTE, type Cliente } from '@/lib/tipos';

// Formulario de cliente, usado para criar e editar.
export default function FormularioCliente({
  cliente,
  acao,
}: {
  cliente?: Cliente;
  acao: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [aGuardar, setAGuardar] = useState(false);
  const edicao = Boolean(cliente);

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
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="campo"
          placeholder="Nome do cliente"
          defaultValue={cliente?.nome ?? ''}
        />
      </div>

      <div>
        <label htmlFor="contacto" className="rotulo">
          Contacto
        </label>
        <input
          id="contacto"
          name="contacto"
          type="text"
          className="campo"
          placeholder="Telemóvel, email ou Instagram"
          defaultValue={cliente?.contacto ?? ''}
        />
      </div>

      <div>
        <label htmlFor="tipo" className="rotulo">
          Tipo
        </label>
        <select id="tipo" name="tipo" className="campo" defaultValue={cliente?.tipo ?? 'Normal'}>
          {TIPOS_CLIENTE.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nif" className="rotulo">
          NIF (opcional)
        </label>
        <input
          id="nif"
          name="nif"
          type="text"
          inputMode="numeric"
          className="campo"
          placeholder="Para a faturação"
          defaultValue={cliente?.nif ?? ''}
        />
      </div>

      <div>
        <label htmlFor="morada" className="rotulo">
          Morada (opcional)
        </label>
        <textarea
          id="morada"
          name="morada"
          rows={2}
          className="campo py-2.5"
          placeholder="Morada de envio ou de faturação"
          defaultValue={cliente?.morada ?? ''}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="submit" className="botao" disabled={aGuardar}>
          {aGuardar ? 'A guardar...' : edicao ? 'Guardar alterações' : 'Criar cliente'}
        </button>
        <button type="button" className="botao-secundario" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
