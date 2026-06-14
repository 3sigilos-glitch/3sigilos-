/*
  Camada de acesso a API.
  Centraliza os pedidos ao servidor e o tratamento de erros.
*/
window.App = window.App || {};

App.api = (function () {
  async function pedir(metodo, url, corpo) {
    const opcoes = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
    };
    if (corpo !== undefined) {
      opcoes.body = JSON.stringify(corpo);
    }
    const resposta = await fetch(url, opcoes);
    const tipo = resposta.headers.get('content-type') || '';
    let dados = null;
    if (tipo.includes('application/json')) {
      dados = await resposta.json();
    }
    if (!resposta.ok) {
      const mensagem = (dados && dados.erro) || `Erro ${resposta.status}`;
      throw new Error(mensagem);
    }
    return dados;
  }

  return {
    get: (url) => pedir('GET', url),
    post: (url, corpo) => pedir('POST', url, corpo),
    put: (url, corpo) => pedir('PUT', url, corpo),
    del: (url) => pedir('DELETE', url),
  };
})();
