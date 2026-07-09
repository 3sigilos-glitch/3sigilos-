import Link from 'next/link';
import CopiarBloco from '@/components/CopiarBloco';
import BotaoBriefingEmail from '@/components/automacoes/BotaoBriefingEmail';
import { carregarFollowUps, carregarLembretes, carregarBriefing } from '@/lib/automacoes';
import { dataExtenso } from '@/lib/formatar';

export default async function PaginaAutomacoes() {
  const [followups, lembretes, briefingSemana, briefingMes] = await Promise.all([
    carregarFollowUps(),
    carregarLembretes(),
    carregarBriefing('semana'),
    carregarBriefing('mes'),
  ]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <h1 style={{ fontSize: 30 }}>Automacoes</h1>

      {/* Follow-up de propostas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="rotulo-seccao">
          Follow-up (propostas paradas ha mais de {followups.dias} dias)
        </h2>
        {followups.itens.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Nenhuma proposta a precisar de reforco.</p>
        ) : (
          followups.itens.map(({ evento, diasParado, texto }) => (
            <div key={evento.id} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <Link href={`/eventos/${evento.id}`} style={{ fontSize: 16, fontWeight: 700 }}>{evento.evento}</Link>
                <span style={{ fontSize: 12, color: 'var(--estado-orcamentado)', background: 'var(--superficie-2)', border: '1px solid var(--linha)', borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>parada ha {diasParado} dias</span>
              </div>
              <CopiarBloco texto={texto} etiqueta="Copiar reforco" />
            </div>
          ))
        )}
      </div>

      {/* Lembretes pre-concerto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="rotulo-seccao">
          Lembretes pre-concerto (proximos {lembretes.dias} dias)
        </h2>
        {lembretes.itens.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Sem concertos confirmados a chegar nesta janela.</p>
        ) : (
          lembretes.itens.map(({ evento, diasAte, texto }) => (
            <div key={evento.id} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <Link href={`/eventos/${evento.id}`} style={{ fontSize: 16, fontWeight: 700 }}>{evento.evento}</Link>
                <span style={{ fontSize: 12, color: 'var(--estado-confirmado)', background: 'var(--superficie-2)', border: '1px solid var(--linha)', borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>faltam {diasAte} dias</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{dataExtenso(evento.data)}</span>
              <CopiarBloco texto={texto} etiqueta="Copiar lembrete" />
            </div>
          ))
        )}
      </div>

      {/* Briefings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="rotulo-seccao">Briefings para o grupo</h2>

        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: 16 }}>Esta semana</strong>
          <CopiarBloco texto={briefingSemana.texto} etiqueta="Copiar para WhatsApp" />
          <BotaoBriefingEmail periodo="semana" />
        </div>

        <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: 16 }}>Este mes</strong>
          <CopiarBloco texto={briefingMes.texto} etiqueta="Copiar para WhatsApp" />
          <BotaoBriefingEmail periodo="mes" />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.6 }}>
        Para envios automaticos agendados (sem ser a mao), liga o Vercel Cron a rota
        /api/cron/lembretes, conforme o README.
      </p>
    </section>
  );
}
