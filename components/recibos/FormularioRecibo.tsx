'use client';

import { useState } from 'react';
import { euros } from '@/lib/formatar';
import type { Recibo } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

// Valor especial do menu de nomes: concerto que nao leva recibo. Ao escolher,
// a app regista o recibo com valor 0, sem musico e ja como passado, para o
// concerto sair de "Por passar" e ficar registado o motivo.
export const SEM_PAPEL = '__sem_papel__';

interface Props {
  acao: Acao;
  recibo?: Recibo;
  eventos: { id: string; evento: string; valor_total: number }[];
  membros: { id: string; nome: string }[];
  eventoInicial?: string;
  passadoInicial?: boolean;
}

export default function FormularioRecibo({ acao, recibo, eventos, membros, eventoInicial, passadoInicial }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);

  const [membro, setMembro] = useState(recibo?.membro_id ?? '');
  const [valor, setValor] = useState(recibo?.valor != null ? String(recibo.valor) : '');
  const [passado, setPassado] = useState(recibo?.passado ?? passadoInicial ?? false);
  const semPapel = membro === SEM_PAPEL;

  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Evento">
        <select name="evento_id" className="campo" defaultValue={recibo?.evento_id ?? eventoInicial ?? ''}>
          <option value="">Sem evento</option>
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>{e.evento} ({euros(e.valor_total)})</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Nome (quem passa)">
        <select name="membro_id" className="campo" value={membro} onChange={(e) => setMembro(e.target.value)}>
          <option value="">Sem membro</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
          <option value={SEM_PAPEL}>Sem papel (nao leva recibo)</option>
        </select>
      </Campo>

      {semPapel && (
        <p style={{ marginTop: -8, fontSize: 13, color: 'var(--texto-suave)', lineHeight: 1.6 }}>
          Este concerto fica registado como <strong>sem recibo</strong> (valor 0) e sai da lista Por passar.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Valor (EUR)" obrigatorio={!semPapel}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            name="valor"
            required={!semPapel}
            readOnly={semPapel}
            className="campo"
            value={semPapel ? '0' : valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0"
            style={semPapel ? { opacity: 0.6 } : undefined}
          />
        </Campo>
        <Campo etiqueta="Data">
          <input type="date" name="data" className="campo" defaultValue={recibo?.data ?? hoje} />
        </Campo>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)', opacity: semPapel ? 0.6 : 1 }}>
        <input
          type="checkbox"
          name="passado"
          checked={semPapel ? true : passado}
          disabled={semPapel}
          onChange={(e) => setPassado(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: 'var(--acento)' }}
        />
        <span style={{ fontSize: 15 }}>Recibo ja passado</span>
      </label>

      <button type="submit" className="botao">{recibo ? 'Guardar alteracoes' : 'Criar recibo'}</button>
    </form>
  );
}

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
