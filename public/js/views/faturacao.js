/* Vista de faturacao: resumo pronto para o Portal das Financas. */
window.App = window.App || {};
App.views = App.views || {};

App.views.faturacao = {
  titulo: 'Faturacao',
  icone: '€',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Faturacao</h1>
          <div class="subtitulo">Resumo de encomendas pagas para emitir fatura</div>
        </div>
      </div>
      <div class="cartao">
        <div class="filtros">
          <div class="campo"><label>Mes</label><input type="month" id="fMes" value="${ui.mesAtual()}" /></div>
          <div class="campo"><label>Regiao</label><select id="fRegiao"><option value="">Todas</option><option>Portugal</option><option>Europa</option></select></div>
          <button class="btn" id="expCsv">Exportar CSV</button>
          <button class="btn" id="expPdf">Exportar PDF</button>
        </div>
        <div id="totaisFat" class="grelha col-3" style="margin-bottom:1rem"></div>
        <div id="tabelaFat"></div>
      </div>
    `;
    const carregar = () => this.carregar(el);
    el.querySelector('#fMes').onchange = carregar;
    el.querySelector('#fRegiao').onchange = carregar;
    el.querySelector('#expCsv').onclick = () => (window.location = '/api/faturacao/exportar.csv?' + this.query(el));
    el.querySelector('#expPdf').onclick = () => (window.location = '/api/faturacao/exportar.pdf?' + this.query(el));
    await carregar();
  },

  query(el) {
    const p = new URLSearchParams();
    if (el.querySelector('#fMes').value) p.set('mes', el.querySelector('#fMes').value);
    if (el.querySelector('#fRegiao').value) p.set('regiao', el.querySelector('#fRegiao').value);
    return p.toString();
  },

  async carregar(el) {
    const ui = App.ui;
    const dados = await App.api.get('/api/faturacao?' + this.query(el));
    const t = dados.totais;
    el.querySelector('#totaisFat').innerHTML = `
      <div class="indicador"><div class="rotulo">Portugal</div><div class="valor">${ui.euros(t.portugal.total)}</div><div style="color:var(--texto-suave);font-size:0.78rem">${t.portugal.numero} encomendas, IVA ${ui.euros(t.portugal.iva)}</div></div>
      <div class="indicador"><div class="rotulo">Europa</div><div class="valor">${ui.euros(t.europa.total)}</div><div style="color:var(--texto-suave);font-size:0.78rem">${t.europa.numero} encomendas, IVA ${ui.euros(t.europa.iva)}</div></div>
      <div class="indicador"><div class="rotulo">Total</div><div class="valor dourado">${ui.euros(t.total)}</div><div style="color:var(--texto-suave);font-size:0.78rem">IVA a ${dados.iva_taxa}%</div></div>
    `;
    const cont = el.querySelector('#tabelaFat');
    if (!dados.linhas.length) {
      cont.innerHTML = '<div class="vazio">Sem encomendas pagas para o periodo escolhido.</div>';
      return;
    }
    cont.innerHTML = `<div class="tabela-wrap"><table>
      <thead><tr><th>Enc</th><th>Data</th><th>Nome</th><th>NIF</th><th>Descricao</th><th>Qtd</th><th>Unitario</th><th>Base</th><th>IVA</th><th>Total</th><th>Regiao</th></tr></thead>
      <tbody>${dados.linhas
        .map(
          (l) => `<tr>
            <td>${l.encomenda_id}</td>
            <td>${ui.data(l.data)}</td>
            <td>${ui.esc(l.nome)}</td>
            <td>${ui.esc(l.nif)}</td>
            <td>${ui.esc(l.descricao)}</td>
            <td>${l.quantidade}</td>
            <td>${ui.euros(l.valor_unitario)}</td>
            <td>${ui.euros(l.base_tributavel)}</td>
            <td>${ui.euros(l.valor_iva)}</td>
            <td>${ui.euros(l.valor_total)}</td>
            <td>${ui.esc(l.regiao)}</td>
          </tr>`
        )
        .join('')}</tbody></table></div>`;
  },
};
