import Link from 'next/link';
import { notFound } from 'next/navigation';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import BotaoPorDefeito from '@/components/cifras/BotaoPorDefeito';
import { obterMusica, listarCifras } from '@/lib/consultas';

export default async function PaginaMusica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [musica, cifras] = await Promise.all([obterMusica(id), listarCifras(id)]);
  if (!musica) notFound();
  const porDefeito = cifras.find((c) => c.por_defeito) ?? cifras[0];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/repertorio" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
        <Link href={`/repertorio/${id}/editar`} className="botao botao-secundario" style={{ width: 'auto' }}>Editar musica</Link>
      </div>

      <div>
        <h1 style={{ fontSize: 28 }}>{musica.musica}</h1>
        <span style={{ fontSize: 14, color: 'var(--texto-suave)' }}>
          {[musica.artista_original, musica.decada && `anos ${musica.decada}`, musica.tom && `tom ${musica.tom}`, musica.duracao].filter(Boolean).join('  |  ')}
        </span>
      </div>

      {/* Cifras */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="rotulo-seccao">Cifras ({cifras.length})</h2>
          <Link href={`/repertorio/${id}/cifras/nova`} className="botao" style={{ width: 'auto' }}>Nova cifra</Link>
        </div>

        {cifras.length === 0 ? (
          <div className="cartao" style={{ color: 'var(--texto-suave)', textAlign: 'center' }}>
            <p style={{ lineHeight: 1.6 }}>Sem cifras. Toca em <strong style={{ color: 'var(--texto)' }}>Nova cifra</strong> para colar a primeira.</p>
          </div>
        ) : (
          cifras.map((c) => (
            <div key={c.id} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Link href={`/repertorio/${id}/cifras/${c.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <strong style={{ fontSize: 15 }}>
                  {c.nome_versao}
                  {c.por_defeito && <span style={{ color: 'var(--acento)', fontSize: 12, fontWeight: 400 }}>  por defeito</span>}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {[c.tom && `tom ${c.tom}`, c.numero_som && `som ${c.numero_som}`].filter(Boolean).join('  |  ') || 'sem tom definido'}
                </span>
              </Link>
              {!c.por_defeito && <BotaoPorDefeito musicaId={id} cifraId={c.id} />}
            </div>
          ))
        )}
      </div>

      {/* Pre-visualizacao da cifra por defeito */}
      {porDefeito?.conteudo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="rotulo-seccao">{porDefeito.nome_versao}</h2>
          <div className="cartao" style={{ overflowX: 'auto' }}>
            <CifraFormatada conteudo={porDefeito.conteudo} />
          </div>
        </div>
      )}
    </section>
  );
}
