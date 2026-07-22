import Link from 'next/link';
import { notFound } from 'next/navigation';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import {
  obterMusica,
  listarCifras,
  obterPreferenciasCifra,
  obterEscolhasCifra,
  escolherCifraPreferida,
} from '@/lib/consultas';
import { escolherVersaoCifra, limparEscolhaVersao } from './cifras/acoes';

export const dynamic = 'force-dynamic';

export default async function PaginaMusica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [musica, cifras, pref, escolhas] = await Promise.all([
    obterMusica(id),
    listarCifras(id),
    obterPreferenciasCifra(),
    obterEscolhasCifra([id]),
  ]);
  if (!musica) notFound();

  // Escolha manual desta musica (se houver) e a versao que este membro ve:
  // manual > instrumento > base > primeira.
  const escolhaId = escolhas[id] ?? null;
  const minha = escolherCifraPreferida(cifras, pref.tag, escolhaId);

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

      {/* Versoes: cada um escolhe a que quer ver */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="rotulo-seccao">Versoes ({cifras.length})</h2>
          <Link href={`/repertorio/${id}/cifras/nova`} className="botao" style={{ width: 'auto' }}>Nova versao</Link>
        </div>

        {cifras.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.5 }}>
            Toca em <strong style={{ color: 'var(--texto)' }}>Ver esta</strong> para escolheres a versao que queres ver no palco.
            {escolhaId ? (
              <> A tua escolha manda. </>
            ) : (
              <> Sem escolher, aparece a versao do teu instrumento (definido em <Link href="/preferencias" style={{ color: 'var(--acento)' }}>As minhas cifras</Link>). </>
            )}
          </p>
        )}

        {cifras.length === 0 ? (
          <div className="cartao" style={{ color: 'var(--texto-suave)', textAlign: 'center' }}>
            <p style={{ lineHeight: 1.6 }}>Sem cifras. Toca em <strong style={{ color: 'var(--texto)' }}>Nova versao</strong> para colar a primeira.</p>
          </div>
        ) : (
          cifras.map((c) => {
            const eMinha = c.id === minha?.id;
            return (
              <div
                key={c.id}
                className="cartao"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  borderColor: eMinha ? 'var(--acento)' : undefined,
                  background: eMinha ? 'var(--acento-suave)' : undefined,
                }}
              >
                <Link href={`/repertorio/${id}/cifras/${c.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 15 }}>{c.nome_versao}</strong>
                    {eMinha && <Etiqueta texto="A que tu ves" />}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                    {[c.tom && `tom ${c.tom}`, c.numero_som && `som ${c.numero_som}`].filter(Boolean).join('  |  ') || 'sem tom definido'}
                  </span>
                </Link>

                {/* Escolher esta versao (acao de servidor, guardada por membro). */}
                <form action={escolherVersaoCifra.bind(null, id, c.id)}>
                  <button
                    type="submit"
                    className={eMinha ? 'botao' : 'botao botao-secundario'}
                    style={{ width: 'auto', minHeight: 40, fontSize: 13, whiteSpace: 'nowrap' }}
                  >
                    {eMinha ? 'A ver ✓' : 'Ver esta'}
                  </button>
                </form>
              </div>
            );
          })
        )}

        {/* Voltar ao automatico (so aparece se houver escolha manual). */}
        {escolhaId && (
          <form action={limparEscolhaVersao.bind(null, id)}>
            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--texto-suave)', fontSize: 13, textDecoration: 'underline', padding: '4px 0' }}>
              Voltar ao automatico (pelo instrumento)
            </button>
          </form>
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

// Etiqueta pequena em pilula, para assinalar a versao que o proprio ve.
function Etiqueta({ texto }: { texto: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 999,
        color: 'var(--acento-forte)',
        background: 'var(--fundo)',
        border: '1px solid var(--acento)',
      }}
    >
      {texto}
    </span>
  );
}
