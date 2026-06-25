'use client';

import type { Repertorio } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

const DECADAS = ['60', '70', '80', '90', '2000'];

export default function FormularioMusica({ acao, musica }: { acao: Acao; musica?: Repertorio }) {
  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Musica" obrigatorio>
        <input name="musica" required className="campo" defaultValue={musica?.musica ?? ''} />
      </Campo>

      <Campo etiqueta="Artista original">
        <input name="artista_original" className="campo" defaultValue={musica?.artista_original ?? ''} placeholder="Xutos & Pontapes, GNR..." />
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Decada">
          <select name="decada" className="campo" defaultValue={musica?.decada ?? ''}>
            <option value="">--</option>
            {DECADAS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Duracao">
          <input name="duracao" className="campo" defaultValue={musica?.duracao ?? ''} placeholder="3:45" />
        </Campo>
        <Campo etiqueta="Tom">
          <input name="tom" className="campo" defaultValue={musica?.tom ?? ''} placeholder="Mi" />
        </Campo>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input type="checkbox" name="ativo" defaultChecked={musica?.ativo ?? true} style={{ width: 20, height: 20, accentColor: 'var(--acento)' }} />
        <span style={{ fontSize: 15 }}>Ativa no alinhamento</span>
      </label>

      <Campo etiqueta="Notas">
        <textarea name="notas" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={musica?.notas ?? ''} />
      </Campo>

      <button type="submit" className="botao">{musica ? 'Guardar alteracoes' : 'Adicionar musica'}</button>
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
