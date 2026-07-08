'use client';

import { useState, useTransition } from 'react';
import { verificarConflitoData } from '@/app/(app)/eventos/acoes';
import { deIsoParaLocal, euros } from '@/lib/formatar';
import {
  ESTADO_EVENTO,
  DISPONIBILIDADE_TECNICO,
  ESTADO_PAGAMENTO,
  type Evento,
  type Contacto,
  type Equipa,
  type Escalao,
  type Setlist,
} from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

interface Props {
  acao: Acao;
  evento?: Evento;
  contactos: Pick<Contacto, 'id' | 'nome' | 'entidade'>[];
  membros: Pick<Equipa, 'id' | 'nome'>[];
  tecnicos: Pick<Equipa, 'id' | 'nome'>[];
  escaloes: Pick<Escalao, 'id' | 'nome' | 'valor_base'>[];
  setlists: Pick<Setlist, 'id' | 'nome' | 'por_defeito'>[];
  setlistPorDefeitoId: string | null;
}

export default function FormularioEvento({ acao, evento, contactos, membros, tecnicos, escaloes, setlists, setlistPorDefeitoId }: Props) {
  // Num evento novo, pre-seleciona a setlist por defeito, deixando trocar.
  const setlistInicial = evento ? evento.setlist_id ?? '' : setlistPorDefeitoId ?? '';
  // Estado controlado apenas para o que precisa de reagir ao vivo.
  const [valorBase, setValorBase] = useState<string>(String(evento?.valor_base ?? ''));
  const [deslocacao, setDeslocacao] = useState<string>(String(evento?.deslocacao_valor ?? ''));
  const [conflito, setConflito] = useState<{ confirmados: any[]; pendentes: any[] } | null>(null);
  const [aGuardar, iniciarTransicao] = useTransition();

  const total = (Number(valorBase || 0) + Number(deslocacao || 0)) || 0;

  // Ao escolher um escalao, sugere o seu valor base (continua editavel).
  function aoEscolherEscalao(id: string) {
    const esc = escaloes.find((e) => e.id === id);
    if (esc) setValorBase(String(esc.valor_base));
  }

  // Ao mudar a data, verifica conflitos com outros eventos no mesmo dia.
  function aoMudarData(valor: string) {
    if (!valor) {
      setConflito(null);
      return;
    }
    const iso = new Date(valor).toISOString();
    iniciarTransicao(async () => {
      const resultado = await verificarConflitoData(iso, evento?.id);
      const ha = resultado.confirmados.length > 0 || resultado.pendentes.length > 0;
      setConflito(ha ? resultado : null);
    });
  }

  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Nome do evento" obrigatorio>
        <input name="evento" required className="campo" defaultValue={evento?.evento ?? ''} placeholder="Festa da vila, encontro motard..." />
      </Campo>

      <Campo etiqueta="Estado">
        <select name="estado" className="campo" defaultValue={evento?.estado ?? 'orcamentado'}>
          {Object.entries(ESTADO_EVENTO).map(([valor, { rotulo }]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Data e hora">
        <input
          type="datetime-local"
          name="data"
          className="campo"
          defaultValue={deIsoParaLocal(evento?.data)}
          onChange={(e) => aoMudarData(e.target.value)}
        />
        {aGuardar && <PistaSubtil>a verificar a agenda...</PistaSubtil>}
        {conflito && <AvisoConflito conflito={conflito} />}
      </Campo>

      <DuasColunas>
        <Campo etiqueta="Local">
          <input name="local" className="campo" defaultValue={evento?.local ?? ''} placeholder="Recinto, sala..." />
        </Campo>
        <Campo etiqueta="Concelho">
          <input name="concelho" className="campo" defaultValue={evento?.concelho ?? ''} placeholder="Leiria..." />
        </Campo>
      </DuasColunas>

      <Campo etiqueta="Contratante">
        <select name="contratante_id" className="campo" defaultValue={evento?.contratante_id ?? ''}>
          <option value="">Sem contratante</option>
          {contactos.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}{c.entidade ? ` (${c.entidade})` : ''}</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Quem tratou">
        <select name="quem_tratou_id" className="campo" defaultValue={evento?.quem_tratou_id ?? ''}>
          <option value="">Ninguem ainda</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Escalao">
        <select
          name="escalao_id"
          className="campo"
          defaultValue={evento?.escalao_id ?? ''}
          onChange={(e) => aoEscolherEscalao(e.target.value)}
        >
          <option value="">Sem escalao</option>
          {escaloes.map((esc) => (
            <option key={esc.id} value={esc.id}>{esc.nome} ({euros(esc.valor_base)})</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Valor base (EUR)">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          name="valor_base"
          className="campo"
          value={valorBase}
          onChange={(e) => setValorBase(e.target.value)}
          placeholder="0"
        />
      </Campo>

      <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--superficie-2)' }}>
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deslocacao</span>
        <DuasColunas>
          <Campo etiqueta="Valor (EUR)">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              name="deslocacao_valor"
              className="campo"
              value={deslocacao}
              onChange={(e) => setDeslocacao(e.target.value)}
              placeholder="0"
            />
          </Campo>
          <Campo etiqueta="Descricao">
            <input name="deslocacao_descricao" className="campo" defaultValue={evento?.deslocacao_descricao ?? ''} placeholder="120 km ida e volta" />
          </Campo>
        </DuasColunas>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--linha)', paddingTop: 12 }}>
          <span style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Total automatico</span>
          <strong className="titulo" style={{ fontSize: 26, color: 'var(--acento)' }}>{euros(total)}</strong>
        </div>
      </div>

      <DuasColunas>
        <Campo etiqueta="Tecnico de som">
          <select name="tecnico_id" className="campo" defaultValue={evento?.tecnico_id ?? ''}>
            <option value="">Sem tecnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Disponibilidade">
          <select name="disponibilidade_tecnico" className="campo" defaultValue={evento?.disponibilidade_tecnico ?? 'por_confirmar'}>
            {Object.entries(DISPONIBILIDADE_TECNICO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </Campo>
      </DuasColunas>

      <Campo etiqueta="Setlist">
        <select name="setlist_id" className="campo" defaultValue={setlistInicial}>
          <option value="">Sem setlist</option>
          {setlists.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}{s.por_defeito ? ' (por defeito)' : ''}</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Material (um por linha)">
        <textarea name="material" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={(evento?.material ?? []).join('\n')} placeholder={'PA\nMonitores\nBackline'} />
      </Campo>

      <DuasColunas>
        <Campo etiqueta="Data da proposta">
          <input type="date" name="data_proposta" className="campo" defaultValue={evento?.data_proposta ?? ''} />
        </Campo>
        <Campo etiqueta="Pagamento">
          <select name="pago" className="campo" defaultValue={evento?.pago ?? 'por_receber'}>
            {Object.entries(ESTADO_PAGAMENTO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </Campo>
      </DuasColunas>

      {/* Mantem a data de aprovacao ja existente; a accao preenche-a ao confirmar. */}
      <input type="hidden" name="data_aprovacao" defaultValue={evento?.data_aprovacao ?? ''} />

      <Campo etiqueta="Contactos extra">
        <input name="contactos_extra" className="campo" defaultValue={evento?.contactos_extra ?? ''} placeholder="Outro responsavel, telefone..." />
      </Campo>

      <Campo etiqueta="Notas">
        <textarea name="notas" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={evento?.notas ?? ''} placeholder="Detalhes, condicoes, lembretes..." />
      </Campo>

      <button type="submit" className="botao" disabled={aGuardar}>
        {evento ? 'Guardar alteracoes' : 'Criar evento'}
      </button>
    </form>
  );
}

// --- Subcomponentes de apresentacao ---

function Campo({ etiqueta, obrigatorio, children }: { etiqueta: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>
        {etiqueta}{obrigatorio && <span style={{ color: 'var(--acento)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function DuasColunas({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}

function PistaSubtil({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, color: 'var(--texto-fraco)' }}>{children}</span>;
}

function AvisoConflito({ conflito }: { conflito: { confirmados: any[]; pendentes: any[] } }) {
  const { confirmados, pendentes } = conflito;
  return (
    <div
      style={{
        borderRadius: 'var(--raio-pequeno)',
        border: '1px solid var(--estado-orcamentado)',
        background: 'rgba(216, 155, 44, 0.1)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginTop: 4,
      }}
    >
      <strong style={{ color: 'var(--estado-orcamentado)', fontSize: 13 }}>Atencao: ja ha algo neste dia</strong>
      {confirmados.map((e) => (
        <span key={e.id} style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--estado-confirmado)', fontWeight: 700 }}>Confirmado:</span> {e.evento}
          {e.local ? `, ${e.local}` : ''}
        </span>
      ))}
      {pendentes.map((e) => (
        <span key={e.id} style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--estado-orcamentado)', fontWeight: 700 }}>Pendente:</span> {e.evento}
          {e.local ? `, ${e.local}` : ''}
        </span>
      ))}
    </div>
  );
}
