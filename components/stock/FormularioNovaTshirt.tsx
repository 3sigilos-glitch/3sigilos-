'use client';

import { useState } from 'react';
import { adicionarTshirt } from '@/app/(app)/stock/acoes';
import { TAMANHOS } from '@/lib/tipos';

// Formulario para acrescentar uma nova combinacao de cor e tamanho ao stock.
// Comeca recolhido para manter a vista de stock leve.
export default function FormularioNovaTshirt() {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="botao-secundario">
        Adicionar cor ou tamanho
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await adicionarTshirt(fd);
        setAberto(false);
      }}
      className="cartao flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nova-cor" className="rotulo">
            Cor
          </label>
          <input id="nova-cor" name="cor" type="text" required className="campo" placeholder="Ex: Preto" />
        </div>
        <div>
          <label htmlFor="nova-tamanho" className="rotulo">
            Tamanho
          </label>
          <select id="nova-tamanho" name="tamanho" className="campo" defaultValue="M">
            {TAMANHOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nova-quantidade" className="rotulo">
            Quantidade
          </label>
          <input
            id="nova-quantidade"
            name="quantidade"
            type="number"
            min={0}
            defaultValue={0}
            inputMode="numeric"
            className="campo"
          />
        </div>
        <div>
          <label htmlFor="nova-minimo" className="rotulo">
            Mínimo
          </label>
          <input
            id="nova-minimo"
            name="minimo"
            type="number"
            min={0}
            defaultValue={3}
            inputMode="numeric"
            className="campo"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="botao">
          Adicionar
        </button>
        <button type="button" onClick={() => setAberto(false)} className="botao-secundario">
          Cancelar
        </button>
      </div>
    </form>
  );
}
