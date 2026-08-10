import Link from 'next/link';
import Avatar from '@/components/Avatar';
import EstadoVazio from '@/components/EstadoVazio';
import { AvisoAdmin } from '@/components/SoAdmin';
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
        {sessao.ehAdmin && (
          <Link
            href="/equipa/novo"
            className="botao"
            style={{ width: 'auto', background: 'var(--admin)', boxShadow: 'none' }}
          >
            Novo
          </Link>
        )}
      </div>

      {sessao.ehAdmin && (
        <AvisoAdmin>
          <strong style={{ color: 'var(--admin-forte)' }}>So admin.</strong> Criar, editar e apagar elementos da equipa
          e reservado a ti. Os outros elementos veem esta lista, mas nao a conseguem alterar.
        </AvisoAdmin>
      )}

      {equipa.length === 0 && (
        <EstadoVazio
          titulo="Sem elementos"
          texto="A equipa junta os musicos e os dois tecnicos de som. Serve para atribuir quem tratou de cada evento e quem passou recibo."
          accaoHref={sessao.ehAdmin ? '/equipa/novo' : undefined}
          accaoEtiqueta={sessao.ehAdmin ? 'Adicionar elemento' : undefined}
        />
      )}

      {membros.length > 0 && <Grupo titulo="Banda" elementos={membros} podeEditar={sessao.ehAdmin} />}
      {tecnicos.length > 0 && <Grupo titulo="Tecnicos de som" elementos={tecnicos} podeEditar={sessao.ehAdmin} />}
    </section>
  );
}

function Grupo({ titulo, elementos, podeEditar }: { titulo: string; elementos: Equipa[]; podeEditar: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 className="rotulo-seccao">{titulo}</h2>
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
