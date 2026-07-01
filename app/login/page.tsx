'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Marca from '@/components/Marca';
import { criarClienteBrowser } from '@/lib/supabase/client';

// Ecra de entrada: login simples por email e password, so para a dona da marca.
// A conta e criada uma unica vez no painel do Supabase (ver o guia no README).
export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aEntrar, setAEntrar] = useState(false);
  const [erro, setErro] = useState('');

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setAEntrar(true);
    setErro('');

    const supabase = criarClienteBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErro('Email ou password incorretos. Tenta de novo.');
      setAEntrar(false);
      return;
    }

    // Sessao criada. Vai para o painel e atualiza o estado do servidor.
    router.replace('/painel');
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-10 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Marca tamanho="grande" />
        <p className="text-[13px] uppercase tracking-[0.2em] text-texto-suave">
          Organização da marca
        </p>
      </div>

      <form onSubmit={entrar} className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <label htmlFor="email" className="rotulo">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="nome@exemplo.pt"
            className="campo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="rotulo">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="A tua password"
            className="campo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-estado-repor">{erro}</p>}

        <button type="submit" className="botao" disabled={aEntrar || !email || !password}>
          {aEntrar ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
