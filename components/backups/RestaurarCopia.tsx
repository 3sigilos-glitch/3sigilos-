'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { restaurarBackup } from '@/app/(app)/backups/acoes';

// Restauro a partir de um ficheiro de copia (JSON). Le o ficheiro no telemovel
// ou no computador, pede confirmacao e repoe a informacao.
export default function RestaurarCopia() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [aRestaurar, setARestaurar] = useState(false);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);

  async function aoEscolherFicheiro(evento: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = evento.target.files?.[0];
    if (!ficheiro) return;

    const confirmar = confirm(
      'Restaurar esta cópia? A informação do ficheiro vai ser reposta por cima da atual (não apaga o que já tens).'
    );
    if (!confirmar) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setARestaurar(true);
    setMensagem(null);
    try {
      const conteudo = await ficheiro.text();
      const resultado = await restaurarBackup(conteudo);
      setMensagem({ ok: resultado.ok, texto: resultado.mensagem });
      if (resultado.ok) router.refresh();
    } catch {
      setMensagem({ ok: false, texto: 'Não foi possível ler o ficheiro. Tenta de novo.' });
    } finally {
      setARestaurar(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={aoEscolherFicheiro}
      />
      <button
        type="button"
        className="botao-secundario"
        disabled={aRestaurar}
        onClick={() => inputRef.current?.click()}
      >
        {aRestaurar ? 'A restaurar...' : 'Restaurar de um ficheiro'}
      </button>

      {mensagem && (
        <p className={`text-sm ${mensagem.ok ? 'text-estado-ok' : 'text-estado-repor'}`}>
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
