'use client';

import type { Equipa } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

export default function FormularioMembro({ acao, membro }: { acao: Acao; membro?: Equipa }) {
  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Nome" obrigatorio>
        <input name="nome" required className="campo" defaultValue={membro?.nome ?? ''} />
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Papel">
          <select name="papel" className="campo" defaultValue={membro?.papel ?? 'membro'}>
            <option value="membro">Membro</option>
            <option value="tecnico">Tecnico</option>
          </select>
        </Campo>
        <Campo etiqueta="Funcao ou instrumento">
          <input name="funcao_instrumento" className="campo" defaultValue={membro?.funcao_instrumento ?? ''} placeholder="Voz, guitarra, som..." />
        </Campo>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Telefone">
          <input name="telefone" type="tel" inputMode="tel" className="campo" defaultValue={membro?.telefone ?? ''} />
        </Campo>
        <Campo etiqueta="Email">
          <input name="email" type="email" inputMode="email" className="campo" defaultValue={membro?.email ?? ''} />
        </Campo>
      </div>

      <Campo etiqueta="Foto (endereco da imagem)">
        <input name="foto_url" className="campo" defaultValue={membro?.foto_url ?? ''} placeholder="https://..." />
      </Campo>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input type="checkbox" name="ativo" defaultChecked={membro?.ativo ?? true} style={{ width: 20, height: 20, accentColor: 'var(--acento)' }} />
        <span style={{ fontSize: 15 }}>Ativo na banda</span>
      </label>

      <button type="submit" className="botao">{membro ? 'Guardar alteracoes' : 'Adicionar elemento'}</button>
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
