import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb, type PDFImage } from 'pdf-lib';
import { dataExtenso, hora, euros } from '@/lib/formatar';
import type { EventoDetalhado } from '@/lib/consultas';
import type { Definicoes } from '@/lib/tipos';

// Gera o PDF da proposta: documento profissional, fundo claro, texto preto.
// Se existir um logotipo preto em public/logo-preto.(png|jpg), usa-o no topo;
// caso contrario desenha o nome da banda em tipografia.
export async function gerarPdfProposta(
  evento: EventoDetalhado,
  definicoes: Definicoes | null
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const pagina = doc.addPage([595.28, 841.89]); // A4 em pontos
  const { width, height } = pagina.getSize();
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const fonteBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const preto = rgb(0.05, 0.05, 0.06);
  const cinza = rgb(0.4, 0.4, 0.42);
  const acento = rgb(0.886, 0.231, 0.18);
  const margem = 56;
  let y = height - margem;

  // Cabecalho: logotipo preto se existir, senao o nome em texto.
  const logo = await carregarLogoPreto(doc);
  if (logo) {
    const escala = 120 / logo.width;
    pagina.drawImage(logo, { x: margem, y: y - logo.height * escala + 10, width: logo.width * escala, height: logo.height * escala });
    y -= logo.height * escala + 14;
  } else {
    pagina.drawText("N'ASA", { x: margem, y: y - 24, size: 30, font: fonteBold, color: preto });
    pagina.drawText('Tributo ao rock portugues', { x: margem, y: y - 40, size: 10, font: fonte, color: cinza });
    y -= 60;
  }

  // Referencia e data, alinhadas a direita.
  const ref = `Proposta ${evento.referencia ?? ''}`.trim();
  pagina.drawText(ref, { x: width - margem - fonteBold.widthOfTextAtSize(ref, 13), y: height - margem - 6, size: 13, font: fonteBold, color: acento });
  const dataHoje = new Date().toISOString().slice(0, 10);
  pagina.drawText(dataHoje, { x: width - margem - fonte.widthOfTextAtSize(dataHoje, 10), y: height - margem - 22, size: 10, font: fonte, color: cinza });

  // Linha separadora.
  y -= 6;
  pagina.drawLine({ start: { x: margem, y }, end: { x: width - margem, y }, thickness: 1, color: rgb(0.85, 0.85, 0.86) });
  y -= 26;

  const larguraTexto = width - margem * 2;
  const escrever = (texto: string, opc: { size?: number; bold?: boolean; cor?: any; espaco?: number } = {}) => {
    const size = opc.size ?? 11;
    const f = opc.bold ? fonteBold : fonte;
    for (const linha of quebrar(texto, f, size, larguraTexto)) {
      pagina.drawText(linha, { x: margem, y, size, font: f, color: opc.cor ?? preto });
      y -= size + 5;
    }
    y -= opc.espaco ?? 0;
  };

  if (definicoes?.texto_proposta_intro) {
    escrever(definicoes.texto_proposta_intro, { size: 11, cor: cinza, espaco: 12 });
  }

  escrever('EVENTO', { size: 9, bold: true, cor: cinza });
  escrever(evento.evento, { size: 14, bold: true, espaco: 8 });

  const h = hora(evento.data);
  escrever(`Data: ${dataExtenso(evento.data)}${h ? `, ${h}` : ''}`);
  const sitio = [evento.local, evento.concelho].filter(Boolean).join(', ');
  if (sitio) escrever(`Local: ${sitio}`);
  if (evento.contratante?.nome) escrever(`Para: ${evento.contratante.nome}`);
  y -= 14;

  // Caixa de valores.
  const alturaCaixa = (evento.deslocacao_valor ?? 0) > 0 ? 86 : 64;
  pagina.drawRectangle({ x: margem, y: y - alturaCaixa, width: larguraTexto, height: alturaCaixa, color: rgb(0.96, 0.96, 0.97), borderColor: rgb(0.88, 0.88, 0.9), borderWidth: 1 });
  let yc = y - 20;
  const linhaValor = (rotulo: string, valor: string, destaque = false) => {
    const f = destaque ? fonteBold : fonte;
    const size = destaque ? 15 : 11;
    pagina.drawText(rotulo, { x: margem + 16, y: yc, size: destaque ? 11 : 11, font: destaque ? fonteBold : fonte, color: destaque ? preto : cinza });
    pagina.drawText(valor, { x: width - margem - 16 - f.widthOfTextAtSize(valor, size), y: yc - (destaque ? 2 : 0), size, font: f, color: destaque ? acento : preto });
    yc -= destaque ? 26 : 20;
  };
  linhaValor('Valor do espetaculo', euros(evento.valor_base));
  if ((evento.deslocacao_valor ?? 0) > 0) {
    const desc = evento.deslocacao_descricao ? ` (${evento.deslocacao_descricao})` : '';
    linhaValor('Deslocacao' + desc, euros(evento.deslocacao_valor));
  }
  linhaValor('Valor total', euros(evento.valor_total), true);
  y -= alturaCaixa + 24;

  if (evento.escalao?.condicoes) {
    escrever('CONDICOES', { size: 9, bold: true, cor: cinza });
    escrever(evento.escalao.condicoes, { size: 11, espaco: 14 });
  }

  if (definicoes?.link_materiais) {
    escrever('MATERIAIS', { size: 9, bold: true, cor: cinza });
    escrever(definicoes.link_materiais, { size: 11, cor: acento, espaco: 14 });
  }

  if (definicoes?.texto_proposta_fecho) {
    escrever(definicoes.texto_proposta_fecho, { size: 11, cor: cinza, espaco: 10 });
  }

  // Rodape com o nome da banda.
  pagina.drawText(definicoes?.nome_banda ?? "N'ASA", { x: margem, y: margem + 16, size: 12, font: fonteBold, color: preto });
  if (definicoes?.localidade_base) {
    pagina.drawText(definicoes.localidade_base, { x: margem, y: margem + 2, size: 10, font: fonte, color: cinza });
  }

  return doc.save();
}

// Tenta carregar um logotipo preto do diretorio public, se existir.
async function carregarLogoPreto(doc: PDFDocument): Promise<PDFImage | null> {
  const candidatos = ['logo-preto.png', 'logo-preto.jpg', 'logo-preto.jpeg'];
  for (const nome of candidatos) {
    try {
      const caminho = path.join(process.cwd(), 'public', nome);
      const bytes = await fs.readFile(caminho);
      return nome.endsWith('.png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      // Tenta o proximo candidato.
    }
  }
  return null;
}

// Quebra um texto em linhas que cabem na largura dada.
function quebrar(texto: string, fonte: any, size: number, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of palavras) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (fonte.widthOfTextAtSize(teste, size) > largura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [''];
}
