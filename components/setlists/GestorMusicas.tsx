'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { adicionarMusica, removerItem, guardarOrdem, atualizarItem } from '@/app/(app)/setlists/acoes';
import { mostrarToast } from '@/lib/toast';
import type { ItemSetlist } from '@/lib/consultas';
import type { Cifra } from '@/lib/tipos';

interface Props {
  setlistId: string;
  itens: ItemSetlist[];
  cifrasPorMusica: Record<string, Pick<Cifra, 'id' | 'nome_versao' | 'por_defeito'>[]>;
  musicasDisponiveis: { id: string; musica: string; artista_original: string | null }[];
}

export default function GestorMusicas({ setlistId, itens, cifrasPorMusica, musicasDisponiveis }: Props) {
  const [ordem, setOrdem] = useState<ItemSetlist[]>(itens);
  const [aArrastar, setAArrastar] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // Sincroniza quando se adiciona ou remove uma musica (muda o conjunto de ids).
  const assinatura = itens.map((i) => i.id).join(',');
  useEffect(() => {
    setOrdem(itens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura]);

  function persistirOrdem(novo: ItemSetlist[]) {
    iniciar(() => guardarOrdem(setlistId, novo.map((i) => i.id)));
  }

  function mover(de: number, para: number) {
    if (para < 0 || para >= ordem.length || de === para) return;
    const novo = [...ordem];
    const [item] = novo.splice(de, 1);
    novo.splice(para, 0, item);
    setOrdem(novo);
    return novo;
  }

  // --- Arrastar com o dedo (pointer events) ---
  function aoAgarrar(e: React.PointerEvent, index: number) {
    e.preventDefault();
    setAArrastar(index);
    // Vibracao curta ao agarrar, para dar retorno ao toque.
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function aoMover(e: React.PointerEvent) {
    if (aArrastar === null) return;
    const y = e.clientY;
    // Descobre sobre que linha esta o dedo.
    let destino = aArrastar;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (y > r.top && y < r.bottom) destino = i;
    });
    if (destino !== aArrastar) {
      mover(aArrastar, destino);
      setAArrastar(destino);
    }
  }

  function aoLargar() {
    if (aArrastar !== null) persistirOrdem(ordem);
    setAArrastar(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Adicionar musica */}
      <AdicionarMusica setlistId={setlistId} musicas={musicasDisponiveis} />

      {ordem.length === 0 ? (
        <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Setlist vazia. Adiciona musicas do repertorio acima.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onPointerMove={aoMover} onPointerUp={aoLargar} onPointerCancel={aoLargar}>
          {ordem.map((item, index) => {
            const cifras = item.musica ? cifrasPorMusica[item.musica.id] ?? [] : [];
            const aberto = expandido === item.id;
            return (
              <div
                key={item.id}
                ref={(el) => { refs.current[index] = el; }}
                className="cartao"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 12,
                  opacity: aArrastar === index ? 0.6 : 1,
                  borderColor: aArrastar === index ? 'var(--acento)' : 'var(--linha)',
                  touchAction: aArrastar !== null ? 'none' : 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Pega para arrastar */}
                  <button
                    type="button"
                    aria-label="Arrastar para reordenar"
                    onPointerDown={(e) => aoAgarrar(e, index)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--texto-fraco)', cursor: 'grab', padding: 6, touchAction: 'none' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" /></svg>
                  </button>

                  <span style={{ color: 'var(--texto-fraco)', fontSize: 12, width: 20, textAlign: 'right' }}>{index + 1}</span>

                  <button type="button" onClick={() => setExpandido(aberto ? null : item.id)} style={{ flex: 1, textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--texto)', padding: 0 }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontSize: 15 }}>{item.musica?.musica ?? 'Musica removida'}</strong>
                      <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                        {item.musica?.artista_original ?? ''}
                        {item.nota_rapida ? `  |  ${item.nota_rapida}` : ''}
                      </span>
                    </span>
                  </button>

                  {/* Setas de reserva, garantidas no telemovel */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button type="button" aria-label="Subir" onClick={() => { const n = mover(index, index - 1); if (n) persistirOrdem(n); }} style={setaEstilo}>▲</button>
                    <button type="button" aria-label="Descer" onClick={() => { const n = mover(index, index + 1); if (n) persistirOrdem(n); }} style={setaEstilo}>▼</button>
                  </div>
                </div>

                {aberto && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--linha)', paddingTop: 10 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>Versao da cifra</span>
                      <select
                        className="campo"
                        defaultValue={item.cifra_id ?? ''}
                        onChange={(e) => iniciar(() => atualizarItem(setlistId, item.id, { cifra_id: e.target.value || null }))}
                      >
                        <option value="">Cifra por defeito</option>
                        {cifras.map((c) => (
                          <option key={c.id} value={c.id}>{c.nome_versao}{c.por_defeito ? ' (por defeito)' : ''}</option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>Nota rapida</span>
                      <input
                        className="campo"
                        defaultValue={item.nota_rapida ?? ''}
                        placeholder="Entra a seguir ao discurso..."
                        onBlur={(e) => iniciar(() => atualizarItem(setlistId, item.id, { nota_rapida: e.target.value }))}
                      />
                    </label>
                    <button type="button" className="botao botao-secundario" style={{ width: 'auto', color: 'var(--estado-recusado)', borderColor: 'var(--estado-recusado)' }} onClick={() => iniciar(async () => { await removerItem(setlistId, item.id); mostrarToast('ok', 'Musica removida da setlist'); })}>
                      Remover da setlist
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const setaEstilo: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--texto-suave)',
  fontSize: 11,
  lineHeight: 1,
  padding: '4px 6px',
  cursor: 'pointer',
};

function AdicionarMusica({ setlistId, musicas }: { setlistId: string; musicas: { id: string; musica: string; artista_original: string | null }[] }) {
  const [escolhida, setEscolhida] = useState('');
  const [, iniciar] = useTransition();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select className="campo" style={{ flex: 1 }} value={escolhida} onChange={(e) => setEscolhida(e.target.value)}>
        <option value="">Adicionar musica...</option>
        {musicas.map((m) => (
          <option key={m.id} value={m.id}>{m.musica}{m.artista_original ? ` (${m.artista_original})` : ''}</option>
        ))}
      </select>
      <button
        type="button"
        className="botao"
        style={{ width: 'auto' }}
        disabled={!escolhida}
        onClick={() => { if (escolhida) { iniciar(async () => { await adicionarMusica(setlistId, escolhida); mostrarToast('ok', 'Musica adicionada'); }); setEscolhida(''); } }}
      >
        Adicionar
      </button>
    </div>
  );
}
