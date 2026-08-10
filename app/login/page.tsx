'use client';

import { useState } from 'react';
import Brasao from '@/components/Brasao';
import { criarClienteBrowser } from '@/lib/supabase/client';

// Ecra de entrada: logotipo branco sobre fundo escuro e login rapido
// por link magico (sem palavra-passe para memorizar).
export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'inicial' | 'a_enviar' | 'enviado' | 'erro'>('inicial');
  const [mensagemErro, setMensagemErro] = useState('');

  async function enviarLink(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado('a_enviar');
    setMensagemErro('');

    const supabase = criarClienteBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmar`,
        // A app e so para os elementos convidados: nao cria contas novas a quem
        // simplesmente descubra o endereco. Quem nao estiver registado no
        // Supabase nao recebe link nenhum.
        shouldCreateUser: false,
      },
    });

    if (error) {
      const m = error.message ?? '';
      if (/signups? not allowed|not allowed for otp|user not found/i.test(m)) {
        setMensagemErro('Esse email nao esta registado. A app e so para os elementos da banda; pede ao admin para te acrescentar.');
      } else if (/rate limit|too many/i.test(m)) {
        setMensagemErro('Ja foram pedidos links a mais nos ultimos minutos. Espera um pouco e tenta de novo.');
      } else {
        setMensagemErro('Nao foi possivel enviar o link. Confirma o email e tenta de novo.');
      }
      setEstado('erro');
    } else {
      setEstado('enviado');
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        gap: '40px',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ filter: 'drop-shadow(0 0 24px rgba(var(--acento-rgb), 0.25))' }}>
          <Brasao largura={230} />
        </div>
        <p style={{ color: 'var(--texto-suave)', letterSpacing: '0.1em', fontSize: 13, textTransform: 'uppercase' }}>
          Gestao da banda
        </p>
      </div>

      {estado === 'enviado' ? (
        <div className="cartao" style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Link enviado</h2>
          <p style={{ color: 'var(--texto-suave)', fontSize: 14, lineHeight: 1.5 }}>
            Verifica o email <strong style={{ color: 'var(--texto)' }}>{email}</strong> e toca no link
            para entrares. Podes fechar este separador.
          </p>
        </div>
      ) : (
        <form onSubmit={enviarLink} style={{ maxWidth: 360, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label htmlFor="email" style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.04em' }}>
            O teu email
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

          {estado === 'erro' && (
            <p style={{ color: 'var(--acento-forte)', fontSize: 13 }}>{mensagemErro}</p>
          )}

          <button type="submit" className="botao" disabled={estado === 'a_enviar' || !email}>
            {estado === 'a_enviar' ? 'A enviar...' : 'Entrar com link magico'}
          </button>

          <p style={{ color: 'var(--texto-fraco)', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
            Enviamos um link de acesso para o teu email. Sem palavra-passe.
          </p>
        </form>
      )}
    </main>
  );
}
