import Cabecalho from '@/components/Cabecalho';
import NavInferior from '@/components/NavInferior';
import BotaoNovaEncomenda from '@/components/BotaoNovaEncomenda';

// Esqueleto da zona autenticada: cabecalho fixo no topo, conteudo no meio,
// botao de registo rapido sempre a mao e navegacao inferior para o polegar.
export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Cabecalho />
      <main
        className="mx-auto w-full max-w-app flex-1 px-4 py-5"
        style={{
          // Espaco para o conteudo nao ficar tapado pela navegacao inferior.
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 24px)',
        }}
      >
        {children}
      </main>
      <BotaoNovaEncomenda />
      <NavInferior />
    </div>
  );
}
