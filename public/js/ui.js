/*
  Utilitarios de interface partilhados: notificacoes, modal, formatacao e
  pequenos auxiliares para construir HTML de forma segura.
*/
window.App = window.App || {};

App.ui = (function () {
  // Escapa texto para evitar injecao de HTML
  function esc(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Formata um valor monetario em euros
  function euros(valor) {
    const n = Number(valor) || 0;
    return n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' euros';
  }

  // Formata uma data ISO para o formato portugues
  function data(texto) {
    if (!texto) return '';
    const d = new Date(String(texto).replace(' ', 'T'));
    if (isNaN(d.getTime())) return esc(texto);
    return d.toLocaleDateString('pt-PT');
  }

  function dataHora(texto) {
    if (!texto) return '';
    const d = new Date(String(texto).replace(' ', 'T'));
    if (isNaN(d.getTime())) return esc(texto);
    return d.toLocaleString('pt-PT');
  }

  // Mostra uma notificacao temporaria
  function toast(mensagem, tipo) {
    const cont = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (tipo || '');
    el.textContent = mensagem;
    cont.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  // Abre o modal com um titulo e conteudo HTML, devolve o elemento do corpo
  function abrirModal(titulo, htmlConteudo, largura) {
    const fundo = document.getElementById('modalFundo');
    const modal = document.getElementById('modal');
    if (largura) modal.style.maxWidth = largura;
    else modal.style.maxWidth = '760px';
    modal.innerHTML =
      `<div class="modal-cabecalho"><h2>${esc(titulo)}</h2>` +
      `<button class="fechar" id="fecharModal" aria-label="Fechar">&times;</button></div>` +
      `<div id="modalCorpo">${htmlConteudo}</div>`;
    fundo.classList.add('aberto');
    document.getElementById('fecharModal').onclick = fecharModal;
    return document.getElementById('modalCorpo');
  }

  function fecharModal() {
    const fundo = document.getElementById('modalFundo');
    fundo.classList.remove('aberto');
    document.getElementById('modal').innerHTML = '';
  }

  // Confirmacao simples com promessa
  function confirmar(mensagem) {
    return new Promise((resolve) => {
      const corpo = abrirModal(
        'Confirmar',
        `<p>${esc(mensagem)}</p>
         <div class="barra-acoes" style="justify-content:flex-end;margin-top:1rem">
           <button class="btn" id="confNao">Cancelar</button>
           <button class="btn perigo" id="confSim">Confirmar</button>
         </div>`,
        '420px'
      );
      corpo.querySelector('#confNao').onclick = () => {
        fecharModal();
        resolve(false);
      };
      corpo.querySelector('#confSim').onclick = () => {
        fecharModal();
        resolve(true);
      };
    });
  }

  // Gera as opcoes de um select
  function opcoes(lista, selecionado, mapa) {
    return lista
      .map((item) => {
        const valor = mapa ? item[mapa.valor] : item;
        const etiqueta = mapa ? item[mapa.etiqueta] : item;
        const sel = String(valor) === String(selecionado) ? ' selected' : '';
        return `<option value="${esc(valor)}"${sel}>${esc(etiqueta)}</option>`;
      })
      .join('');
  }

  // Etiqueta colorida para estados
  function etiquetaEstado(estado) {
    const mapa = {
      Pago: 'verde',
      'Nao pago': 'vermelho',
      Entregue: 'verde',
      Enviado: 'azul',
      'Por preparar': 'laranja',
      Pendente: 'laranja',
      Recebido: 'verde',
    };
    const cor = mapa[estado] || 'neutra';
    return `<span class="etiqueta ${cor}">${esc(estado)}</span>`;
  }

  function hoje() {
    return new Date().toISOString().slice(0, 10);
  }

  function mesAtual() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  return {
    esc,
    euros,
    data,
    dataHora,
    toast,
    abrirModal,
    fecharModal,
    confirmar,
    opcoes,
    etiquetaEstado,
    hoje,
    mesAtual,
  };
})();
