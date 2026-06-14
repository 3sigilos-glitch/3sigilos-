/* Vista de calendario mensal com encomendas, envios e producao. */
window.App = window.App || {};
App.views = App.views || {};

App.views.calendario = {
  titulo: 'Calendario',
  icone: '🗓',

  async render(el) {
    this.ref = this.ref || new Date();
    await this.desenhar(el);
  },

  async desenhar(el) {
    const ui = App.ui;
    const ano = this.ref.getFullYear();
    const mes = this.ref.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const de = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
    const ate = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimo.getDate()).padStart(2, '0')}`;
    const eventos = await App.api.get('/api/calendario?de=' + de + '&ate=' + ate);

    const porDia = {};
    eventos.forEach((ev) => {
      (porDia[ev.data] = porDia[ev.data] || []).push(ev);
    });

    const nomesMes = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

    // Calcula o deslocamento do primeiro dia (segunda = 0)
    let inicioSemana = primeiro.getDay() - 1;
    if (inicioSemana < 0) inicioSemana = 6;

    const celulas = [];
    for (let i = 0; i < inicioSemana; i++) {
      celulas.push('<div class="cal-dia fora"></div>');
    }
    const hojeStr = ui.hoje();
    for (let dia = 1; dia <= ultimo.getDate(); dia++) {
      const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const evs = porDia[dataStr] || [];
      const eventosHtml = evs
        .map((ev) => `<span class="cal-evento ${ui.esc(ev.tipo)}" title="${ui.esc(ev.titulo + ' ' + (ev.descricao || ''))}">${ui.esc(ev.titulo)}</span>`)
        .join('');
      celulas.push(`<div class="cal-dia ${dataStr === hojeStr ? 'hoje' : ''}"><div class="numero">${dia}</div>${eventosHtml}</div>`);
    }

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Calendario</h1>
          <div class="subtitulo">Encomendas pendentes, envios previstos e producao</div>
        </div>
        <div class="barra-acoes">
          <button class="btn" id="mesAnt">Anterior</button>
          <span style="font-weight:600;color:var(--dourado-claro);min-width:160px;text-align:center">${nomesMes[mes]} ${ano}</span>
          <button class="btn" id="mesSeg">Seguinte</button>
        </div>
      </div>
      <div class="cartao">
        <div class="calendario">
          ${diasSemana.map((d) => `<div class="cal-cabecalho">${d}</div>`).join('')}
          ${celulas.join('')}
        </div>
        <div style="display:flex;gap:1rem;margin-top:1rem;flex-wrap:wrap;font-size:0.8rem;color:var(--texto-suave)">
          <span><span class="cal-evento envio" style="display:inline">Envio</span></span>
          <span><span class="cal-evento pendente" style="display:inline">Pendente</span></span>
          <span><span class="cal-evento producao" style="display:inline">Producao</span></span>
        </div>
      </div>
    `;
    el.querySelector('#mesAnt').onclick = () => { this.ref = new Date(ano, mes - 1, 1); this.desenhar(el); };
    el.querySelector('#mesSeg').onclick = () => { this.ref = new Date(ano, mes + 1, 1); this.desenhar(el); };
  },
};
