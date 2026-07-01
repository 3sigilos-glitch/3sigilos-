'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { euros, hoje } from '@/lib/formatar';
import { precoReferencia, CUSTO_POR_DEFEITO } from '@/lib/referencia';
import {
  TAMANHOS,
  METODOS_PAGAMENTO,
  ESTADOS_ENCOMENDA,
  type Cliente,
  type Desenho,
  type Encomenda,
} from '@/lib/tipos';

// Formulario de encomenda, usado no registo rapido e na edicao.
// O total e a margem atualizam-se em tempo real enquanto se preenche.
export default function FormularioEncomenda({
  clientes,
  desenhos,
  coresStock,
  encomenda,
  acao,
}: {
  clientes: Cliente[];
  desenhos: Desenho[];
  coresStock: string[];
  encomenda?: Encomenda;
  acao: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const edicao = Boolean(encomenda);

  const [clienteId, setClienteId] = useState(encomenda?.cliente_id ?? '');
  const [desenhoId, setDesenhoId] = useState(encomenda?.desenho_id ?? '');
  const [quantidade, setQuantidade] = useState(encomenda?.quantidade ?? 1);
  const [preco, setPreco] = useState(encomenda?.preco ?? precoReferencia(null, null));
  const [custo, setCusto] = useState(encomenda?.custo ?? CUSTO_POR_DEFEITO);
  const [pago, setPago] = useState(encomenda?.pago ?? false);
  const [faturado, setFaturado] = useState(encomenda?.faturado ?? false);
  const [aGuardar, setAGuardar] = useState(false);

  // Em edicao, respeita o preco ja guardado e nao o sobrepoe com a referencia.
  const precoTocado = useRef(edicao);

  // Atualiza a sugestao de preco quando muda o cliente ou o desenho,
  // a menos que o preco ja tenha sido editado a mao.
  function recalcularReferencia(novoClienteId: string, novoDesenhoId: string) {
    if (precoTocado.current) return;
    const tipo = clientes.find((c) => c.id === novoClienteId)?.tipo ?? null;
    const nome = desenhos.find((d) => d.id === novoDesenhoId)?.nome ?? null;
    setPreco(precoReferencia(tipo, nome));
  }

  const total = useMemo(() => preco * quantidade, [preco, quantidade]);
  const margem = useMemo(() => (preco - custo) * quantidade, [preco, custo, quantidade]);

  // Mostra a descricao livre quando nao se escolheu um desenho do catalogo.
  const usarDescricaoLivre = desenhoId === '';

  return (
    <form
      action={async (fd) => {
        setAGuardar(true);
        await acao(fd);
      }}
      className="flex flex-col gap-4"
    >
      {/* Cliente e desenho, os dois que sugerem o preco. */}
      <div>
        <label htmlFor="cliente_id" className="rotulo">
          Cliente
        </label>
        <select
          id="cliente_id"
          name="cliente_id"
          className="campo"
          value={clienteId}
          onChange={(e) => {
            setClienteId(e.target.value);
            recalcularReferencia(e.target.value, desenhoId);
          }}
        >
          <option value="">Sem cliente (pontual)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.tipo})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="desenho_id" className="rotulo">
          Desenho
        </label>
        <select
          id="desenho_id"
          name="desenho_id"
          className="campo"
          value={desenhoId}
          onChange={(e) => {
            setDesenhoId(e.target.value);
            recalcularReferencia(clienteId, e.target.value);
          }}
        >
          <option value="">Pedido livre (descrição)</option>
          {desenhos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>

      {usarDescricaoLivre && (
        <div>
          <label htmlFor="descricao_livre" className="rotulo">
            Descrição do pedido
          </label>
          <input
            id="descricao_livre"
            name="descricao_livre"
            type="text"
            className="campo"
            placeholder="Ex: desenho enviado pelo cliente"
            defaultValue={encomenda?.descricao_livre ?? ''}
          />
        </div>
      )}

      {/* Cor e tamanho da t-shirt. */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cor" className="rotulo">
            Cor
          </label>
          <input
            id="cor"
            name="cor"
            type="text"
            list="cores-stock"
            className="campo"
            placeholder="Ex: Preto"
            defaultValue={encomenda?.cor ?? ''}
          />
          <datalist id="cores-stock">
            {coresStock.map((cor) => (
              <option key={cor} value={cor} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="tamanho" className="rotulo">
            Tamanho
          </label>
          <select id="tamanho" name="tamanho" className="campo" defaultValue={encomenda?.tamanho ?? 'M'}>
            {TAMANHOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantidade, preco e custo. */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="quantidade" className="rotulo">
            Qtd.
          </label>
          <input
            id="quantidade"
            name="quantidade"
            type="number"
            min={1}
            inputMode="numeric"
            className="campo"
            value={quantidade}
            onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div>
          <label htmlFor="preco" className="rotulo">
            Preço/un.
          </label>
          <input
            id="preco"
            name="preco"
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
            className="campo"
            value={preco}
            onChange={(e) => {
              precoTocado.current = true;
              setPreco(Number(e.target.value) || 0);
            }}
          />
        </div>
        <div>
          <label htmlFor="custo" className="rotulo">
            Custo/un.
          </label>
          <input
            id="custo"
            name="custo"
            type="number"
            min={0}
            step="0.5"
            inputMode="decimal"
            className="campo"
            value={custo}
            onChange={(e) => setCusto(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Total e margem em tempo real. */}
      <div className="flex items-center justify-between rounded-media border border-linha bg-superficie-2 px-4 py-3">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-texto-fraco">Total</p>
          <p className="font-titulo text-2xl text-dourado">{euros(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] uppercase tracking-wide text-texto-fraco">Margem</p>
          <p className="font-titulo text-lg text-texto">{euros(margem)}</p>
        </div>
      </div>

      {/* Data da encomenda. */}
      <div>
        <label htmlFor="data" className="rotulo">
          Data
        </label>
        <input
          id="data"
          name="data"
          type="date"
          className="campo"
          defaultValue={encomenda?.data ?? hoje()}
        />
      </div>

      {/* Pagamento. */}
      <div>
        <label htmlFor="metodo_pagamento" className="rotulo">
          Método de pagamento
        </label>
        <select
          id="metodo_pagamento"
          name="metodo_pagamento"
          className="campo"
          defaultValue={encomenda?.metodo_pagamento ?? ''}
        >
          <option value="">Por definir</option>
          {METODOS_PAGAMENTO.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-media border border-linha bg-superficie-2 px-4">
        <input
          type="checkbox"
          name="pago"
          checked={pago}
          onChange={(e) => setPago(e.target.checked)}
          className="h-5 w-5 accent-dourado"
        />
        <span className="text-[15px]">Já está pago</span>
      </label>

      {pago && (
        <div>
          <label htmlFor="data_pagamento" className="rotulo">
            Data de pagamento
          </label>
          <input
            id="data_pagamento"
            name="data_pagamento"
            type="date"
            className="campo"
            defaultValue={encomenda?.data_pagamento ?? hoje()}
          />
        </div>
      )}

      {/* Estado de producao. */}
      <div>
        <label htmlFor="estado" className="rotulo">
          Estado
        </label>
        <select id="estado" name="estado" className="campo" defaultValue={encomenda?.estado ?? 'Por estampar'}>
          {ESTADOS_ENCOMENDA.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {!edicao && (
          <p className="mt-1.5 text-[12px] text-texto-fraco">
            Ao ficar entregue, abate uma t-shirt em branco da cor e tamanho ao stock.
          </p>
        )}
      </div>

      {/* Faturacao. */}
      <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-media border border-linha bg-superficie-2 px-4">
        <input
          type="checkbox"
          name="faturado"
          checked={faturado}
          onChange={(e) => setFaturado(e.target.checked)}
          className="h-5 w-5 accent-dourado"
        />
        <span className="text-[15px]">Já foi faturada</span>
      </label>

      {faturado && (
        <div>
          <label htmlFor="data_faturacao" className="rotulo">
            Data de faturação
          </label>
          <input
            id="data_faturacao"
            name="data_faturacao"
            type="date"
            className="campo"
            defaultValue={encomenda?.data_faturacao ?? hoje()}
          />
        </div>
      )}

      {/* Notas. */}
      <div>
        <label htmlFor="notas" className="rotulo">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          className="campo py-2.5"
          placeholder="Qualquer detalhe do pedido"
          defaultValue={encomenda?.notas ?? ''}
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="submit" className="botao" disabled={aGuardar}>
          {aGuardar ? 'A guardar...' : edicao ? 'Guardar alterações' : 'Registar encomenda'}
        </button>
        <button type="button" className="botao-secundario" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
