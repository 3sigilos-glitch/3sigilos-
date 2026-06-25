import { dataExtenso, hora, euros } from '@/lib/formatar';
import type { EventoDetalhado } from '@/lib/consultas';
import type { Definicoes } from '@/lib/tipos';

// Constroi o texto da proposta, pronto a copiar para email ou mensagem.
// Usa a mesma fonte de verdade que o PDF, para nao haver divergencias.
export function construirTextoProposta(evento: EventoDetalhado, definicoes: Definicoes | null): string {
  const linhas: string[] = [];
  const nomeBanda = definicoes?.nome_banda ?? "N'ASA";

  linhas.push(`Proposta ${evento.referencia ?? '(sem referencia)'}`);
  linhas.push('');

  if (definicoes?.texto_proposta_intro) {
    linhas.push(definicoes.texto_proposta_intro);
    linhas.push('');
  }

  linhas.push(`Evento: ${evento.evento}`);
  const h = hora(evento.data);
  linhas.push(`Data: ${dataExtenso(evento.data)}${h ? `, ${h}` : ''}`);
  const sitio = [evento.local, evento.concelho].filter(Boolean).join(', ');
  if (sitio) linhas.push(`Local: ${sitio}`);
  if (evento.contratante?.nome) linhas.push(`Para: ${evento.contratante.nome}`);
  linhas.push('');

  linhas.push(`Valor do espetaculo: ${euros(evento.valor_base)}`);
  if ((evento.deslocacao_valor ?? 0) > 0) {
    const desc = evento.deslocacao_descricao ? ` (${evento.deslocacao_descricao})` : '';
    linhas.push(`Deslocacao: ${euros(evento.deslocacao_valor)}${desc}`);
  }
  linhas.push(`Valor total: ${euros(evento.valor_total)}`);
  linhas.push('');

  if (evento.escalao?.condicoes) {
    linhas.push(`Condicoes: ${evento.escalao.condicoes}`);
    linhas.push('');
  }

  if (definicoes?.link_materiais) {
    linhas.push(`Materiais e mais informacao: ${definicoes.link_materiais}`);
    linhas.push('');
  }

  if (definicoes?.texto_proposta_fecho) {
    linhas.push(definicoes.texto_proposta_fecho);
    linhas.push('');
  }

  linhas.push(nomeBanda);
  if (definicoes?.localidade_base) linhas.push(definicoes.localidade_base);

  return linhas.join('\n');
}
