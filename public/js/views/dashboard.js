/* Vista do painel principal com indicadores, alertas e encomendas recentes. */
window.App = window.App || {};
App.views = App.views || {};

App.views.dashboard = {
  titulo: 'Painel',
  icone: '✧',
  async render(el) {
    el.innerHTML = '<div class="carregar">A carregar painel...</div>';
    const d = await App.api.get('/api/dashboard');
    const ui = App.ui;

    const indicadores = [
      { rotulo: 'Encomendas pendentes', valor: d.encomendas_pendentes, ic: '✉' },
      { rotulo: 'Total a receber', valor: ui.euros(d.total_a_receber), ic: '€', dourado: true },
      { rotulo: 'Nao pagas', valor: d.encomendas_nao_pagas, ic: '⚠' },
      { rotulo: 'Por enviar', valor: d.encomendas_por_enviar, ic: '⚲' },
      { rotulo: 'Stock critico', valor: d.stock_critico, ic: '❖' },
      { rotulo: 'Alertas ativos', valor: d.numero_alertas, ic: '✷' },
    ];

    const cartoesInd = indicadores
      .map(
        (i) => `
        <div class="indicador">
          <div class="ic-grande">${i.ic}</div>
          <div class="rotulo">${ui.esc(i.rotulo)}</div>
          <div class="valor ${i.dourado ? 'dourado' : ''}">${ui.esc(i.valor)}</div>
        </div>`
      )
      .join('');

    const progresso = Math.min(100, d.progresso_meta || 0);
    const metaHtml = `
      <div class="cartao">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <h3 style="margin:0">Meta mensal</h3>
          <span style="color:var(--dourado-claro);font-weight:600">${ui.euros(d.vendas_mes)} / ${ui.euros(d.meta_mensal)}</span>
        </div>
        <div class="progresso"><div class="preenchido" style="width:${progresso}%"></div></div>
        <div style="color:var(--texto-suave);font-size:0.82rem;margin-top:0.4rem">${progresso}% da meta atingida este mes</div>
      </div>`;

    const alertasHtml = d.alertas_ativos.length
      ? d.alertas_ativos
          .map(
            (a) => `
        <div class="alerta ${ui.esc(a.gravidade)}">
          <div>
            <div class="titulo">${ui.esc(a.titulo)}</div>
            <div class="descricao">${ui.esc(a.descricao)}</div>
          </div>
          <button class="btn pequeno" data-resolver="${ui.esc(a.chave)}">Resolver</button>
        </div>`
          )
          .join('')
      : '<div class="vazio">Sem alertas ativos. Tudo em ordem.</div>';

    const recentesHtml = d.encomendas_recentes.length
      ? `<div class="tabela-wrap"><table>
          <thead><tr><th>ID</th><th>Cliente</th><th>Produtos</th><th>Total</th><th>Pagamento</th><th>Entrega</th></tr></thead>
          <tbody>${d.encomendas_recentes
            .map(
              (e) => `<tr style="cursor:pointer" data-enc="${e.id}">
                <td>${e.id}</td>
                <td>${ui.esc(e.cliente_nome)}</td>
                <td>${ui.esc(descricaoItens(e.itens, e.pedido_texto))}</td>
                <td>${ui.euros(e.preco_total)}</td>
                <td>${ui.etiquetaEstado(e.estado_pagamento)}</td>
                <td>${ui.etiquetaEstado(e.estado_entrega)}</td>
              </tr>`
            )
            .join('')}</tbody></table></div>`
      : '<div class="vazio">Ainda nao existem encomendas registadas.</div>';

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Painel principal</h1>
          <div class="subtitulo">Resumo da atividade da 3 Sigilos</div>
        </div>
        <button class="btn primario" id="novaEncDash">Nova encomenda</button>
      </div>
      <div class="grelha col-3" style="margin-bottom:1rem">${cartoesInd}</div>
      ${metaHtml}
      <div class="seccao-titulo">Alertas ativos</div>
      ${alertasHtml}
      <div class="seccao-titulo">Encomendas recentes</div>
      ${recentesHtml}
    `;

    el.querySelectorAll('[data-resolver]').forEach((b) => {
      b.onclick = async () => {
        await App.api.post('/api/alertas/resolver', { chave: b.dataset.resolver });
        ui.toast('Alerta marcado como resolvido', 'sucesso');
        this.render(el);
      };
    });

    el.querySelectorAll('[data-enc]').forEach((tr) => {
      tr.onclick = () => App.views.encomendas.abrirFicha(Number(tr.dataset.enc));
    });

    const btnNova = el.querySelector('#novaEncDash');
    if (btnNova) btnNova.onclick = () => App.views.encomendas.abrirFormulario();
  },
};

function descricaoItens(itens, alternativa) {
  if (Array.isArray(itens) && itens.length) {
    return itens.map((i) => `${i.quantidade}x ${i.modelo} ${i.tamanho}`).join(', ');
  }
  return alternativa || '';
}
