import type { Setlist } from '@/lib/tipos';

type Acao = (formData: FormData) => void | Promise<void>;

// Formulario de dados da setlist (nome, descricao, por defeito).
export default function FormularioSetlist({ acao, setlist }: { acao: Acao; setlist?: Setlist }) {
  return (
    <form action={acao} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Nome <span style={{ color: 'var(--acento)' }}>*</span></span>
        <input name="nome" required className="campo" defaultValue={setlist?.nome ?? ''} placeholder="Setlist Verao 2026, Setlist Bares 2026..." />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Descricao</span>
        <textarea name="descricao" className="campo" rows={2} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={setlist?.descricao ?? ''} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input type="checkbox" name="por_defeito" defaultChecked={setlist?.por_defeito ?? false} style={{ width: 20, height: 20, accentColor: 'var(--acento)' }} />
        <span style={{ fontSize: 15 }}>Setlist por defeito (pre-selecionada nos eventos novos)</span>
      </label>
      <button type="submit" className="botao">{setlist ? 'Guardar' : 'Criar setlist'}</button>
    </form>
  );
}
