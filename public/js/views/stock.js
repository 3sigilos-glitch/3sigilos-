/* Vista de gestao de stocks: t-shirts em branco e t-shirts estampadas. */
window.App = window.App || {};
App.views = App.views || {};

App.views.stock = {
  titulo: 'Stocks',
  icone: '❖',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = '<div class="carregar">A carregar stocks...</div>';
    const dados = await App.api.get('/api/stock');

    const linhaBranco = (s) => `
      <tr class="${s.quantidade < s.minimo ? 'baixo' : ''}">
        <td><strong>${ui.esc(s.tamanho)}</strong></td>
        <td><input type="number" min="0" value="${s.quantidade}" data-q-branco="${s.id}" style="max-width:90px" /></td>
        <td><input type="number" min="0" value="${s.minimo}" data-m-branco="${s.id}" style="max-width:90px" /></td>
        <td>${s.quantidade < s.minimo ? '<span class="etiqueta vermelho">Abaixo do minimo</span>' : '<span class="etiqueta verde">Ok</span>'}</td>
      </tr>`;

    const linhaEst = (s) => `
      <tr>
        <td>${ui.esc(s.modelo)}</td>
        <td><strong>${ui.esc(s.tamanho)}</strong></td>
        <td><input type="number" min="0" value="${s.quantidade}" data-q-est="${s.id}" style="max-width:90px" /></td>
        <td><input type="number" min="0" value="${s.minimo}" data-m-est="${s.id}" style="max-width:90px" /></td>
        <td>${s.quantidade < s.minimo ? '<span class="etiqueta vermelho">Abaixo do minimo</span>' : '<span class="etiqueta verde">Ok</span>'}</td>
      </tr>`;

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Stocks</h1>
          <div class="subtitulo">T-shirts em branco e t-shirts estampadas</div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>T-shirts em branco (fornecedor THC Ankara)</h3>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Tamanho</th><th>Quantidade</th><th>Minimo</th><th>Estado</th></tr></thead>
          <tbody>${dados.branco.map(linhaBranco).join('')}</tbody>
        </table></div>
        <div class="barra-acoes" style="margin-top:0.8rem"><button class="btn primario" id="guardarBranco">Guardar stock em branco</button></div>
      </div>

      <div class="cartao">
        <h3>T-shirts estampadas</h3>
        <div class="filtros">
          <div class="campo"><label>Filtrar modelo</label><select id="fModeloStock"><option value="">Todos</option>${ui.opcoes([...new Set(dados.estampado.map((s) => s.modelo))])}</select></div>
        </div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Modelo</th><th>Tamanho</th><th>Quantidade</th><th>Minimo</th><th>Estado</th></tr></thead>
          <tbody id="corpoEst">${dados.estampado.map(linhaEst).join('')}</tbody>
        </table></div>
        <div class="barra-acoes" style="margin-top:0.8rem"><button class="btn primario" id="guardarEst">Guardar stock estampado</button></div>
      </div>
    `;

    el.querySelector('#fModeloStock').onchange = (ev) => {
      const filtro = ev.target.value;
      const filtrados = filtro ? dados.estampado.filter((s) => s.modelo === filtro) : dados.estampado;
      el.querySelector('#corpoEst').innerHTML = filtrados.map(linhaEst).join('');
    };

    el.querySelector('#guardarBranco').onclick = async () => {
      const pedidos = dados.branco.map((s) => {
        const q = el.querySelector(`[data-q-branco="${s.id}"]`);
        const m = el.querySelector(`[data-m-branco="${s.id}"]`);
        if (!q) return null;
        return App.api.put('/api/stock/branco/' + s.id, { quantidade: Number(q.value), minimo: Number(m.value) });
      }).filter(Boolean);
      await Promise.all(pedidos);
      ui.toast('Stock em branco guardado', 'sucesso');
      this.render(el);
    };

    el.querySelector('#guardarEst').onclick = async () => {
      const pedidos = [];
      el.querySelectorAll('[data-q-est]').forEach((q) => {
        const id = q.dataset.qEst;
        const m = el.querySelector(`[data-m-est="${id}"]`);
        pedidos.push(App.api.put('/api/stock/estampado/' + id, { quantidade: Number(q.value), minimo: Number(m.value) }));
      });
      await Promise.all(pedidos);
      ui.toast('Stock estampado guardado', 'sucesso');
      this.render(el);
    };
  },
};
