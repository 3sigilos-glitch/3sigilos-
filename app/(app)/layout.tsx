import Cabecalho from '@/components/Cabecalho';
import NavInferior from '@/components/NavInferior';
import BotaoCriar from '@/components/BotaoCriar';
import Toaster from '@/components/Toaster';
import { obterSessao } from '@/lib/sessao';

// Esqueleto da zona autenticada: cabecalho fixo no topo,
// conteudo no meio e navegacao inferior pensada para o polegar.
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Cabecalho email={sessao.email ?? undefined} ehAdmin={sessao.ehAdmin} />
      <main
        style={{
          flex: 1,
          padding: '20px 16px',
          // Espaco para nao ficar tapado pela navegacao inferior.
          paddingBottom: 'calc(var(--barra-inferior) + env(safe-area-inset-bottom) + 24px)',
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
      <BotaoCriar />
      <NavInferior />
      <Toaster />
    </div>
  );
}
