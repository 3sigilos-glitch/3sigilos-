/* Vista de definicoes: prazos, precos, meta, backup e integracao com o Notion. */
window.App = window.App || {};
App.views = App.views || {};

App.views.definicoes = {
  titulo: 'Definicoes',
  icone: '⚙',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = '<div class="carregar">A carregar definicoes...</div>';
    const [def, backups, notion] = await Promise.all([
      App.api.get('/api/definicoes'),
      App.api.get('/api/backup'),
      App.api.get('/api/notion'),
    ]);

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Definicoes</h1>
          <div class="subtitulo">Configuracoes, copias de seguranca e integracoes</div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>Precos e custos</h3>
        <div class="linha-form tres">
          <div class="campo"><label>Custo de producao por t-shirt (euros)</label><input type="number" step="0.01" id="custo_producao" value="${def.custo_producao}" /></div>
          <div class="campo"><label>Preco VIP (euros)</label><input type="number" step="0.01" id="preco_vip" value="${def.preco_vip}" /></div>
          <div class="campo"><label>Preco Pack Tarot (euros)</label><input type="number" step="0.01" id="preco_pack_tarot" value="${def.preco_pack_tarot}" /></div>
        </div>
        <div class="linha-form">
          <div class="campo"><label>Taxa de IVA (%)</label><input type="number" step="0.1" id="iva_taxa" value="${def.iva_taxa}" /></div>
          <div class="campo"><label>Meta mensal de vendas (euros)</label><input type="number" step="1" id="meta_mensal" value="${def.meta_mensal}" /></div>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>Prazos de alertas (dias)</h3>
        <div class="linha-form tres">
          <div class="campo"><label>Atraso na estampagem</label><input type="number" id="dias_atraso_estampagem" value="${def.dias_atraso_estampagem}" /></div>
          <div class="campo"><label>Encomenda nao paga</label><input type="number" id="dias_nao_pago" value="${def.dias_nao_pago}" /></div>
          <div class="campo"><label>Envio sem entrega</label><input type="number" id="dias_sem_entrega" value="${def.dias_sem_entrega}" /></div>
        </div>
        <div class="barra-acoes" style="margin-top:0.5rem"><button class="btn primario" id="guardarDef">Guardar definicoes</button></div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>Copias de seguranca</h3>
        <p style="color:var(--texto-suave);font-size:0.85rem">Cria copias completas da base de dados e exporta todos os dados.</p>
        <div class="barra-acoes" style="margin-bottom:1rem">
          <button class="btn primario" id="criarBackup">Criar copia de seguranca</button>
          <button class="btn" id="exportarJson">Exportar dados (JSON)</button>
          <label class="btn" style="cursor:pointer">Importar dados (JSON)<input type="file" id="importarJson" accept="application/json" style="display:none" /></label>
        </div>
        <div id="listaBackups">${this.listaBackups(backups)}</div>
      </div>

      <div class="cartao">
        <h3>Integracao com o Notion</h3>
        <p style="color:var(--texto-suave);font-size:0.85rem">${ui.esc(notion.nota)}</p>
        <div class="campo"><label>Token de integracao do Notion</label><input id="notion_token" placeholder="${notion.tem_token ? 'Token guardado' : 'Cole o token aqui'}" /></div>
        <div class="linha-form">
          <div class="campo"><label>ID da base de dados de encomendas</label><input id="notion_bd_encomendas" value="${ui.esc(notion.bd_encomendas || '')}" /></div>
          <div class="campo"><label>ID da base de dados de clientes</label><input id="notion_bd_clientes" value="${ui.esc(notion.bd_clientes || '')}" /></div>
        </div>
        <div class="barra-acoes">
          <button class="btn" id="guardarNotion">Guardar configuracao</button>
          <button class="btn primario" id="sincronizarNotion">Sincronizar agora</button>
          <span class="etiqueta ${notion.configurado ? 'verde' : 'neutra'}">${notion.configurado ? 'Configurado' : 'Por configurar'}</span>
        </div>
      </div>
    `;

    el.querySelector('#guardarDef').onclick = async () => {
      const campos = ['custo_producao', 'preco_vip', 'preco_pack_tarot', 'iva_taxa', 'meta_mensal', 'dias_atraso_estampagem', 'dias_nao_pago', 'dias_sem_entrega'];
      const dados = {};
      campos.forEach((c) => (dados[c] = Number(el.querySelector('#' + c).value)));
      await App.api.put('/api/definicoes', dados);
      ui.toast('Definicoes guardadas', 'sucesso');
    };

    el.querySelector('#criarBackup').onclick = async () => {
      const r = await App.api.post('/api/backup/criar', {});
      ui.toast('Copia criada: ' + r.ficheiro, 'sucesso');
      this.render(el);
    };

    el.querySelector('#exportarJson').onclick = () => (window.location = '/api/backup/exportar.json');

    el.querySelector('#importarJson').onchange = async (ev) => {
      const ficheiro = ev.target.files[0];
      if (!ficheiro) return;
      if (!(await ui.confirmar('Importar dados substitui o conteudo atual. Continuar?'))) return;
      const texto = await ficheiro.text();
      try {
        const dados = JSON.parse(texto);
        await App.api.post('/api/backup/importar', dados);
        ui.toast('Dados importados com sucesso', 'sucesso');
        App.estado.limparCache();
        this.render(el);
      } catch (err) {
        ui.toast('Falha na importacao: ' + err.message, 'erro');
      }
    };

    el.querySelector('#guardarNotion').onclick = async () => {
      const dados = {
        bd_encomendas: el.querySelector('#notion_bd_encomendas').value,
        bd_clientes: el.querySelector('#notion_bd_clientes').value,
      };
      const token = el.querySelector('#notion_token').value;
      if (token) dados.token = token;
      await App.api.put('/api/notion', dados);
      ui.toast('Configuracao do Notion guardada', 'sucesso');
      this.render(el);
    };

    el.querySelector('#sincronizarNotion').onclick = async () => {
      const r = await App.api.post('/api/notion/sincronizar', {});
      ui.toast(r.mensagem, r.ok ? 'sucesso' : 'erro');
    };
  },

  listaBackups(backups) {
    const ui = App.ui;
    if (!backups.length) return '<div class="vazio">Sem copias de seguranca criadas.</div>';
    return `<ul class="lista-dados">${backups
      .map(
        (b) => `<li><span>${ui.esc(b.ficheiro)}</span><span style="color:var(--texto-suave)">${ui.dataHora(b.criado_em)} (${(b.tamanho / 1024).toFixed(0)} KB)</span></li>`
      )
      .join('')}</ul>`;
  },
};
