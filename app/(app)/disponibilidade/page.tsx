import BotaoVoltar from '@/components/BotaoVoltar';
import Dica from '@/components/Dica';
import EstadoVazio from '@/components/EstadoVazio';
import MarcarIndisponibilidade from '@/components/disponibilidade/MarcarIndisponibilidade';
import { LinhaIndisponibilidade } from '@/components/eventos/SeccaoCalendario';
import { obterIndisponibilidades, obterEquipaAtiva, obterMeuMembroId, idDoCalendario } from '@/lib/calendarioDados';
import { hojeEmPortugal, mesAnoDoDia, type Indisponibilidade } from '@/lib/calendario';

// Indisponibilidades de cada um, lidas do calendario Google dos N'ASA. A app
// nao guarda nada: o que esta (ou deixa de estar) no calendario e o que conta.
// Marcar uma nova abre o Google Calendar ja preenchido; quem marca grava la.
export default async function PaginaDisponibilidade({
  searchParams,
}: {
  searchParams: Promise<{ marcar?: string }>;
}) {
  const { marcar } = await searchParams;
  const hoje = hojeEmPortugal();
  const [{ estado, lista }, equipa, meuMembroId] = await Promise.all([
    obterIndisponibilidades().catch(() => ({ estado: 'erro' as const, lista: [] as Indisponibilidade[] })),
    obterEquipaAtiva().catch(() => []),
    obterMeuMembroId().catch(() => null),
  ]);
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
        uma indisponibilidade, toca em <strong>Marcar indisponibilidade</strong>: abre o Google Calendar ja preenchido
        e so tens de guardar. Para alterar ou apagar, toca nela na lista. Tambem podes continuar a escrever direto no
        calendario, com o teu nome e a palavra <strong>indisponivel</strong> (por exemplo <em>Kev indisponivel</em>).
      </Dica>

      {/* Marcar so faz sentido com o calendario ligado (senao nao aparecia aqui). */}
      {estado !== 'desligado' && equipa.length > 0 && (
        <MarcarIndisponibilidade
          equipa={equipa}
          membroInicial={meuMembroId}
          calendarioId={idDoCalendario()}
          hoje={hoje}
          abertoInicial={marcar === '1'}
        />
      )}

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
