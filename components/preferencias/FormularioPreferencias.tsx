'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import { guardarPreferenciasCifra, type EstadoPreferencias } from '@/app/(app)/preferencias/acoes';
import { TAGS_CIFRA } from '@/lib/tipos';
import type { PreferenciasCifra } from '@/lib/consultas';

// Cifra de exemplo, so para a pre-visualizacao das opcoes.
const EXEMPLO = `Refrao
G        D/F#     Em       C
A minha casa fica ali ao pe do rio
G        D        C
E o vento traz cheiro a mar`;

export default function FormularioPreferencias({ preferencias }: { preferencias: PreferenciasCifra }) {
  const [estado, formAction] = useFormState<EstadoPreferencias, FormData>(guardarPreferenciasCifra, null);

  // Estado controlado so para a pre-visualizacao reagir ao vivo.
  const [tag, setTag] = useState(preferencias.tag ?? '');
  const [esconderAcordes, setEsconderAcordes] = useState(preferencias.esconderAcordes);
  const [soTonica, setSoTonica] = useState(preferencias.soTonica);
  const [tamanho, setTamanho] = useState(preferencias.tamanho);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>O meu instrumento</span>
        <input
          name="cifra_tag"
          className="campo"
          list="tags-cifra"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="BAIXO, TECLAS, VOZ..."
        />
        <datalist id="tags-cifra">
          {TAGS_CIFRA.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <span style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.5 }}>
          No modo palco, cada musica abre logo na versao da cifra com esta etiqueta (por exemplo "BAIXO").
          Se essa versao nao existir, abre na versao por defeito.
        </span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input
          type="checkbox"
          name="cifra_esconder_acordes"
          checked={esconderAcordes}
          onChange={(e) => setEsconderAcordes(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: 'var(--acento)' }}
        />
        <span style={{ fontSize: 15 }}>Esconder acordes (ver so a letra)</span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input
          type="checkbox"
          name="cifra_so_tonica"
          checked={soTonica}
          onChange={(e) => setSoTonica(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: 'var(--acento)' }}
        />
        <span style={{ fontSize: 15 }}>Ver so a tonica (nota do baixo)</span>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>
          Tamanho do texto no palco: <strong style={{ color: 'var(--texto)' }}>{tamanho}</strong>
        </span>
        <input
          type="range"
          name="cifra_tamanho"
          min={12}
          max={48}
          step={1}
          value={tamanho}
          onChange={(e) => setTamanho(Number(e.target.value))}
          style={{ accentColor: 'var(--acento)' }}
        />
      </label>

      {/* Pre-visualizacao com as opcoes atuais */}
      <div>
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pre-visualizacao</span>
        <div className="cartao" style={{ marginTop: 6, overflowX: 'auto' }}>
          <CifraFormatada conteudo={EXEMPLO} tamanho={tamanho} esconderAcordes={esconderAcordes} soTonica={soTonica} />
        </div>
      </div>

      {estado?.ok && <p style={{ fontSize: 13, color: 'var(--estado-confirmado)' }}>Preferencias guardadas.</p>}
      {estado?.erro && <p style={{ fontSize: 13, color: 'var(--acento-forte)', lineHeight: 1.5 }}>{estado.erro}</p>}

      <button type="submit" className="botao">Guardar preferencias</button>
    </form>
  );
}
