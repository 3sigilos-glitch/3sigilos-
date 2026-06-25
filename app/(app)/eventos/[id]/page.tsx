import Link from 'next/link';
import { notFound } from 'next/navigation';
import EtiquetaEstado from '@/components/EtiquetaEstado';
import BotaoApagar from '@/components/BotaoApagar';
import { obterEvento } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { apagarEvento } from '../acoes';
import { dataExtenso, hora, textoDias, euros } from '@/lib/formatar';
import { DISPONIBILIDADE_TECNICO, ESTADO_PAGAMENTO } from '@/lib/tipos';

export default async function PaginaFichaEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evento, sessao] = await Promise.all([obterEvento(id), obterSessao()]);
  if (!evento) notFound();

  const h = hora(evento.data);
  const dias = textoDias(evento.data);
  const apagar = apagarEvento.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/eventos" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/eventos/${id}/proposta`} className="botao botao-secundario" style={{ width: 'auto' }}>Proposta</Link>
          <Link href={`/eventos/${id}/editar`} className="botao" style={{ width: 'auto' }}>Editar</Link>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h1 style={{ fontSize: 30 }}>{evento.evento}</h1>
          <EtiquetaEstado estado={evento.estado} />
        </div>
        {evento.referencia && (
          <span style={{ fontSize: 13, color: 'var(--texto-fraco)', letterSpacing: '0.04em' }}>{evento.referencia}</span>
        )}
      </div>

      {/* Valor em destaque */}
      <div className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Valor total</span>
          {(evento.deslocacao_valor ?? 0) > 0 && (
            <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>
              {euros(evento.valor_base)} base + {euros(evento.deslocacao_valor)} deslocacao
            </span>
          )}
        </div>
        <strong className="titulo" style={{ fontSize: 34, color: 'var(--acento)' }}>{euros(evento.valor_total)}</strong>
      </div>

      <Bloco titulo="Quando e onde">
        <Linha rotulo="Data" valor={`${dataExtenso(evento.data)}${h ? `, ${h}` : ''}${dias ? `  (${dias})` : ''}`} />
        <Linha rotulo="Local" valor={evento.local} />
        <Linha rotulo="Concelho" valor={evento.concelho} />
      </Bloco>

      <Bloco titulo="Contratacao">
        <Linha rotulo="Contratante" valor={evento.contratante?.nome} />
        {evento.contratante?.telefone && <Linha rotulo="Telefone" valor={evento.contratante.telefone} />}
        {evento.contratante?.email && <Linha rotulo="Email" valor={evento.contratante.email} />}
        <Linha rotulo="Quem tratou" valor={evento.quem_tratou?.nome} />
        <Linha rotulo="Escalao" valor={evento.escalao?.nome} />
        {evento.escalao?.condicoes && <Linha rotulo="Condicoes" valor={evento.escalao.condicoes} />}
        {evento.deslocacao_descricao && <Linha rotulo="Deslocacao" valor={evento.deslocacao_descricao} />}
      </Bloco>

      <Bloco titulo="Tecnico e material">
        <Linha rotulo="Tecnico" valor={evento.tecnico?.nome} />
        <Linha rotulo="Disponibilidade" valor={DISPONIBILIDADE_TECNICO[evento.disponibilidade_tecnico]} />
        {evento.material.length > 0 && <Linha rotulo="Material" valor={evento.material.join(', ')} />}
      </Bloco>

      <Bloco titulo="Estado e pagamento">
        <Linha rotulo="Pagamento" valor={ESTADO_PAGAMENTO[evento.pago]} />
        {evento.data_proposta && <Linha rotulo="Data da proposta" valor={evento.data_proposta} />}
        {evento.data_aprovacao && <Linha rotulo="Data de aprovacao" valor={evento.data_aprovacao} />}
      </Bloco>

      {(evento.contactos_extra || evento.notas) && (
        <Bloco titulo="Notas">
          {evento.contactos_extra && <Linha rotulo="Contactos extra" valor={evento.contactos_extra} />}
          {evento.notas && <p style={{ color: 'var(--texto-suave)', lineHeight: 1.6, fontSize: 14 }}>{evento.notas}</p>}
        </Bloco>
      )}

      {/* Apagar so para o admin. */}
      {sessao.ehAdmin && (
        <div style={{ marginTop: 8 }}>
          <BotaoApagar acao={apagar} confirmacao={`Apagar o evento "${evento.evento}"? Esta accao nao se pode desfazer.`} etiqueta="Apagar evento" />
        </div>
      )}
    </section>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ fontSize: 13, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>{titulo}</h2>
      {children}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  if (!valor) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
      <span style={{ color: 'var(--texto-suave)', flexShrink: 0 }}>{rotulo}</span>
      <span style={{ textAlign: 'right' }}>{valor}</span>
    </div>
  );
}
