import Link from 'next/link';
import { notFound } from 'next/navigation';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import BotaoPorDefeito from '@/components/cifras/BotaoPorDefeito';
import { obterMusica, listarCifras, obterPreferenciasCifra, escolherCifraPreferida } from '@/lib/consultas';

export const dynamic = 'force-dynamic';

export default async function PaginaMusica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [musica, cifras, pref] = await Promise.all([
    obterMusica(id),
    listarCifras(id),
    obterPreferenciasCifra(),
  ]);
  if (!musica) notFound();

  // A versao que ESTE membro vai ver no palco (etiqueta do instrumento, senao a
  // geral, senao a primeira). Serve para marcar claramente qual e a "minha".
  const minha = escolherCifraPreferida(cifras, pref.tag);

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
          <h2 className="rotulo-seccao">Versoes ({cifras.length})</h2>
          <Link href={`/repertorio/${id}/cifras/nova`} className="botao" style={{ width: 'auto' }}>Nova versao</Link>
        </div>

        {cifras.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.5 }}>
            A <strong style={{ color: 'var(--acento)' }}>Geral</strong> e a que todos veem por defeito. As versoes com
            etiqueta de instrumento (BAIXO, TECLAS...) so aparecem a quem escolheu esse instrumento em
            <Link href="/preferencias" style={{ color: 'var(--acento)' }}> As minhas cifras</Link>.
          </p>
        )}

        {cifras.length === 0 ? (
          <div className="cartao" style={{ color: 'var(--texto-suave)', textAlign: 'center' }}>
            <p style={{ lineHeight: 1.6 }}>Sem cifras. Toca em <strong style={{ color: 'var(--texto)' }}>Nova versao</strong> para colar a primeira.</p>
          </div>
        ) : (
          cifras.map((c) => (
            <div key={c.id} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderColor: c.id === minha?.id ? 'var(--acento)' : undefined }}>
              <Link href={`/repertorio/${id}/cifras/${c.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 15 }}>{c.nome_versao}</strong>
                  {c.por_defeito && <Etiqueta texto="Geral" forte />}
                  {c.id === minha?.id && <Etiqueta texto="A que tu ves" />}
                </span>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {[c.tom && `tom ${c.tom}`, c.numero_som && `som ${c.numero_som}`].filter(Boolean).join('  |  ') || 'sem tom definido'}
                </span>
              </Link>
              {!c.por_defeito && <BotaoPorDefeito musicaId={id} cifraId={c.id} />}
            </div>
          ))
        )}
      </div>

      {/* Pre-visualizacao da versao que este membro ve */}
      {minha?.conteudo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="rotulo-seccao">Como tu ves: {minha.nome_versao}</h2>
          <div className="cartao" style={{ overflowX: 'auto' }}>
            <CifraFormatada conteudo={minha.conteudo} esconderAcordes={pref.esconderAcordes} soTonica={pref.soTonica} />
          </div>
        </div>
      )}
    </section>
  );
}

// Etiqueta pequena em pilula, para marcar a versao geral e a do proprio.
function Etiqueta({ texto, forte }: { texto: string; forte?: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 999,
        color: forte ? 'var(--acento-forte)' : 'var(--texto-suave)',
        background: forte ? 'var(--acento-suave)' : 'var(--superficie-2)',
        border: `1px solid ${forte ? 'var(--acento)' : 'var(--linha)'}`,
      }}
    >
      {texto}
    </span>
  );
}
