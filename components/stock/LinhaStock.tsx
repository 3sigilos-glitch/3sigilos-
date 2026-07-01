'use client';

import { useState } from 'react';
import BotaoApagar from '@/components/BotaoApagar';
import { entradaStock, atualizarStock, apagarTshirt } from '@/app/(app)/stock/acoes';
import type { TshirtBranca } from '@/lib/tipos';

// Linha de stock de uma cor e tamanho.
// Mostra o alerta de "Repor", a entrada rapida e a edicao do acerto manual.
export default function LinhaStock({ tshirt }: { tshirt: TshirtBranca }) {
  const [aEditar, setAEditar] = useState(false);
  const repor = tshirt.quantidade <= tshirt.minimo;

  return (
    <li className={`cartao flex flex-col gap-3 ${repor ? 'border-estado-repor/60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-texto">
            {tshirt.cor} <span className="text-texto-suave">· {tshirt.tamanho}</span>
          </p>
          <p className="text-[12px] text-texto-fraco">Mínimo: {tshirt.minimo}</p>
        </div>
        <div className="flex items-center gap-3">
          {repor && (
            <span className="etiqueta text-estado-repor">Repor</span>
          )}
          <span className="font-titulo text-2xl text-texto">{tshirt.quantidade}</span>
        </div>
      </div>

      {!aEditar ? (
        <div className="flex flex-wrap items-center gap-2">
          {/* Entrada rapida: somar unidades quando se compram mais. */}
          <form action={entradaStock} className="flex items-center gap-2">
            <input type="hidden" name="id" value={tshirt.id} />
            <input
              type="number"
              name="entrada"
              defaultValue={10}
              min={1}
              inputMode="numeric"
              aria-label="Unidades a adicionar"
              className="h-10 w-20 rounded-pequeno border border-linha bg-superficie-2 px-3 text-texto"
            />
            <button className="rounded-pequeno border border-dourado px-3 py-2 text-[13px] font-semibold text-dourado">
              Entrada
            </button>
          </form>
          <button
            type="button"
            onClick={() => setAEditar(true)}
            className="rounded-pequeno border border-linha px-3 py-2 text-[13px] text-texto-suave"
          >
            Acertar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 border-t border-linha pt-3">
          <form action={atualizarStock} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={tshirt.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="rotulo">Quantidade</label>
                <input
                  type="number"
                  name="quantidade"
                  defaultValue={tshirt.quantidade}
                  min={0}
                  inputMode="numeric"
                  className="campo"
                />
              </div>
              <div>
                <label className="rotulo">Mínimo</label>
                <input
                  type="number"
                  name="minimo"
                  defaultValue={tshirt.minimo}
                  min={0}
                  inputMode="numeric"
                  className="campo"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="botao" onClick={() => setAEditar(false)}>
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setAEditar(false)}
                className="botao-secundario"
              >
                Cancelar
              </button>
            </div>
          </form>
          <BotaoApagar
            acao={apagarTshirt.bind(null, tshirt.id)}
            confirmacao={`Apagar o stock de ${tshirt.cor} ${tshirt.tamanho}?`}
            etiqueta="Apagar linha de stock"
          />
        </div>
      )}
    </li>
  );
}
