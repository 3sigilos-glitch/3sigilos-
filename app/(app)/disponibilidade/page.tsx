import BotaoVoltar from '@/components/BotaoVoltar';
import Dica from '@/components/Dica';
import EstadoVazio from '@/components/EstadoVazio';
import { LinhaIndisponibilidade } from '@/components/eventos/SeccaoCalendario';
import { obterIndisponibilidades } from '@/lib/calendarioDados';
import { hojeEmPortugal, mesAnoDoDia, type Indisponibilidade } from '@/lib/calendario';

// Indisponibilidades de cada um, lidas do calendario Google dos N'ASA. A app
// nao guarda nada: o que esta (ou deixa de estar) no calendario e o que conta.
export default async function PaginaDisponibilidade() {
  const hoje = hojeEmPortugal();
  const { estado, lista } = await obterIndisponibilidades().catch(() => ({ estado: 'erro' as const, lista: [] as Indisponibilidade[] }));
  const proximas = lista.filter((i) => i.ate >= hoje);

  const grupos = new Map<string, Indisponibilidade[]>();
  for (const i of proximas) {
    const mes = mesAnoDoDia(i.de < hoje ? hoje : i.de);
    grupos.set(mes, [...(grupos.get(mes) ?? []), i]);
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/eventos" />
      <h1 style={{ fontSize: 30 }}>Disponibilidade</h1>

      <Dica id="disponibilidade">
        Isto vem do <strong>calendario Google</strong> dos N&apos;ASA e atualiza sozinho em poucos minutos. Para marcar
        uma indisponibilidade, cria la um evento com o teu nome e a palavra <strong>indisponivel</strong> no titulo
        (por exemplo <em>Kev indisponivel</em>). Se mudares de ideias, apaga ou altera o evento no calendario e deixa
        de aparecer aqui.
      </Dica>

      {estado === 'desligado' && (
        <EstadoVazio
          titulo="Calendario por ligar"
          texto="Falta dizer a app qual e o calendario Google dos N'ASA (variavel CALENDARIO_ICAL_URL no Vercel). Ate la, esta pagina fica vazia e o resto da app funciona normalmente."
        />
      )}

      {estado === 'erro' && (
        <EstadoVazio
          titulo="Calendario indisponivel"
          texto="Nao foi possivel ler o calendario Google neste momento. Tenta outra vez daqui a pouco; o resto da app nao e afetado."
        />
      )}

      {estado === 'ligado' && proximas.length === 0 && (
        <EstadoVazio titulo="Tudo livre" texto="Ninguem tem indisponibilidades marcadas no calendario daqui para a frente." />
      )}

      {Array.from(grupos.entries()).map(([mes, itens]) => (
        <div key={mes} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="rotulo-seccao">{mes}</h2>
          <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {itens.map((i) => (
              <LinhaIndisponibilidade key={i.uid} item={i} hoje={hoje} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
