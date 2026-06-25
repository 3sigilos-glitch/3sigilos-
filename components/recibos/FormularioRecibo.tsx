'use client';

import { euros } from '@/lib/formatar';
import type { Recibo } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

interface Props {
  acao: Acao;
  recibo?: Recibo;
  eventos: { id: string; evento: string; valor_total: number }[];
  membros: { id: string; nome: string }[];
}

export default function FormularioRecibo({ acao, recibo, eventos, membros }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Evento">
        <select name="evento_id" className="campo" defaultValue={recibo?.evento_id ?? ''}>
          <option value="">Sem evento</option>
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>{e.evento} ({euros(e.valor_total)})</option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Membro">
        <select name="membro_id" className="campo" defaultValue={recibo?.membro_id ?? ''}>
          <option value="">Sem membro</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Valor (EUR)" obrigatorio>
          <input type="number" inputMode="decimal" step="0.01" name="valor" required className="campo" defaultValue={recibo?.valor ?? ''} placeholder="0" />
        </Campo>
        <Campo etiqueta="Data">
          <input type="date" name="data" className="campo" defaultValue={recibo?.data ?? hoje} />
        </Campo>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input type="checkbox" name="passado" defaultChecked={recibo?.passado ?? false} style={{ width: 20, height: 20, accentColor: 'var(--acento)' }} />
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
