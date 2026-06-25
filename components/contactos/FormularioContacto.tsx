'use client';

import { TIPO_CONTACTO, type Contacto } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

export default function FormularioContacto({ acao, contacto }: { acao: Acao; contacto?: Contacto }) {
  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Nome" obrigatorio>
        <input name="nome" required className="campo" defaultValue={contacto?.nome ?? ''} placeholder="Nome do responsavel" />
      </Campo>

      <Campo etiqueta="Entidade">
        <input name="entidade" className="campo" defaultValue={contacto?.entidade ?? ''} placeholder="Camara de Leiria, Moto Clube..." />
      </Campo>

      <Campo etiqueta="Tipo">
        <select name="tipo" className="campo" defaultValue={contacto?.tipo ?? ''}>
          <option value="">Sem tipo</option>
          {Object.entries(TIPO_CONTACTO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Telefone">
          <input name="telefone" type="tel" inputMode="tel" className="campo" defaultValue={contacto?.telefone ?? ''} />
        </Campo>
        <Campo etiqueta="Concelho">
          <input name="concelho" className="campo" defaultValue={contacto?.concelho ?? ''} />
        </Campo>
      </div>

      <Campo etiqueta="Email">
        <input name="email" type="email" inputMode="email" className="campo" defaultValue={contacto?.email ?? ''} />
      </Campo>

      <Campo etiqueta="Notas">
        <textarea name="notas" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={contacto?.notas ?? ''} />
      </Campo>

      <button type="submit" className="botao">{contacto ? 'Guardar alteracoes' : 'Criar contacto'}</button>
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
