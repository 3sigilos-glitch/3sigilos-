import type { Config } from 'tailwindcss';

// Tema da 3 Sigilos: fundo escuro e mistico, dourado discreto, cantos suaves.
// As cores ficam em tokens para manter a coerencia em toda a aplicacao.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Superficies, do mais escuro ao menos escuro.
        fundo: '#0a090d',          // fundo quase preto, com um toque de violeta
        superficie: '#14121a',     // cartoes e barras
        'superficie-2': '#1d1a25', // campos e realces de superficie
        linha: '#2b2735',          // contornos e linhas finas

        // Texto.
        texto: '#ece9f2',          // branco sujo
        'texto-suave': '#a49db4',  // secundario
        'texto-fraco': '#6f687d',  // legendas e pistas

        // Acento dourado discreto.
        dourado: '#c9a24b',
        'dourado-claro': '#e6c878',
        'dourado-suave': 'rgba(201, 162, 75, 0.12)',

        // Estados, cada um com cor clara e propria.
        'estado-repor': '#e0574e',     // alerta de stock baixo
        'estado-aviso': '#d8a23a',     // por estampar / por faturar
        'estado-ok': '#4fb286',        // entregue / pago / faturado
        'estado-info': '#5a9bd6',      // neutro informativo
      },
      borderRadius: {
        suave: '14px',
        media: '12px',
        pequeno: '9px',
      },
      fontFamily: {
        titulo: ['var(--fonte-titulo)', 'serif'],
        corpo: ['var(--fonte-corpo)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '680px',
      },
    },
  },
  plugins: [],
};

export default config;
