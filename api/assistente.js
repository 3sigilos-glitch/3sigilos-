// Vercel Serverless Function — "Mago Assistente" do Ponto Riscado.
//
// Recebe um POST com { necessidade } e pede a um modelo de IA que eleja 1 a 3
// orixás para compor um ponto riscado. Devolve ao frontend um JSON no formato
// { orixas: [...], explicacao: "..." }.
//
// A chave da API fica sempre na variável de ambiente ASSISTENTE_API_KEY
// (Vercel > Settings > Environment Variables), nunca no código.
//
// O modelo é escolhido automaticamente a partir dos que a chave tem disponíveis
// (a Google descontinua modelos com frequência). Pode ser fixado à mão com a
// env ASSISTENTE_MODELO, se se quiser.

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const ORIXAS_VALIDOS = [
  'Oxalá', 'Logunã', 'Oxumaré', 'Oxum', 'Oxóssi', 'Obá', 'Xangô',
  'Oroiná', 'Ogum', 'Iansã', 'Obaluaiê', 'Nanã', 'Omolu', 'Iemanjá',
];

// Ordem de preferência quando vários modelos estão disponíveis (mais leve/rápido
// primeiro). Só são usados os que aparecerem na lista real da conta.
const PREFERENCIA = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-2.5-pro',
];

// Guardado entre invocações "quentes" da função para evitar listar sempre.
let MODELO_CACHE = null;

// Lista os modelos que a chave pode usar e que suportam generateContent.
async function modelosDisponiveis(apiKey) {
  const r = await fetch(`${BASE}/models?key=${apiKey}&pageSize=200`);
  if (!r.ok) return [];
  const d = await r.json();
  const modelos = Array.isArray(d.models) ? d.models : [];
  return modelos
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => (m.name || '').replace(/^models\//, ''))
    .filter(Boolean);
}

// Escolhe o melhor modelo disponível (ou o fixado por ASSISTENTE_MODELO).
async function escolherModelo(apiKey) {
  if (process.env.ASSISTENTE_MODELO) return process.env.ASSISTENTE_MODELO;
  if (MODELO_CACHE) return MODELO_CACHE;

  const nomes = await modelosDisponiveis(apiKey);
  if (!nomes.length) return null;

  let escolhido = PREFERENCIA.find((p) => nomes.includes(p));
  // Se nenhum preferido existir, escolhe um Flash qualquer que sirva para texto.
  if (!escolhido) {
    escolhido = nomes.find((n) => /flash/i.test(n) && !/(vision|embedding|image|tts|audio)/i.test(n));
  }
  // Último recurso: o primeiro modelo capaz de gerar conteúdo.
  if (!escolhido) escolhido = nomes[0];

  MODELO_CACHE = escolhido || null;
  return escolhido;
}

module.exports = async function handler(req, res) {
  // Só aceita POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido. Usa POST.' });
  }

  try {
    // O body pode chegar como objeto (Vercel faz o parse) ou como string.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const necessidade = (body.necessidade || '').toString().trim();

    if (!necessidade) {
      return res.status(400).json({ erro: 'Falta o campo "necessidade".' });
    }

    const apiKey = process.env.ASSISTENTE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ erro: 'A chave do assistente não está configurada no servidor.' });
    }

    const modelo = await escolherModelo(apiKey);
    if (!modelo) {
      return res.status(502).json({ erro: 'Nenhum modelo de IA disponível para esta chave.' });
    }

    const prompt = `És um mestre de Umbanda Sagrada especialista em Magia do Ponto Riscado. O utilizador precisa de resolver o seguinte: '${necessidade}'. Os Orixás disponíveis são: Oxalá, Logunã, Oxumaré, Oxum, Oxóssi, Obá, Xangô, Oroiná, Ogum, Iansã, Obaluaiê, Nanã, Omolu, Iemanjá. Elege 1 a 3 orixás ideais para compor um ponto riscado que resolva a questão. Deves responder ESTRITAMENTE com um objeto JSON válido, sem formatação markdown ou blocos de código, com esta estrutura exata: { "orixas": ["Nome do Orixa"], "explicacao": "Justificação mágica curta e direta do porquê desta combinação e como a força deles atua no ponto." }`;

    const pedido = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          // Pede explicitamente JSON para reduzir a hipótese de markdown à volta.
          responseMimeType: 'application/json',
        },
      }),
    };

    let resposta = await fetch(`${BASE}/models/${modelo}:generateContent?key=${apiKey}`, pedido);

    // Se o modelo em cache entretanto foi descontinuado (404), volta a escolher
    // um da lista atual e tenta uma vez mais.
    if (resposta.status === 404) {
      MODELO_CACHE = null;
      const novo = await escolherModelo(apiKey);
      if (novo && novo !== modelo) {
        resposta = await fetch(`${BASE}/models/${novo}:generateContent?key=${apiKey}`, pedido);
      }
    }

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      return res.status(502).json({
        erro: 'O assistente devolveu um erro.',
        detalhe: detalhe.slice(0, 500),
      });
    }

    const data = await resposta.json();

    // Extrai o texto da resposta do modelo.
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      return res.status(502).json({ erro: 'Resposta vazia ou inesperada do assistente.' });
    }

    // Limpa eventuais crases de markdown (```json ... ```) caso o modelo falhe a restrição.
    let limpo = texto.trim();
    limpo = limpo.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Se ainda vier lixo à volta, isola o primeiro objeto JSON pelas chavetas.
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio > 0 || fim < limpo.length - 1) {
      if (inicio !== -1 && fim !== -1 && fim > inicio) {
        limpo = limpo.slice(inicio, fim + 1);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(limpo);
    } catch (e) {
      return res.status(502).json({
        erro: 'Não foi possível interpretar a resposta do assistente.',
        bruto: texto.slice(0, 500),
      });
    }

    // Normaliza e valida a forma final antes de devolver ao frontend.
    let orixas = Array.isArray(parsed.orixas) ? parsed.orixas : [];
    orixas = orixas
      .map((n) => (n || '').toString().trim())
      .filter(Boolean)
      // Mantém apenas orixás reconhecidos (o frontend usa o nome como chave da estrela).
      .filter((n) => ORIXAS_VALIDOS.includes(n))
      .slice(0, 3);

    const explicacao = (parsed.explicacao || '').toString().trim();

    if (!orixas.length) {
      return res.status(502).json({
        erro: 'O assistente não indicou orixás válidos para esta necessidade.',
        bruto: texto.slice(0, 500),
      });
    }

    return res.status(200).json({ orixas, explicacao });
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro interno ao consultar os mistérios.',
      detalhe: (err && err.message) ? err.message : String(err),
    });
  }
};
