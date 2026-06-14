/*
  Aplicacao principal.
  Gere o estado partilhado, a navegacao e o carregamento das vistas.
*/
window.App = window.App || {};

// Estado partilhado com cache simples do catalogo
App.estado = (function () {
  let catalogoCache = null;
  return {
    async catalogo() {
      if (!catalogoCache) {
        catalogoCache = await App.api.get('/api/catalogo');
      }
      return catalogoCache;
    },
    limparCache() {
      catalogoCache = null;
    },
  };
})();

// Encaminhador e navegacao
App.router = (function () {
  // Ordem de apresentacao das vistas no menu
  const ordem = [
    'dashboard',
    'encomendas',
    'clientes',
    'stock',
    'producao',
    'faturacao',
    'relatorios',
    'calendario',
    'definicoes',
  ];

  let atual = 'dashboard';

  function construirNav() {
    const nav = document.getElementById('nav');
    nav.innerHTML = ordem
      .map((chave) => {
        const v = App.views[chave];
        return `<button data-vista="${chave}">
          <span class="ic">${v.icone}</span>
          <span>${v.titulo}</span>
        </button>`;
      })
      .join('');
    nav.querySelectorAll('[data-vista]').forEach((b) => {
      b.onclick = () => {
        ir(b.dataset.vista);
        fecharMenuMovel();
      };
    });
  }

  function marcarAtivo() {
    document.querySelectorAll('#nav [data-vista]').forEach((b) => {
      b.classList.toggle('ativo', b.dataset.vista === atual);
    });
  }

  async function ir(chave) {
    if (!App.views[chave]) chave = 'dashboard';
    atual = chave;
    window.location.hash = chave;
    marcarAtivo();
    const el = document.getElementById('conteudo');
    el.innerHTML = '<div class="carregar">A carregar...</div>';
    try {
      await App.views[chave].render(el);
    } catch (err) {
      el.innerHTML = `<div class="cartao"><h3>Ocorreu um erro</h3><p style="color:var(--vermelho)">${App.ui.esc(err.message)}</p></div>`;
      App.ui.toast(err.message, 'erro');
    }
  }

  function recarregar() {
    ir(atual);
  }

  function fecharMenuMovel() {
    document.getElementById('barraLateral').classList.remove('movel-aberto');
  }

  function iniciar() {
    construirNav();
    const inicial = (window.location.hash || '').replace('#', '') || 'dashboard';
    ir(inicial);

    // Menu para telemovel
    const toggle = document.getElementById('menuToggle');
    if (toggle) {
      toggle.onclick = () => document.getElementById('barraLateral').classList.toggle('movel-aberto');
    }

    // Fecha o modal ao clicar fora dele
    document.getElementById('modalFundo').addEventListener('click', (ev) => {
      if (ev.target.id === 'modalFundo') App.ui.fecharModal();
    });

    // Responde a navegacao por hash
    window.addEventListener('hashchange', () => {
      const chave = (window.location.hash || '').replace('#', '') || 'dashboard';
      if (chave !== atual) ir(chave);
    });
  }

  return { iniciar, ir, recarregar };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.router.iniciar();
});
