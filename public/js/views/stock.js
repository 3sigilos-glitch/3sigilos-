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
      <tr>
        <td><strong>${ui.esc(s.cor)}</strong></td>
        <td>${ui.esc(s.tamanho)}</td>
        <td><input type="number" min="0" value="${s.quantidade}" data-q-branco="${s.id}" style="max-width:90px" /></td>
        <td><input type="number" min="0" value="${s.minimo}" data-m-branco="${s.id}" style="max-width:90px" /></td>
        <td>${s.quantidade < s.minimo ? '<span class="etiqueta vermelho">Abaixo do minimo</span>' : '<span class="etiqueta verde">Ok</span>'}</td>
      </tr>`;

    const linhaEst = (s) => `
      <tr>
        <td>${ui.esc(s.modelo)}</td>
        <td>${ui.esc(s.cor)}</td>
        <td><strong>${ui.esc(s.tamanho)}</strong></td>
        <td><input type="number" min="0" value="${s.quantidade}" data-q-est="${s.id}" style="max-width:90px" /></td>
        <td><input type="number" min="0" value="${s.minimo}" data-m-est="${s.id}" style="max-width:90px" /></td>
        <td>${s.quantidade < s.minimo ? '<span class="etiqueta vermelho">Abaixo do minimo</span>' : '<span class="etiqueta verde">Ok</span>'}</td>
      </tr>`;

    const coresBranco = [...new Set(dados.branco.map((s) => s.cor))];
    const modelosEst = [...new Set(dados.estampado.map((s) => s.modelo))];
    const coresEst = [...new Set(dados.estampado.map((s) => s.cor))];

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Stocks</h1>
          <div class="subtitulo">T-shirts em branco e t-shirts estampadas</div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>T-shirts em branco (fornecedor THC Ankara)</h3>
        <div class="filtros">
          <div class="campo"><label>Filtrar cor</label><select id="fCorBranco"><option value="">Todas</option>${ui.opcoes(coresBranco)}</select></div>
        </div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Cor</th><th>Tamanho</th><th>Quantidade</th><th>Minimo</th><th>Estado</th></tr></thead>
          <tbody id="corpoBranco">${dados.branco.map(linhaBranco).join('')}</tbody>
        </table></div>
        <div class="barra-acoes" style="margin-top:0.8rem"><button class="btn primario" id="guardarBranco">Guardar stock em branco</button></div>
      </div>

      <div class="cartao">
        <h3>T-shirts estampadas</h3>
        <div class="filtros">
          <div class="campo"><label>Filtrar modelo</label><select id="fModeloStock"><option value="">Todos</option>${ui.opcoes(modelosEst)}</select></div>
          <div class="campo"><label>Filtrar cor</label><select id="fCorStock"><option value="">Todas</option>${ui.opcoes(coresEst)}</select></div>
        </div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Modelo</th><th>Cor</th><th>Tamanho</th><th>Quantidade</th><th>Minimo</th><th>Estado</th></tr></thead>
          <tbody id="corpoEst">${dados.estampado.map(linhaEst).join('')}</tbody>
        </table></div>
        <div class="barra-acoes" style="margin-top:0.8rem"><button class="btn primario" id="guardarEst">Guardar stock estampado</button></div>
      </div>
    `;

    const filtrarBranco = () => {
      const cor = el.querySelector('#fCorBranco').value;
      const f = cor ? dados.branco.filter((s) => s.cor === cor) : dados.branco;
      el.querySelector('#corpoBranco').innerHTML = f.map(linhaBranco).join('');
    };
    el.querySelector('#fCorBranco').onchange = filtrarBranco;

    const filtrarEst = () => {
      const modelo = el.querySelector('#fModeloStock').value;
      const cor = el.querySelector('#fCorStock').value;
      let f = dados.estampado;
      if (modelo) f = f.filter((s) => s.modelo === modelo);
      if (cor) f = f.filter((s) => s.cor === cor);
      el.querySelector('#corpoEst').innerHTML = f.map(linhaEst).join('');
    };
    el.querySelector('#fModeloStock').onchange = filtrarEst;
    el.querySelector('#fCorStock').onchange = filtrarEst;

    el.querySelector('#guardarBranco').onclick = async () => {
      const pedidos = [];
      el.querySelectorAll('[data-q-branco]').forEach((q) => {
        const id = q.dataset.qBranco;
        const m = el.querySelector(`[data-m-branco="${id}"]`);
        pedidos.push(App.api.put('/api/stock/branco/' + id, { quantidade: Number(q.value), minimo: Number(m.value) }));
      });
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
