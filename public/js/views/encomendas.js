/* Vista de gestao de encomendas: lista, filtros, formulario e ficha. */
window.App = window.App || {};
App.views = App.views || {};

App.views.encomendas = {
  titulo: 'Encomendas',
  icone: '✉',

  async render(el) {
    el.innerHTML = '<div class="carregar">A carregar encomendas...</div>';
    const cat = await App.estado.catalogo();
    const ui = App.ui;

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Encomendas</h1>
          <div class="subtitulo">Registo e acompanhamento de encomendas</div>
        </div>
        <div class="barra-acoes">
          <button class="btn" id="impEmail">Importar de email</button>
          <button class="btn primario" id="novaEnc">Nova encomenda</button>
        </div>
      </div>

      <div class="cartao">
        <div class="filtros">
          <div class="campo"><label>Pesquisar</label><input id="fPesquisa" placeholder="Cliente ou nota" /></div>
          <div class="campo"><label>Pagamento</label><select id="fPag"><option value="">Todos</option>${ui.opcoes(cat.estados_pagamento)}</select></div>
          <div class="campo"><label>Entrega</label><select id="fEnt"><option value="">Todos</option>${ui.opcoes(cat.estados_entrega)}</select></div>
          <div class="campo"><label>Canal</label><select id="fCanal"><option value="">Todos</option>${ui.opcoes(cat.canais)}</select></div>
          <div class="campo"><label>Modelo</label><select id="fModelo"><option value="">Todos</option>${ui.opcoes(cat.modelos)}</select></div>
          <button class="btn" id="exportCsv">Exportar CSV</button>
          <button class="btn" id="exportPdf">Exportar PDF</button>
        </div>
        <div id="listaEnc"><div class="carregar">A carregar...</div></div>
      </div>
    `;

    const recarregar = () => this.carregarLista(el);
    ['fPesquisa', 'fPag', 'fEnt', 'fCanal', 'fModelo'].forEach((id) => {
      const elem = el.querySelector('#' + id);
      elem.oninput = recarregar;
      elem.onchange = recarregar;
    });
    el.querySelector('#novaEnc').onclick = () => this.abrirFormulario();
    el.querySelector('#impEmail').onclick = () => this.abrirImportEmail();
    el.querySelector('#exportCsv').onclick = () => (window.location = '/api/encomendas/exportar.csv?' + this.queryFiltros(el));
    el.querySelector('#exportPdf').onclick = () => (window.location = '/api/encomendas/exportar.pdf?' + this.queryFiltros(el));

    this.elRaiz = el;
    await this.carregarLista(el);
  },

  queryFiltros(el) {
    const p = new URLSearchParams();
    const v = (id) => el.querySelector('#' + id).value;
    if (v('fPesquisa')) p.set('pesquisa', v('fPesquisa'));
    if (v('fPag')) p.set('estado_pagamento', v('fPag'));
    if (v('fEnt')) p.set('estado_entrega', v('fEnt'));
    if (v('fCanal')) p.set('canal', v('fCanal'));
    if (v('fModelo')) p.set('modelo', v('fModelo'));
    return p.toString();
  },

  async carregarLista(el) {
    const ui = App.ui;
    const lista = await App.api.get('/api/encomendas?' + this.queryFiltros(el));
    const cont = el.querySelector('#listaEnc');
    if (!lista.length) {
      cont.innerHTML = '<div class="vazio">Sem encomendas para os filtros escolhidos.</div>';
      return;
    }
    cont.innerHTML = `<div class="tabela-wrap"><table>
      <thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Produtos</th><th>Total</th><th>Margem</th><th>Pagamento</th><th>Entrega</th><th>Canal</th></tr></thead>
      <tbody>${lista
        .map(
          (e) => `<tr style="cursor:pointer" data-id="${e.id}">
            <td>${e.id}</td>
            <td>${ui.data(e.criado_em)}</td>
            <td>${ui.esc(e.cliente_nome)}</td>
            <td>${ui.esc(this.descricao(e))}</td>
            <td>${ui.euros(e.preco_total)}</td>
            <td>${ui.euros(e.margem)}</td>
            <td>${ui.etiquetaEstado(e.estado_pagamento)}</td>
            <td>${ui.etiquetaEstado(e.estado_entrega)}</td>
            <td>${ui.esc(e.canal || '')}</td>
          </tr>`
        )
        .join('')}</tbody></table></div>`;
    cont.querySelectorAll('[data-id]').forEach((tr) => {
      tr.onclick = () => this.abrirFicha(Number(tr.dataset.id));
    });
  },

  descricao(e) {
    if (Array.isArray(e.itens) && e.itens.length) {
      return e.itens.map((i) => `${i.quantidade}x ${i.modelo} ${i.tamanho}`).join(', ');
    }
    return e.pedido_texto || '';
  },

  // Ficha de detalhe de uma encomenda
  async abrirFicha(id) {
    const ui = App.ui;
    const e = await App.api.get('/api/encomendas/' + id);
    const linhas = [
      ['Cliente', e.cliente_nome],
      ['Produtos', this.descricao(e)],
      ['Tipo de preco', e.tipo_preco],
      ['Preco unitario', ui.euros(e.preco_unitario)],
      ['Desconto', ui.euros(e.desconto)],
      ['Total', ui.euros(e.preco_total)],
      ['Custo', ui.euros(e.custo_total)],
      ['Margem', ui.euros(e.margem)],
      ['Metodo de pagamento', e.metodo_pagamento || ''],
      ['Estado de pagamento', e.estado_pagamento],
      ['Data de pagamento', ui.data(e.data_pagamento)],
      ['Estado de entrega', e.estado_entrega],
      ['Data de envio', ui.data(e.data_envio)],
      ['Tracking', e.tracking || ''],
      ['Canal', e.canal || ''],
      ['Venda Etsy', e.etsy_venda || ''],
      ['Taxas Etsy', ui.euros(e.etsy_taxas)],
      ['Regiao', e.regiao],
      ['Estampagem atribuida', e.estampagem_atribuida ? 'Sim' : 'Nao'],
      ['Notas', e.notas || ''],
    ];
    const corpo = ui.abrirModal(
      'Encomenda ' + e.id,
      `<ul class="lista-dados">${linhas
        .map((l) => `<li><span style="color:var(--texto-suave)">${ui.esc(l[0])}</span><span>${ui.esc(l[1])}</span></li>`)
        .join('')}</ul>
      <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
        <button class="btn perigo" id="eliminarEnc">Eliminar</button>
        <button class="btn primario" id="editarEnc">Editar</button>
      </div>`
    );
    corpo.querySelector('#editarEnc').onclick = () => this.abrirFormulario(e);
    corpo.querySelector('#eliminarEnc').onclick = async () => {
      if (await ui.confirmar('Eliminar a encomenda ' + e.id + '?')) {
        await App.api.del('/api/encomendas/' + e.id);
        ui.fecharModal();
        ui.toast('Encomenda eliminada', 'sucesso');
        if (this.elRaiz) this.carregarLista(this.elRaiz);
      }
    };
  },

  // Formulario de nova encomenda ou edicao. Aceita objeto existente ou pre-preenchimento.
  async abrirFormulario(existente) {
    const ui = App.ui;
    const cat = await App.estado.catalogo();
    const clientes = await App.api.get('/api/clientes');
    const e = existente || {};
    const itens = (e.itens && e.itens.length ? e.itens : [{ modelo: cat.modelos[0], tamanho: 'M', quantidade: 1 }]);

    const corpo = ui.abrirModal(e.id ? 'Editar encomenda ' + e.id : 'Nova encomenda', `
      <form id="formEnc">
        <div class="linha-form">
          <div class="campo">
            <label>Cliente</label>
            <select id="clienteSel">
              <option value="">Sem cliente associado</option>
              ${ui.opcoes(clientes, e.cliente_id, { valor: 'id', etiqueta: 'nome' })}
            </select>
          </div>
          <div class="campo">
            <label>Nome do cliente</label>
            <input id="clienteNome" value="${ui.esc(e.cliente_nome || '')}" placeholder="Nome para a encomenda" />
          </div>
        </div>

        <div class="seccao-titulo">Produtos</div>
        <div id="itens"></div>
        <button type="button" class="btn pequeno" id="addItem">Adicionar linha</button>
        <div class="caixa-check" style="margin-top:0.7rem">
          <input type="checkbox" id="packTarot" ${e.is_pack_tarot ? 'checked' : ''} />
          <label for="packTarot" style="margin:0">Pack Tarot (Roda da Fortuna, A Estrela e O Mundo, 50 euros)</label>
        </div>
        <div class="campo" style="margin-top:0.7rem">
          <label>Pedido em texto livre (opcional)</label>
          <input id="pedidoTexto" value="${ui.esc(e.pedido_texto || '')}" placeholder="Descricao livre do pedido" />
        </div>

        <div class="seccao-titulo">Preco</div>
        <div class="linha-form tres">
          <div class="campo">
            <label>Tipo de preco</label>
            <select id="tipoPreco">${ui.opcoes(cat.tipos_preco, e.tipo_preco || 'normal', { valor: 'id', etiqueta: 'etiqueta' })}</select>
          </div>
          <div class="campo" id="campoManual" style="display:none">
            <label>Preco unitario personalizado</label>
            <input type="number" step="0.01" id="precoManual" value="${ui.esc(e.preco_unitario || '')}" />
          </div>
          <div class="campo">
            <label>Desconto manual (euros)</label>
            <input type="number" step="0.01" id="desconto" value="${ui.esc(e.desconto || 0)}" />
          </div>
        </div>

        <div class="resumo-fin" id="resumoFin">
          <div class="item"><div class="r">Unidades</div><div class="v" id="rUnid">0</div></div>
          <div class="item"><div class="r">Total</div><div class="v" id="rTotal">0</div></div>
          <div class="item"><div class="r">Custo</div><div class="v" id="rCusto">0</div></div>
          <div class="item"><div class="r">Margem</div><div class="v" id="rMargem">0</div></div>
        </div>

        <div class="seccao-titulo">Pagamento e entrega</div>
        <div class="linha-form tres">
          <div class="campo">
            <label>Metodo de pagamento</label>
            <select id="metodo"><option value="">Nao definido</option>${ui.opcoes(cat.metodos_pagamento, e.metodo_pagamento)}</select>
          </div>
          <div class="campo">
            <label>Estado do pagamento</label>
            <select id="estadoPag">${ui.opcoes(cat.estados_pagamento, e.estado_pagamento || 'Nao pago')}</select>
          </div>
          <div class="campo">
            <label>Data de pagamento</label>
            <input type="date" id="dataPag" value="${ui.esc((e.data_pagamento || '').slice(0, 10))}" />
          </div>
        </div>
        <div class="linha-form tres">
          <div class="campo">
            <label>Estado de entrega</label>
            <select id="estadoEnt">${ui.opcoes(cat.estados_entrega, e.estado_entrega || 'Por preparar')}</select>
          </div>
          <div class="campo">
            <label>Data de envio</label>
            <input type="date" id="dataEnvio" value="${ui.esc((e.data_envio || '').slice(0, 10))}" />
          </div>
          <div class="campo">
            <label>Numero de tracking</label>
            <input id="tracking" value="${ui.esc(e.tracking || '')}" />
          </div>
        </div>

        <div class="seccao-titulo">Origem e Etsy</div>
        <div class="linha-form tres">
          <div class="campo">
            <label>Canal de origem</label>
            <select id="canal"><option value="">Nao definido</option>${ui.opcoes(cat.canais, e.canal)}</select>
          </div>
          <div class="campo">
            <label>Numero de venda Etsy</label>
            <input id="etsyVenda" value="${ui.esc(e.etsy_venda || '')}" />
          </div>
          <div class="campo">
            <label>Taxas Etsy (euros)</label>
            <input type="number" step="0.01" id="etsyTaxas" value="${ui.esc(e.etsy_taxas || 0)}" />
          </div>
        </div>
        <div class="caixa-check" style="margin:0.5rem 0">
          <input type="checkbox" id="estampagem" ${e.estampagem_atribuida ? 'checked' : ''} />
          <label for="estampagem" style="margin:0">T-shirt estampada ja atribuida</label>
        </div>
        <div class="campo">
          <label>Notas</label>
          <textarea id="notas">${ui.esc(e.notas || '')}</textarea>
        </div>

        <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
          <button type="button" class="btn" id="cancelar">Cancelar</button>
          <button type="submit" class="btn primario">${e.id ? 'Guardar alteracoes' : 'Criar encomenda'}</button>
        </div>
      </form>
    `, '820px');

    const ctx = { cat, itens: JSON.parse(JSON.stringify(itens)) };
    this._desenharItens(corpo, ctx);

    const tipoSel = corpo.querySelector('#tipoPreco');
    const atualizarManual = () => {
      corpo.querySelector('#campoManual').style.display = tipoSel.value === 'personalizado' ? '' : 'none';
    };
    atualizarManual();

    const recalc = () => this._recalcular(corpo, ctx);
    corpo.querySelector('#addItem').onclick = () => {
      ctx.itens.push({ modelo: cat.modelos[0], tamanho: 'M', quantidade: 1 });
      this._desenharItens(corpo, ctx);
      recalc();
    };
    tipoSel.onchange = () => { atualizarManual(); recalc(); };
    corpo.querySelector('#precoManual').oninput = recalc;
    corpo.querySelector('#desconto').oninput = recalc;
    corpo.querySelector('#packTarot').onchange = recalc;

    // Ao escolher cliente, sugere tipo de preco e preenche nome
    corpo.querySelector('#clienteSel').onchange = async (ev) => {
      const id = ev.target.value;
      if (!id) return;
      const cli = clientes.find((c) => String(c.id) === String(id));
      if (cli) {
        corpo.querySelector('#clienteNome').value = cli.nome;
        if (cli.terreiro) tipoSel.value = 'terreiro';
        else if (cli.vip) tipoSel.value = 'vip';
        atualizarManual();
        recalc();
      }
    };

    corpo.querySelector('#cancelar').onclick = () => ui.fecharModal();
    corpo.querySelector('#formEnc').onsubmit = async (ev) => {
      ev.preventDefault();
      const dados = this._lerFormulario(corpo, ctx);
      try {
        if (e.id) {
          await App.api.put('/api/encomendas/' + e.id, dados);
          ui.toast('Encomenda atualizada', 'sucesso');
        } else {
          await App.api.post('/api/encomendas', dados);
          ui.toast('Encomenda criada', 'sucesso');
        }
        ui.fecharModal();
        if (this.elRaiz) this.carregarLista(this.elRaiz);
        else App.router.recarregar();
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };

    recalc();
  },

  _desenharItens(corpo, ctx) {
    const ui = App.ui;
    const cont = corpo.querySelector('#itens');
    cont.innerHTML = ctx.itens
      .map(
        (it, idx) => `
        <div class="item-linha" data-idx="${idx}">
          <select data-campo="modelo">${ui.opcoes(ctx.cat.modelos, it.modelo)}</select>
          <select data-campo="tamanho">${ui.opcoes(ctx.cat.tamanhos, it.tamanho)}</select>
          <input type="number" min="1" data-campo="quantidade" value="${ui.esc(it.quantidade)}" />
          <button type="button" class="btn perigo pequeno" data-remover="${idx}">&times;</button>
        </div>`
      )
      .join('');

    cont.querySelectorAll('.item-linha').forEach((linha) => {
      const idx = Number(linha.dataset.idx);
      linha.querySelectorAll('[data-campo]').forEach((campo) => {
        const aplicar = () => {
          const nome = campo.dataset.campo;
          ctx.itens[idx][nome] = nome === 'quantidade' ? Number(campo.value) || 0 : campo.value;
          this._recalcular(corpo, ctx);
        };
        campo.onchange = aplicar;
        campo.oninput = aplicar;
      });
      const btn = linha.querySelector('[data-remover]');
      btn.onclick = () => {
        ctx.itens.splice(idx, 1);
        if (!ctx.itens.length) ctx.itens.push({ modelo: ctx.cat.modelos[0], tamanho: 'M', quantidade: 1 });
        this._desenharItens(corpo, ctx);
        this._recalcular(corpo, ctx);
      };
    });
  },

  async _recalcular(corpo, ctx) {
    const dados = {
      itens: ctx.itens,
      is_pack_tarot: corpo.querySelector('#packTarot').checked,
      tipo_preco: corpo.querySelector('#tipoPreco').value,
      preco_unitario: corpo.querySelector('#precoManual').value,
      desconto: corpo.querySelector('#desconto').value,
    };
    try {
      const r = await App.api.post('/api/encomendas/calcular', dados);
      corpo.querySelector('#rUnid').textContent = r.unidades;
      corpo.querySelector('#rTotal').textContent = App.ui.euros(r.precoTotal);
      corpo.querySelector('#rCusto').textContent = App.ui.euros(r.custoTotal);
      corpo.querySelector('#rMargem').textContent = App.ui.euros(r.margem);
    } catch (err) {
      /* ignora erros de calculo transitorios */
    }
  },

  _lerFormulario(corpo, ctx) {
    const v = (id) => corpo.querySelector('#' + id).value;
    const clienteId = v('clienteSel');
    return {
      cliente_id: clienteId ? Number(clienteId) : null,
      cliente_nome: v('clienteNome') || 'Cliente sem nome',
      itens: ctx.itens.filter((i) => i.modelo && i.quantidade > 0),
      pedido_texto: v('pedidoTexto'),
      is_pack_tarot: corpo.querySelector('#packTarot').checked,
      tipo_preco: v('tipoPreco'),
      preco_unitario: v('precoManual'),
      desconto: v('desconto'),
      metodo_pagamento: v('metodo'),
      estado_pagamento: v('estadoPag'),
      data_pagamento: v('dataPag'),
      estado_entrega: v('estadoEnt'),
      data_envio: v('dataEnvio'),
      tracking: v('tracking'),
      canal: v('canal'),
      etsy_venda: v('etsyVenda'),
      etsy_taxas: v('etsyTaxas'),
      estampagem_atribuida: corpo.querySelector('#estampagem').checked,
      notas: v('notas'),
    };
  },

  // Importacao a partir do texto de um email
  abrirImportEmail() {
    const ui = App.ui;
    const corpo = ui.abrirModal('Importar encomenda de email', `
      <div class="campo">
        <label>Cole aqui o texto do email da encomenda</label>
        <textarea id="textoEmail" style="min-height:200px" placeholder="Cole o conteudo do email..."></textarea>
      </div>
      <div class="barra-acoes" style="justify-content:flex-end">
        <button class="btn" id="cancelarImp">Cancelar</button>
        <button class="btn primario" id="analisar">Analisar e preencher</button>
      </div>
    `, '640px');
    corpo.querySelector('#cancelarImp').onclick = () => ui.fecharModal();
    corpo.querySelector('#analisar').onclick = async () => {
      const texto = corpo.querySelector('#textoEmail').value;
      if (!texto.trim()) {
        ui.toast('Cole o texto do email primeiro', 'erro');
        return;
      }
      const r = await App.api.post('/api/email/analisar', { texto });
      ui.fecharModal();
      // Abre o formulario pre-preenchido com a sugestao para confirmacao
      this.abrirFormulario({
        cliente_nome: r.nome,
        pedido_texto: r.morada ? 'Morada: ' + r.morada : '',
        itens: r.itens && r.itens.length ? r.itens : null,
        notas: [r.contacto ? 'Contacto: ' + r.contacto : '', r.nif ? 'NIF: ' + r.nif : '', r.morada ? 'Morada: ' + r.morada : '']
          .filter(Boolean)
          .join('\n'),
      });
      ui.toast('Dados extraidos. Confirme e corrija antes de guardar.', 'sucesso');
    };
  },
};
