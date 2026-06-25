import type { Escalao } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

// Formulario de um escalao (configuracao, so admin). Server component simples.
export default function FormularioEscalao({ acao, escalao }: { acao: Acao; escalao?: Escalao }) {
  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Nome" obrigatorio>
        <input name="nome" required className="campo" defaultValue={escalao?.nome ?? ''} placeholder="Camara ou Junta" />
      </Campo>
      <Campo etiqueta="Valor base (EUR)" obrigatorio>
        <input type="number" inputMode="decimal" step="0.01" name="valor_base" required className="campo" defaultValue={escalao?.valor_base ?? ''} placeholder="0" />
      </Campo>
      <Campo etiqueta="Condicoes">
        <textarea name="condicoes" className="campo" rows={3} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={escalao?.condicoes ?? ''} />
      </Campo>
      <button type="submit" className="botao">{escalao ? 'Guardar alteracoes' : 'Criar escalao'}</button>
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
