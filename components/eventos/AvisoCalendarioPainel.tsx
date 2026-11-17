import Link from 'next/link';
import { obterResumoCalendario, sincronizarComCalendario } from '@/lib/calendarioDados';

// Resumo do calendario Google no Painel: aplica logo o que o calendario diz
// (estados) e mostra, numa linha cada, o que precisa de atencao. Toca para ir a
// Agenda. Sem calendario ligado, ou sem nada a dizer, nao aparece.
export default async function AvisoCalendarioPainel() {
  let linhas: { texto: string; cor: string }[] = [];
  try {
    const sinc = await sincronizarComCalendario();
    const resumo = await obterResumoCalendario();
    if (resumo.estado !== 'ligado') return null;

    const porImportar =
      resumo.cruzamento.novos.filter((c) => c.provavel).length + resumo.cruzamento.mesmoDia.length;
    const avisos = sinc.mudouDia.length + sinc.desapareceu.length;
    const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

    if (sinc.alterados.length > 0)
      linhas.push({ texto: `${plural(sinc.alterados.length, 'estado atualizado', 'estados atualizados')} agora`, cor: 'var(--estado-pre-reserva)' });
    if (resumo.conflitos.length > 0)
      linhas.push({ texto: `${plural(resumo.conflitos.length, 'concerto', 'concertos')} com alguem indisponivel`, cor: 'var(--estado-recusado)' });
    if (avisos > 0)
      linhas.push({ texto: `${plural(avisos, 'evento', 'eventos')} a verificar (data ou entrada apagada)`, cor: 'var(--estado-orcamentado)' });
    if (porImportar > 0)
      linhas.push({ texto: `${plural(porImportar, 'concerto novo', 'concertos novos')} por importar`, cor: 'var(--acento-forte)' });
  } catch {
    return null;
  }
  if (linhas.length === 0) return null;

  return (
    <Link href="/eventos" className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="rotulo-seccao">Calendario Google</span>
      {linhas.map((l) => (
        <span key={l.texto} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: l.cor, flexShrink: 0 }} />
          {l.texto}
        </span>
      ))}
      <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>Ver na Agenda</span>
    </Link>
  );
}
