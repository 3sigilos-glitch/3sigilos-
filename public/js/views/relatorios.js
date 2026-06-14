/* Vista de relatorios e financeiro: resumo mensal e metricas chave. */
window.App = window.App || {};
App.views = App.views || {};

App.views.relatorios = {
  titulo: 'Relatorios',
  icone: '📊',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Relatorios e financeiro</h1>
          <div class="subtitulo">Resumo mensal de vendas e desempenho</div>
        </div>
        <div class="campo" style="margin:0"><label>Mes</label><input type="month" id="fMes" value="${ui.mesAtual()}" /></div>
      </div>
      <div id="conteudoRel"><div class="carregar">A carregar...</div></div>
    `;
    el.querySelector('#fMes').onchange = () => this.carregar(el);
    await this.carregar(el);
  },

  async carregar(el) {
    const ui = App.ui;
    const mes = el.querySelector('#fMes').value;
    const r = await App.api.get('/api/relatorios/mensal?mes=' + mes);
    const progresso = Math.min(100, r.progresso_meta || 0);

    const distrib = (titulo, lista, sufixo) => {
      if (!lista.length) return `<div class="cartao"><h3>${titulo}</h3><div class="vazio">Sem dados.</div></div>`;
      const max = Math.max(...lista.map((i) => i.valor));
      return `<div class="cartao"><h3>${titulo}</h3><ul class="lista-dados">${lista
        .map(
          (i) => `<li><span>${ui.esc(i.chave)}</span><span style="display:flex;align-items:center;gap:0.5rem">
            <span class="barra-mini" style="width:${max ? Math.max(8, (i.valor / max) * 100) : 0}px"></span>
            <strong>${sufixo === 'euros' ? ui.euros(i.valor) : i.valor}</strong></span></li>`
        )
        .join('')}</ul></div>`;
    };

    el.querySelector('#conteudoRel').innerHTML = `
      <div class="grelha col-4" style="margin-bottom:1rem">
        <div class="indicador"><div class="rotulo">Encomendas</div><div class="valor">${r.numero_encomendas}</div></div>
        <div class="indicador"><div class="rotulo">Total vendas</div><div class="valor dourado">${ui.euros(r.total_vendas)}</div></div>
        <div class="indicador"><div class="rotulo">Total pago</div><div class="valor">${ui.euros(r.total_pago)}</div></div>
        <div class="indicador"><div class="rotulo">Margem total</div><div class="valor">${ui.euros(r.total_margem)}</div></div>
      </div>

      <div class="cartao" style="margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <h3 style="margin:0">Meta mensal</h3>
          <span style="color:var(--dourado-claro);font-weight:600">${ui.euros(r.total_vendas)} / ${ui.euros(r.meta_mensal)}</span>
        </div>
        <div class="progresso"><div class="preenchido" style="width:${progresso}%"></div></div>
        <div style="color:var(--texto-suave);font-size:0.82rem;margin-top:0.4rem">${progresso}% da meta atingida</div>
      </div>

      <div class="grelha col-3" style="margin-bottom:1rem">
        <div class="indicador"><div class="rotulo">Modelo mais vendido</div><div class="valor" style="font-size:1.2rem">${r.modelo_mais_vendido ? ui.esc(r.modelo_mais_vendido.chave) : 'Sem dados'}</div></div>
        <div class="indicador"><div class="rotulo">Tamanho mais pedido</div><div class="valor" style="font-size:1.2rem">${r.tamanho_mais_pedido ? ui.esc(r.tamanho_mais_pedido.chave) : 'Sem dados'}</div></div>
        <div class="indicador"><div class="rotulo">Canal com mais vendas</div><div class="valor" style="font-size:1.2rem">${r.canal_com_mais_vendas ? ui.esc(r.canal_com_mais_vendas.chave) : 'Sem dados'}</div></div>
      </div>

      <div class="indicador" style="margin-bottom:1rem"><div class="rotulo">Tempo medio entre encomenda e entrega</div><div class="valor">${r.tempo_medio_entrega !== null ? r.tempo_medio_entrega + ' dias' : 'Sem dados'}</div></div>

      <div class="grelha col-3">
        ${distrib('Vendas por canal', r.por_canal, 'euros')}
        ${distrib('Unidades por modelo', r.por_modelo, '')}
        ${distrib('Unidades por tamanho', r.por_tamanho, '')}
      </div>
    `;
  },
};
