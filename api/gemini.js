// Vercel Serverless Function — "Mago Assistente" do Ponto Riscado.
//
// Recebe um POST com { necessidade } e pede ao Google Gemini (Flash) que
// eleja 1 a 3 orixás para compor um ponto riscado. Devolve ao frontend um
// JSON no formato { orixas: [...], explicacao: "..." }.
//
// A chave da API fica sempre na variável de ambiente GEMINI_API_KEY
// (Vercel > Settings > Environment Variables), nunca no código.

const ORIXAS_VALIDOS = [
  'Oxalá', 'Logunã', 'Oxumaré', 'Oxum', 'Oxóssi', 'Obá', 'Xangô',
  'Oroiná', 'Ogum', 'Iansã', 'Obaluaiê', 'Nanã', 'Omolu', 'Iemanjá',
];

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ erro: 'GEMINI_API_KEY não está configurada no servidor.' });
    }

    const prompt = `És um mestre de Umbanda Sagrada especialista em Magia do Ponto Riscado. O utilizador precisa de resolver o seguinte: '${necessidade}'. Os Orixás disponíveis são: Oxalá, Logunã, Oxumaré, Oxum, Oxóssi, Obá, Xangô, Oroiná, Ogum, Iansã, Obaluaiê, Nanã, Omolu, Iemanjá. Elege 1 a 3 orixás ideais para compor um ponto riscado que resolva a questão. Deves responder ESTRITAMENTE com um objeto JSON válido, sem formatação markdown ou blocos de código, com esta estrutura exata: { "orixas": ["Nome do Orixa"], "explicacao": "Justificação mágica curta e direta do porquê desta combinação e como a força deles atua no ponto." }`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const resposta = await fetch(endpoint, {
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
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      return res.status(502).json({
        erro: 'A API do Gemini devolveu um erro.',
        detalhe: detalhe.slice(0, 500),
      });
    }

    const data = await resposta.json();

    // Extrai o texto da resposta do modelo.
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      return res.status(502).json({ erro: 'Resposta vazia ou inesperada do Gemini.' });
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
        erro: 'Não foi possível interpretar o JSON devolvido pelo Gemini.',
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
        erro: 'O Gemini não indicou orixás válidos para esta necessidade.',
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
