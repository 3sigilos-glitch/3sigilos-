/* Vista de definicoes: catalogo, precos, prazos, backup e integracao com o Notion. */
window.App = window.App || {};
App.views = App.views || {};

App.views.definicoes = {
  titulo: 'Definicoes',
  icone: '⚙',

  async render(el) {
    const ui = App.ui;
    el.innerHTML = '<div class="carregar">A carregar definicoes...</div>';
    const [def, backups, notion, modelos, cores, tipos, cat] = await Promise.all([
      App.api.get('/api/definicoes'),
      App.api.get('/api/backup'),
      App.api.get('/api/notion'),
      App.api.get('/api/catalogo/modelos'),
      App.api.get('/api/catalogo/cores'),
      App.api.get('/api/catalogo/tipos-preco'),
      App.api.get('/api/catalogo'),
    ]);

    el.innerHTML = `
      <div class="cabecalho-pagina">
        <div>
          <h1>Definicoes</h1>
          <div class="subtitulo">Catalogo, configuracoes, copias de seguranca e integracoes</div>
        </div>
      </div>

      <div class="seccao-titulo">Catalogo</div>

      <div class="grelha col-2" style="margin-bottom:1.2rem">
        <div class="cartao">
          <h3>Modelos de desenho</h3>
          <p style="color:var(--texto-suave);font-size:0.82rem">Adicione modelos da 3 Sigilos ou de outras marcas, como o Colegio Rompe Mato.</p>
          <div id="listaModelos">${this.listaModelos(modelos)}</div>
          <form id="formModelo" class="linha-form tres" style="margin-top:0.8rem;align-items:end">
            <div class="campo" style="margin:0"><label>Nome do modelo</label><input id="novoModeloNome" placeholder="Nome do desenho" /></div>
            <div class="campo" style="margin:0"><label>Marca</label><input id="novoModeloMarca" list="listaMarcas" value="3 Sigilos" /></div>
            <button type="submit" class="btn primario">Adicionar</button>
          </form>
          <datalist id="listaMarcas">${(cat.marcas || []).map((m) => `<option value="${ui.esc(m)}"></option>`).join('')}</datalist>
        </div>

        <div class="cartao">
          <h3>Cores e modelos de t-shirt</h3>
          <p style="color:var(--texto-suave);font-size:0.82rem">Cores ou tipos de t-shirt em branco usados nas encomendas e no stock.</p>
          <div id="listaCores">${this.listaCores(cores)}</div>
          <form id="formCor" class="linha-form" style="margin-top:0.8rem;align-items:end">
            <div class="campo" style="margin:0"><label>Nome da cor ou tipo</label><input id="novaCorNome" placeholder="Branca, Preta, Cores..." /></div>
            <button type="submit" class="btn primario">Adicionar</button>
          </form>
        </div>
      </div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>Tipos de preco</h3>
        <p style="color:var(--texto-suave);font-size:0.82rem">Valores aplicaveis por encomenda. PVP normal 19 euros, VIP 12 euros, Terreiro 6 euros, Europa 33 euros, Rompe Mato cores 6 euros e Rompe Mato branca 5 euros.</p>
        <div id="listaTipos">${this.listaTipos(tipos)}</div>
        <form id="formTipo" class="linha-form tres" style="margin-top:0.8rem;align-items:end">
          <div class="campo" style="margin:0"><label>Nome do tipo</label><input id="novoTipoNome" placeholder="Ex: Rompe Mato cores" /></div>
          <div class="campo" style="margin:0"><label>Preco (euros)</label><input type="number" step="0.01" id="novoTipoPreco" placeholder="0.00" /></div>
          <button type="submit" class="btn primario">Adicionar tipo</button>
        </form>
      </div>

      <div class="seccao-titulo">Configuracoes</div>

      <div class="cartao" style="margin-bottom:1.2rem">
        <h3>Precos e custos</h3>
        <div class="linha-form tres">
          <div class="campo"><label>Custo de producao por t-shirt (euros)</label><input type="number" step="0.01" id="custo_producao" value="${def.custo_producao}" /></div>
          <div class="campo"><label>Preco Pack Tarot (euros)</label><input type="number" step="0.01" id="preco_pack_tarot" value="${def.preco_pack_tarot}" /></div>
          <div class="campo"><label>Taxa de IVA (%)</label><input type="number" step="0.1" id="iva_taxa" value="${def.iva_taxa}" /></div>
        </div>
        <div class="linha-form">
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
        <div class="barra-acoes" style="margin-top:0.5rem"><button class="btn primario" id="guardarDef">Guardar configuracoes</button></div>
      </div>

      <div class="seccao-titulo">Dados</div>

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

    this.ligarEventos(el);
  },

  listaModelos(modelos) {
    const ui = App.ui;
    if (!modelos.length) return '<div class="vazio">Sem modelos.</div>';
    return `<ul class="lista-dados">${modelos
      .map(
        (m) => `<li>
          <span>${ui.esc(m.nome)} <span class="etiqueta neutra">${ui.esc(m.marca)}</span></span>
          <button class="btn pequeno perigo" data-del-modelo="${m.id}">Remover</button>
        </li>`
      )
      .join('')}</ul>`;
  },

  listaCores(cores) {
    const ui = App.ui;
    if (!cores.length) return '<div class="vazio">Sem cores.</div>';
    return `<ul class="lista-dados">${cores
      .map(
        (c) => `<li>
          <span>${ui.esc(c.nome)}</span>
          <button class="btn pequeno perigo" data-del-cor="${c.id}">Remover</button>
        </li>`
      )
      .join('')}</ul>`;
  },

  listaTipos(tipos) {
    const ui = App.ui;
    return `<div class="tabela-wrap"><table>
      <thead><tr><th>Tipo</th><th>Preco</th><th>Ativo</th><th></th></tr></thead>
      <tbody>${tipos
        .map(
          (t) => `<tr>
            <td>${ui.esc(t.etiqueta)}</td>
            <td>${t.manual ? '<span class="etiqueta neutra">Manual</span>' : `<input type="number" step="0.01" value="${t.preco != null ? t.preco : ''}" data-preco-tipo="${ui.esc(t.slug)}" style="max-width:110px" />`}</td>
            <td><input type="checkbox" ${t.ativo ? 'checked' : ''} data-ativo-tipo="${ui.esc(t.slug)}" /></td>
            <td>${t.slug === 'personalizado' ? '' : `<button class="btn pequeno perigo" data-del-tipo="${ui.esc(t.slug)}">Remover</button>`}</td>
          </tr>`
        )
        .join('')}</tbody></table></div>
      <div class="barra-acoes" style="margin-top:0.6rem"><button class="btn" id="guardarTipos">Guardar precos dos tipos</button></div>`;
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

  ligarEventos(el) {
    const ui = App.ui;
    const recarregar = () => {
      App.estado.limparCache();
      this.render(el);
    };

    // Adicionar modelo
    el.querySelector('#formModelo').onsubmit = async (ev) => {
      ev.preventDefault();
      const nome = el.querySelector('#novoModeloNome').value;
      const marca = el.querySelector('#novoModeloMarca').value;
      if (!nome.trim()) return ui.toast('Indique o nome do modelo', 'erro');
      try {
        await App.api.post('/api/catalogo/modelos', { nome, marca });
        ui.toast('Modelo adicionado', 'sucesso');
        recarregar();
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };

    // Adicionar cor
    el.querySelector('#formCor').onsubmit = async (ev) => {
      ev.preventDefault();
      const nome = el.querySelector('#novaCorNome').value;
      if (!nome.trim()) return ui.toast('Indique o nome da cor', 'erro');
      try {
        await App.api.post('/api/catalogo/cores', { nome });
        ui.toast('Cor adicionada', 'sucesso');
        recarregar();
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };

    // Adicionar tipo de preco
    el.querySelector('#formTipo').onsubmit = async (ev) => {
      ev.preventDefault();
      const etiqueta = el.querySelector('#novoTipoNome').value;
      const preco = el.querySelector('#novoTipoPreco').value;
      if (!etiqueta.trim()) return ui.toast('Indique o nome do tipo', 'erro');
      try {
        await App.api.post('/api/catalogo/tipos-preco', { etiqueta, preco });
        ui.toast('Tipo de preco adicionado', 'sucesso');
        recarregar();
      } catch (err) {
        ui.toast(err.message, 'erro');
      }
    };

    // Remocoes
    el.querySelectorAll('[data-del-modelo]').forEach((b) => {
      b.onclick = async () => {
        if (await ui.confirmar('Remover este modelo?')) {
          await App.api.del('/api/catalogo/modelos/' + b.dataset.delModelo);
          ui.toast('Modelo removido', 'sucesso');
          recarregar();
        }
      };
    });
    el.querySelectorAll('[data-del-cor]').forEach((b) => {
      b.onclick = async () => {
        if (await ui.confirmar('Remover esta cor? O stock associado tambem e removido.')) {
          await App.api.del('/api/catalogo/cores/' + b.dataset.delCor);
          ui.toast('Cor removida', 'sucesso');
          recarregar();
        }
      };
    });
    el.querySelectorAll('[data-del-tipo]').forEach((b) => {
      b.onclick = async () => {
        if (await ui.confirmar('Remover este tipo de preco?')) {
          try {
            await App.api.del('/api/catalogo/tipos-preco/' + b.dataset.delTipo);
            ui.toast('Tipo removido', 'sucesso');
            recarregar();
          } catch (err) {
            ui.toast(err.message, 'erro');
          }
        }
      };
    });

    // Guardar precos e estados dos tipos
    el.querySelector('#guardarTipos').onclick = async () => {
      const pedidos = [];
      el.querySelectorAll('[data-ativo-tipo]').forEach((chk) => {
        const slug = chk.dataset.ativoTipo;
        const precoInput = el.querySelector(`[data-preco-tipo="${slug}"]`);
        const dados = { ativo: chk.checked };
        if (precoInput) dados.preco = Number(precoInput.value);
        pedidos.push(App.api.put('/api/catalogo/tipos-preco/' + slug, dados));
      });
      await Promise.all(pedidos);
      ui.toast('Tipos de preco guardados', 'sucesso');
      recarregar();
    };

    // Guardar configuracoes gerais
    el.querySelector('#guardarDef').onclick = async () => {
      const campos = ['custo_producao', 'preco_pack_tarot', 'iva_taxa', 'meta_mensal', 'dias_atraso_estampagem', 'dias_nao_pago', 'dias_sem_entrega'];
      const dados = {};
      campos.forEach((c) => (dados[c] = Number(el.querySelector('#' + c).value)));
      await App.api.put('/api/definicoes', dados);
      ui.toast('Configuracoes guardadas', 'sucesso');
    };

    // Backups
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
      try {
        const dados = JSON.parse(await ficheiro.text());
        await App.api.post('/api/backup/importar', dados);
        ui.toast('Dados importados com sucesso', 'sucesso');
        recarregar();
      } catch (err) {
        ui.toast('Falha na importacao: ' + err.message, 'erro');
      }
    };

    // Notion
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
};
