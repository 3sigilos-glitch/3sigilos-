/* Vista de gestao de clientes: lista, ficha com historico e formulario. */
window.App = window.App || {};
App.views = App.views || {};

App.views.clientes = {
  titulo: 'Clientes',
  icone: '☾',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Clientes</h1>
          <div class="subtitulo">Fichas de cliente e historico de compras</div>
        </div>
        <div class="barra-acoes">
          <button class="btn" id="expCsv">Exportar CSV</button>
          <button class="btn" id="expPdf">Exportar PDF</button>
          <button class="btn primario" id="novoCli">Novo cliente</button>
        </div>
      </div>
      <div class="cartao">
        <div class="filtros">
          <div class="campo" style="flex:1"><label>Pesquisar</label><input id="fPesq" placeholder="Nome, contacto ou NIF" /></div>
        </div>
        <div id="listaCli"><div class="carregar">A carregar...</div></div>
      </div>
    `;
    el.querySelector('#novoCli').onclick = () => this.abrirFormulario();
    el.querySelector('#expCsv').onclick = () => (window.location = '/api/clientes/exportar.csv');
    el.querySelector('#expPdf').onclick = () => (window.location = '/api/clientes/exportar.pdf');
    const pesq = el.querySelector('#fPesq');
    pesq.oninput = () => this.carregarLista(el);
    this.elRaiz = el;
    await this.carregarLista(el);
  },

  async carregarLista(el) {
    const ui = App.ui;
    const termo = el.querySelector('#fPesq').value;
    const lista = await App.api.get('/api/clientes' + (termo ? '?pesquisa=' + encodeURIComponent(termo) : ''));
    const cont = el.querySelector('#listaCli');
    if (!lista.length) {
      cont.innerHTML = '<div class="vazio">Sem clientes registados.</div>';
      return;
    }
    cont.innerHTML = `<div class="tabela-wrap"><table>
      <thead><tr><th>Nome</th><th>Contacto</th><th>NIF</th><th>Marcacoes</th></tr></thead>
      <tbody>${lista
        .map(
          (c) => `<tr style="cursor:pointer" data-id="${c.id}">
            <td>${ui.esc(c.nome)}</td>
            <td>${ui.esc(c.contacto || '')}</td>
            <td>${ui.esc(c.nif || '')}</td>
            <td>${c.vip ? '<span class="etiqueta dourada">VIP</span> ' : ''}${c.terreiro ? '<span class="etiqueta azul">Terreiro</span>' : ''}</td>
          </tr>`
        )
        .join('')}</tbody></table></div>`;
    cont.querySelectorAll('[data-id]').forEach((tr) => {
      tr.onclick = () => this.abrirFicha(Number(tr.dataset.id));
    });
  },

  async abrirFicha(id) {
    const ui = App.ui;
    const c = await App.api.get('/api/clientes/' + id);
    const historico = c.historico.length
      ? `<div class="tabela-wrap"><table>
          <thead><tr><th>ID</th><th>Data</th><th>Produtos</th><th>Total</th><th>Pagamento</th></tr></thead>
          <tbody>${c.historico
            .map(
              (e) => `<tr><td>${e.id}</td><td>${ui.data(e.criado_em)}</td>
                <td>${ui.esc((e.itens || []).map((i) => `${i.quantidade}x ${i.modelo} ${i.tamanho}`).join(', '))}</td>
                <td>${ui.euros(e.preco_total)}</td><td>${ui.etiquetaEstado(e.estado_pagamento)}</td></tr>`
            )
            .join('')}</tbody></table></div>`
      : '<div class="vazio">Sem compras registadas.</div>';

    const corpo = ui.abrirModal('Ficha de ' + c.nome, `
      <div class="grelha col-3" style="margin-bottom:1rem">
        <div class="indicador"><div class="rotulo">Total gasto</div><div class="valor dourado">${ui.euros(c.total_gasto)}</div></div>
        <div class="indicador"><div class="rotulo">Compras</div><div class="valor">${c.numero_compras}</div></div>
        <div class="indicador"><div class="rotulo">Marcacoes</div><div class="valor" style="font-size:1.1rem">${c.vip ? 'VIP ' : ''}${c.terreiro ? 'Terreiro' : ''}${!c.vip && !c.terreiro ? 'Normal' : ''}</div></div>
      </div>
      <ul class="lista-dados">
        <li><span style="color:var(--texto-suave)">Contacto</span><span>${ui.esc(c.contacto || '')}</span></li>
        <li><span style="color:var(--texto-suave)">Morada</span><span>${ui.esc(c.morada || '')}</span></li>
        <li><span style="color:var(--texto-suave)">NIF</span><span>${ui.esc(c.nif || '')}</span></li>
        <li><span style="color:var(--texto-suave)">Notas</span><span>${ui.esc(c.notas || '')}</span></li>
      </ul>
      <div class="seccao-titulo">Historico de compras</div>
      ${historico}
      <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
        <button class="btn perigo" id="eliminarCli">Eliminar</button>
        <button class="btn primario" id="editarCli">Editar</button>
      </div>
    `);
    corpo.querySelector('#editarCli').onclick = () => this.abrirFormulario(c);
    corpo.querySelector('#eliminarCli').onclick = async () => {
      if (await ui.confirmar('Eliminar o cliente ' + c.nome + '?')) {
        await App.api.del('/api/clientes/' + c.id);
        ui.fecharModal();
        ui.toast('Cliente eliminado', 'sucesso');
        if (this.elRaiz) this.carregarLista(this.elRaiz);
      }
    };
  },

  abrirFormulario(existente) {
    const ui = App.ui;
    const c = existente || {};
    const corpo = ui.abrirModal(c.id ? 'Editar cliente' : 'Novo cliente', `
      <form id="formCli">
        <div class="campo"><label>Nome</label><input id="nome" value="${ui.esc(c.nome || '')}" required /></div>
        <div class="linha-form">
          <div class="campo"><label>Contacto</label><input id="contacto" value="${ui.esc(c.contacto || '')}" /></div>
          <div class="campo"><label>NIF (opcional)</label><input id="nif" value="${ui.esc(c.nif || '')}" /></div>
        </div>
        <div class="campo"><label>Morada</label><textarea id="morada">${ui.esc(c.morada || '')}</textarea></div>
        <div class="linha-form">
          <div class="caixa-check"><input type="checkbox" id="vip" ${c.vip ? 'checked' : ''} /><label for="vip" style="margin:0">Cliente VIP (preco VIP automatico)</label></div>
          <div class="caixa-check"><input type="checkbox" id="terreiro" ${c.terreiro ? 'checked' : ''} /><label for="terreiro" style="margin:0">Cliente Terreiro (preco 6 euros automatico)</label></div>
        </div>
        <div class="campo"><label>Notas</label><textarea id="notas">${ui.esc(c.notas || '')}</textarea></div>
        <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
          <button type="button" class="btn" id="cancelar">Cancelar</button>
          <button type="submit" class="btn primario">${c.id ? 'Guardar' : 'Criar'}</button>
        </div>
      </form>
    `, '560px');
    corpo.querySelector('#cancelar').onclick = () => ui.fecharModal();
    corpo.querySelector('#formCli').onsubmit = async (ev) => {
      ev.preventDefault();
      const dados = {
        nome: corpo.querySelector('#nome').value,
        contacto: corpo.querySelector('#contacto').value,
        nif: corpo.querySelector('#nif').value,
        morada: corpo.querySelector('#morada').value,
        vip: corpo.querySelector('#vip').checked,
        terreiro: corpo.querySelector('#terreiro').checked,
        notas: corpo.querySelector('#notas').value,
      };
      try {
        if (c.id) await App.api.put('/api/clientes/' + c.id, dados);
        else await App.api.post('/api/clientes', dados);
        ui.fecharModal();
        ui.toast('Cliente guardado', 'sucesso');
        if (this.elRaiz) this.carregarLista(this.elRaiz);
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };
  },
};
