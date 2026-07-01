import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterDefinicoes, listarEscaloes } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { euros } from '@/lib/formatar';
import { guardarDefinicoes } from './acoes';
import CopiaSeguranca from '@/components/definicoes/CopiaSeguranca';

export default async function PaginaDefinicoes() {
  const sessao = await obterSessao();
  if (!sessao.ehAdmin) redirect('/painel');

  const [definicoes, escaloes] = await Promise.all([obterDefinicoes(), listarEscaloes()]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 30 }}>Definicoes</h1>

      {/* Parametros gerais e textos da proposta */}
      <form action={guardarDefinicoes} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Geral</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Campo etiqueta="Nome da banda">
            <input name="nome_banda" className="campo" defaultValue={definicoes?.nome_banda ?? "N'ASA"} />
          </Campo>
          <Campo etiqueta="Localidade base">
            <input name="localidade_base" className="campo" defaultValue={definicoes?.localidade_base ?? 'Leiria'} />
          </Campo>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Campo etiqueta="Dias follow-up">
            <input type="number" name="dias_followup" className="campo" defaultValue={definicoes?.dias_followup ?? 10} />
          </Campo>
          <Campo etiqueta="Dias lembrete">
            <input type="number" name="dias_lembrete_preconcerto" className="campo" defaultValue={definicoes?.dias_lembrete_preconcerto ?? 15} />
          </Campo>
          <Campo etiqueta="Proxima referencia">
            <input type="number" name="proxima_referencia" className="campo" defaultValue={definicoes?.proxima_referencia ?? 50} />
          </Campo>
        </div>

        <Campo etiqueta="Link de materiais">
          <input name="link_materiais" className="campo" defaultValue={definicoes?.link_materiais ?? ''} placeholder="https://..." />
        </Campo>

        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em', marginTop: 8 }}>Textos da proposta</h2>
        <Campo etiqueta="Introducao">
          <textarea name="texto_proposta_intro" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={definicoes?.texto_proposta_intro ?? ''} />
        </Campo>
        <Campo etiqueta="Fecho">
          <textarea name="texto_proposta_fecho" className="campo" rows={2} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={definicoes?.texto_proposta_fecho ?? ''} />
        </Campo>

        <button type="submit" className="botao">Guardar definicoes</button>
      </form>

      {/* Escaloes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Escaloes</h2>
          <Link href="/definicoes/escaloes/novo" className="botao" style={{ width: 'auto' }}>Novo</Link>
        </div>
        {escaloes.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Sem escaloes. Cria o primeiro.</p>
        ) : (
          escaloes.map((e) => (
            <Link key={e.id} href={`/definicoes/escaloes/${e.id}`} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <strong style={{ fontSize: 16 }}>{e.nome}</strong>
                {e.condicoes && <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{e.condicoes}</span>}
              </span>
              <strong className="titulo numero" style={{ fontSize: 16 }}>{euros(e.valor_base)}</strong>
            </Link>
          ))
        )}
      </div>

      {/* Copias de seguranca */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>Copias de seguranca</h2>
        <div className="cartao">
          <CopiaSeguranca />
        </div>
      </div>
    </section>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>{etiqueta}</span>
      {children}
    </label>
  );
}
