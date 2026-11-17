'use client';

import { useState } from 'react';
import { intervaloCurto, linkNovaIndisponibilidade, tituloIndisponibilidade, type MembroRef } from '@/lib/calendario';

// Marcar uma indisponibilidade: escolhe-se quem, os dias e o motivo, e a app
// abre o Google Calendar ja preenchido. A pessoa so confirma o calendario dos
// N'ASA e grava. A app nao guarda nada: le-a do calendario minutos depois.
export default function MarcarIndisponibilidade({
  equipa,
  membroInicial,
  calendarioId,
  hoje,
  abertoInicial = false,
}: {
  equipa: MembroRef[];
  membroInicial: string | null;
  calendarioId: string | null;
  hoje: string;
  abertoInicial?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [membroId, setMembroId] = useState(membroInicial ?? '');
  const [de, setDe] = useState(hoje);
  const [ate, setAte] = useState(hoje);
  const [motivo, setMotivo] = useState('');

  if (!aberto) {
    return (
      <button type="button" className="botao" onClick={() => setAberto(true)}>
        Marcar indisponibilidade
      </button>
    );
  }

  const membro = equipa.find((m) => m.id === membroId);
  const ateValido = ate < de ? de : ate;
  const titulo = membro ? tituloIndisponibilidade(membro.nome, motivo) : '';
  const href = membro ? linkNovaIndisponibilidade({ titulo, de, ate: ateValido, calendarioId }) : undefined;

  return (
    <div id="marcar" className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'var(--linha-quente)' }}>
      <span className="rotulo-seccao">Marcar indisponibilidade</span>

      <Campo etiqueta="Quem">
        <select className="campo" value={membroId} onChange={(e) => setMembroId(e.target.value)}>
          <option value="">Escolhe...</option>
          {equipa.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <Campo etiqueta="De">
          <input
            type="date"
            className="campo"
            value={de}
            min={hoje}
            onChange={(e) => {
              const novo = e.target.value || hoje;
              setDe(novo);
              if (ate < novo) setAte(novo);
            }}
          />
        </Campo>
        <Campo etiqueta="Ate (inclusive)">
          <input type="date" className="campo" value={ateValido} min={de} onChange={(e) => setAte(e.target.value || de)} />
        </Campo>
      </div>

      <Campo etiqueta="Motivo (opcional)">
        <input
          className="campo"
          value={motivo}
          maxLength={80}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Viagem, casamento, trabalho..."
        />
      </Campo>

      {membro && (
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', lineHeight: 1.6 }}>
          No calendario vai ficar <strong style={{ color: 'var(--texto)' }}>{titulo}</strong>, dia inteiro,{' '}
          {intervaloCurto(de, ateValido, hoje)}.
        </p>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!membro}
        className="botao"
        style={membro ? undefined : { opacity: 0.5, pointerEvents: 'none' }}
      >
        Abrir no Google Calendar
      </a>

      <p style={{ fontSize: 12, color: 'var(--texto-fraco)', lineHeight: 1.6 }}>
        No Google Calendar, confirma que o calendario escolhido e o dos <strong>N&apos;ASA</strong> e carrega em
        Guardar. Aparece aqui em poucos minutos. Para alterar ou apagar, toca na indisponibilidade na lista.
      </p>

      <button type="button" className="botao botao-secundario" onClick={() => setAberto(false)}>
        Fechar
      </button>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
      <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>{etiqueta}</span>
      {children}
    </label>
  );
}
