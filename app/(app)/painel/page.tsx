import { criarClienteServidor } from '@/lib/supabase/server';

// Painel inicial. Nesta Fase 1 confirma a sessao e o tema base.
// Os proximos concertos, o pipeline e os indicadores chegam na Fase 4.
export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ color: 'var(--texto-suave)', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Bem-vindo
        </p>
        <h1 style={{ fontSize: 34, marginTop: 4 }}>Painel</h1>
      </div>

      <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="estado" style={{ color: 'var(--estado-confirmado)', alignSelf: 'flex-start' }}>
          Fase 1 concluida
        </span>
        <p style={{ color: 'var(--texto-suave)', lineHeight: 1.6, fontSize: 15 }}>
          Tens sessao iniciada como{' '}
          <strong style={{ color: 'var(--texto)' }}>{user?.email}</strong>. A base esta pronta:
          projeto Next.js, ligacao ao Supabase, autenticacao por link magico, tema escuro e app
          instalavel no telemovel.
        </p>
      </div>

      <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 18 }}>A seguir</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ItemPlano texto="Esquema da base de dados e permissoes (RLS)" fase="Fase 2" />
          <ItemPlano texto="Eventos: lista, ficha, estados e conflito de data" fase="Fase 3" />
          <ItemPlano texto="Indicadores e pipeline neste painel" fase="Fase 4" />
        </ul>
      </div>
    </section>
  );
}

function ItemPlano({ texto, fase }: { texto: string; fase: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--linha)', paddingBottom: 10 }}>
      <span style={{ fontSize: 14 }}>{texto}</span>
      <span style={{ color: 'var(--texto-fraco)', fontSize: 12, whiteSpace: 'nowrap' }}>{fase}</span>
    </li>
  );
}
