import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { listarEquipa } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import type { Equipa } from '@/lib/tipos';

export default async function PaginaEquipa() {
  const [equipa, sessao] = await Promise.all([listarEquipa(), obterSessao()]);
  const membros = equipa.filter((e) => e.papel === 'membro');
  const tecnicos = equipa.filter((e) => e.papel === 'tecnico');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Equipa</h1>
        {sessao.ehAdmin && <Link href="/equipa/novo" className="botao" style={{ width: 'auto' }}>Novo</Link>}
      </div>

      {equipa.length === 0 && (
        <div className="cartao" style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>
          <p>Sem elementos. {sessao.ehAdmin ? 'Toca em Novo para adicionar.' : 'O admin ainda nao adicionou ninguem.'}</p>
        </div>
      )}

      {membros.length > 0 && <Grupo titulo="Banda" elementos={membros} podeEditar={sessao.ehAdmin} />}
      {tecnicos.length > 0 && <Grupo titulo="Tecnicos de som" elementos={tecnicos} podeEditar={sessao.ehAdmin} />}
    </section>
  );
}

function Grupo({ titulo, elementos, podeEditar }: { titulo: string; elementos: Equipa[]; podeEditar: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ fontSize: 14, color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>{titulo}</h2>
      {elementos.map((e) => {
        const conteudo = (
          <>
            <Avatar nome={e.nome} fotoUrl={e.foto_url} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
              <strong style={{ fontSize: 16 }}>{e.nome}{!e.ativo && <span style={{ color: 'var(--texto-fraco)', fontWeight: 400 }}> (inativo)</span>}</strong>
              <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                {[e.funcao_instrumento, e.telefone].filter(Boolean).join('  |  ')}
              </span>
            </span>
          </>
        );
        const estilo = { display: 'flex', alignItems: 'center', gap: 14 } as const;
        return podeEditar ? (
          <Link key={e.id} href={`/equipa/${e.id}/editar`} className="cartao" style={estilo}>{conteudo}</Link>
        ) : (
          <div key={e.id} className="cartao" style={estilo}>{conteudo}</div>
        );
      })}
    </div>
  );
}
