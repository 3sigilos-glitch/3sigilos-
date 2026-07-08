// Detecao, formatacao e transposicao de acordes.
//
// Nao altera o conteudo: recebe o texto original tal e qual e apenas o classifica
// linha a linha (titulo/seccao, acordes ou letra) para a apresentacao. A
// transposicao mexe unicamente nas linhas de acordes, nunca na letra.

const SUSTENIDOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BEMOIS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Um token de acorde: nota A a G, sustenido ou bemol opcional, qualidade e
// extensoes opcionais (m, maj, min, dim, aug, sus, add, numeros e alteracoes) e
// baixo opcional a seguir a barra. Exemplos: Am, C#m7, G/B, Dsus4, F#, Bb, Emaj7.
const RE_ACORDE = /^([A-G])(#|b)?((?:maj|min|sus|add|aug|dim|m|M|b|#|\d)*)(?:\/([A-G])(#|b)?)?$/;

// Palavras que indicam uma seccao (com ou sem numero e repeticoes).
const RE_SECCAO = /^(intro|introducao|verso|refrao|refrão|estribilho|ponte|pre-?refrao|pré-?refrão|solo|coda|final|instrumental|riff|interludio|interlúdio|outro|tema|repete|1a|2a)\b/i;

export type TipoLinha = 'vazia' | 'seccao' | 'acordes' | 'letra';

export interface LinhaClassificada {
  tipo: TipoLinha;
  texto: string;
}

// Diz se um token isolado e um acorde.
export function ehAcorde(token: string): boolean {
  return RE_ACORDE.test(token);
}

// Uma linha e de acordes se a maioria dos seus tokens forem acordes.
export function ehLinhaDeAcordes(linha: string): boolean {
  const tokens = linha.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const acordes = tokens.filter(ehAcorde).length;
  return acordes / tokens.length >= 0.6;
}

// Uma linha e uma seccao se estiver entre parenteses retos ou comecar por uma
// palavra de seccao conhecida e for curta.
export function ehSeccao(linha: string): boolean {
  const t = linha.trim();
  if (/^\[.+\]$/.test(t)) return true;
  if (t.length <= 24 && RE_SECCAO.test(t)) return true;
  return false;
}

// Classifica o texto todo, linha a linha, sem o alterar.
export function classificarLinhas(texto: string): LinhaClassificada[] {
  return (texto ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((linha) => {
      if (linha.trim() === '') return { tipo: 'vazia' as const, texto: '' };
      if (ehSeccao(linha)) return { tipo: 'seccao' as const, texto: linha };
      if (ehLinhaDeAcordes(linha)) return { tipo: 'acordes' as const, texto: linha };
      return { tipo: 'letra' as const, texto: linha };
    });
}

function indiceNota(nota: string): number {
  const i = SUSTENIDOS.indexOf(nota);
  if (i >= 0) return i;
  return BEMOIS.indexOf(nota);
}

// Transpoe uma nota raiz (nota + alteracao) por um numero de semitons.
function transporRaiz(raiz: string, semitons: number, preferirBemol: boolean): string {
  const i = indiceNota(raiz);
  if (i < 0) return raiz;
  const novo = (((i + semitons) % 12) + 12) % 12;
  return preferirBemol ? BEMOIS[novo] : SUSTENIDOS[novo];
}

// Transpoe um unico acorde, preservando a qualidade, as extensoes e o baixo.
export function transporAcorde(token: string, semitons: number): string {
  const m = token.match(RE_ACORDE);
  if (!m) return token;
  const [, raiz, acc = '', suf = '', baixoRaiz, baixoAcc = ''] = m;
  const novaRaiz = transporRaiz(raiz + acc, semitons, acc === 'b');
  let resultado = novaRaiz + suf;
  if (baixoRaiz) {
    resultado += '/' + transporRaiz(baixoRaiz + baixoAcc, semitons, baixoAcc === 'b');
  }
  return resultado;
}

// Transpoe uma linha de acordes, ajustando os espacos para manter, tanto quanto
// possivel, o alinhamento dos acordes sobre a letra.
export function transporLinhaAcordes(linha: string, semitons: number): string {
  let resultado = '';
  const re = /(\S+)(\s*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(linha)) !== null) {
    const palavra = m[1];
    let espacos = m[2];
    if (ehAcorde(palavra)) {
      const novo = transporAcorde(palavra, semitons);
      const diff = novo.length - palavra.length;
      if (diff > 0) espacos = espacos.length > diff ? espacos.slice(diff) : ' ';
      else if (diff < 0) espacos = espacos + ' '.repeat(-diff);
      resultado += novo + espacos;
    } else {
      resultado += palavra + espacos;
    }
  }
  return resultado;
}

// Transpoe o texto todo: so as linhas de acordes mudam, a letra fica intacta.
export function transporTexto(texto: string, semitons: number): string {
  if (!semitons) return texto ?? '';
  return (texto ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((linha) => (!ehSeccao(linha) && ehLinhaDeAcordes(linha) ? transporLinhaAcordes(linha, semitons) : linha))
    .join('\n');
}

// Nome do tom apos transposicao, para mostrar no modo palco.
export function tomTransposto(tom: string | null | undefined, semitons: number): string {
  if (!tom) return '';
  return transporAcorde(tom.trim(), semitons);
}
