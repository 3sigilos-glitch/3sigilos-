/* Vista de gestao de producao: pedidos ao fornecedor e lista de trabalho diaria. */
window.App = window.App || {};
App.views = App.views || {};

App.views.producao = {
  titulo: 'Producao',
  icone: '⚒',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = '<div class="carregar">A carregar producao...</div>';
    const [pedidos, trabalho] = await Promise.all([
      App.api.get('/api/producao'),
      App.api.get('/api/producao/lista-trabalho'),
    ]);

    const linhaTrabalho = (e) =>
      `<li><span>${ui.esc(e.cliente_nome)}: ${ui.esc((e.itens || []).map((i) => `${i.quantidade}x ${i.modelo} ${i.tamanho}`).join(', ') || e.pedido_texto || '')}</span><span class="etiqueta neutra">Enc ${e.id}</span></li>`;

    const pedidosHtml = pedidos.length
      ? `<div class="tabela-wrap"><table>
          <thead><tr><th>Tipo</th><th>Fornecedor</th><th>Itens</th><th>Pedido</th><th>Previsto</th><th>Estado</th><th></th></tr></thead>
          <tbody>${pedidos
            .map(
              (p) => `<tr>
                <td>${p.tipo === 'tshirts_branco' ? 'T-shirts em branco' : 'Estampagem DTF'}</td>
                <td>${ui.esc(p.fornecedor || '')}</td>
                <td>${ui.esc((p.itens || []).map((i) => `${i.quantidade}x ${i.modelo ? i.modelo + ' ' : ''}${i.tamanho}`).join(', '))}</td>
                <td>${ui.data(p.data_pedido)}</td>
                <td>${ui.data(p.data_prevista)}</td>
                <td>${ui.etiquetaEstado(p.estado)}</td>
                <td><div class="barra-acoes">
                  ${p.estado !== 'Recebido' ? `<button class="btn pequeno" data-receber="${p.id}">Marcar recebido</button>` : ''}
                  <button class="btn pequeno perigo" data-eliminar="${p.id}">Eliminar</button>
                </div></td>
              </tr>`
            )
            .join('')}</tbody></table></div>`
      : '<div class="vazio">Sem pedidos de producao registados.</div>';

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Producao</h1>
          <div class="subtitulo">Pedidos ao fornecedor e trabalho diario</div>
        </div>
        <button class="btn primario" id="novoPedido">Novo pedido</button>
      </div>

      <div class="grelha col-2" style="margin-bottom:1.2rem">
        <div class="cartao">
          <h3>Por estampar</h3>
          <ul class="lista-dados">${trabalho.por_estampar.length ? trabalho.por_estampar.map(linhaTrabalho).join('') : '<li>Nada por estampar.</li>'}</ul>
        </div>
        <div class="cartao">
          <h3>Por embalar</h3>
          <ul class="lista-dados">${trabalho.por_embalar.length ? trabalho.por_embalar.map(linhaTrabalho).join('') : '<li>Nada por embalar.</li>'}</ul>
        </div>
      </div>

      <div class="cartao">
        <h3>Pedidos de producao</h3>
        ${pedidosHtml}
      </div>
    `;

    el.querySelector('#novoPedido').onclick = () => this.abrirFormulario();
    el.querySelectorAll('[data-receber]').forEach((b) => {
      b.onclick = async () => {
        await App.api.put('/api/producao/' + b.dataset.receber, { estado: 'Recebido' });
        ui.toast('Pedido recebido. Stock reposto.', 'sucesso');
        this.render(el);
      };
    });
    el.querySelectorAll('[data-eliminar]').forEach((b) => {
      b.onclick = async () => {
        if (await ui.confirmar('Eliminar este pedido de producao?')) {
          await App.api.del('/api/producao/' + b.dataset.eliminar);
          ui.toast('Pedido eliminado', 'sucesso');
          this.render(el);
        }
      };
    });
  },

  async abrirFormulario() {
    const ui = App.ui;
    const cat = await App.estado.catalogo();
    const corpo = ui.abrirModal('Novo pedido de producao', `
      <form id="formProd">
        <div class="linha-form">
          <div class="campo">
            <label>Tipo de pedido</label>
            <select id="tipo">
              <option value="dtf_estampagem">Estampagem DTF</option>
              <option value="tshirts_branco">T-shirts em branco</option>
            </select>
          </div>
          <div class="campo"><label>Fornecedor</label><input id="fornecedor" placeholder="THC Ankara" /></div>
        </div>
        <div class="linha-form">
          <div class="campo"><label>Data do pedido</label><input type="date" id="dataPedido" value="${ui.hoje()}" /></div>
          <div class="campo"><label>Data prevista de entrega</label><input type="date" id="dataPrevista" /></div>
        </div>
        <div class="seccao-titulo">Itens</div>
        <div id="itensProd"></div>
        <button type="button" class="btn pequeno" id="addItemProd">Adicionar linha</button>
        <div class="campo" style="margin-top:0.7rem"><label>Notas</label><textarea id="notas"></textarea></div>
        <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
          <button type="button" class="btn" id="cancelar">Cancelar</button>
          <button type="submit" class="btn primario">Criar pedido</button>
        </div>
      </form>
    `, '700px');

    const ctx = { itens: [{ modelo: cat.modelos[0], tamanho: 'M', quantidade: 10 }], cat };
    const tipoSel = corpo.querySelector('#tipo');

    const desenhar = () => {
      const branco = tipoSel.value === 'tshirts_branco';
      corpo.querySelector('#itensProd').innerHTML = ctx.itens
        .map(
          (it, idx) => `<div class="item-linha" data-idx="${idx}">
            ${branco ? '' : `<select data-campo="modelo">${ui.opcoes(cat.modelos, it.modelo)}</select>`}
            <select data-campo="tamanho">${ui.opcoes(cat.tamanhos, it.tamanho)}</select>
            <input type="number" min="1" data-campo="quantidade" value="${ui.esc(it.quantidade)}" />
            <button type="button" class="btn perigo pequeno" data-remover="${idx}">&times;</button>
          </div>`
        )
        .join('');
      corpo.querySelectorAll('#itensProd .item-linha').forEach((linha) => {
        const idx = Number(linha.dataset.idx);
        linha.querySelectorAll('[data-campo]').forEach((campo) => {
          campo.onchange = () => {
            const nome = campo.dataset.campo;
            ctx.itens[idx][nome] = nome === 'quantidade' ? Number(campo.value) || 0 : campo.value;
          };
        });
        linha.querySelector('[data-remover]').onclick = () => {
          ctx.itens.splice(idx, 1);
          if (!ctx.itens.length) ctx.itens.push({ modelo: cat.modelos[0], tamanho: 'M', quantidade: 1 });
          desenhar();
        };
      });
    };
    desenhar();

    tipoSel.onchange = () => {
      corpo.querySelector('#fornecedor').value = tipoSel.value === 'tshirts_branco' ? 'THC Ankara' : '';
      desenhar();
    };
    corpo.querySelector('#addItemProd').onclick = () => {
      ctx.itens.push({ modelo: cat.modelos[0], tamanho: 'M', quantidade: 10 });
      desenhar();
    };
    corpo.querySelector('#cancelar').onclick = () => ui.fecharModal();
    corpo.querySelector('#formProd').onsubmit = async (ev) => {
      ev.preventDefault();
      const dados = {
        tipo: tipoSel.value,
        fornecedor: corpo.querySelector('#fornecedor').value,
        data_pedido: corpo.querySelector('#dataPedido').value,
        data_prevista: corpo.querySelector('#dataPrevista').value,
        itens: ctx.itens,
        notas: corpo.querySelector('#notas').value,
      };
      try {
        await App.api.post('/api/producao', dados);
        ui.fecharModal();
        ui.toast('Pedido de producao criado', 'sucesso');
        App.router.recarregar();
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };
  },
};
