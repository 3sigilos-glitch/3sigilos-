import BotaoVoltar from '@/components/BotaoVoltar';
import FormularioPreferencias from '@/components/preferencias/FormularioPreferencias';
import { obterPreferenciasCifra } from '@/lib/consultas';

// Ecra pessoal: como cada membro quer ver as cifras no modo palco. E privado ao
// proprio login (so afeta o que este utilizador ve, nao as cifras partilhadas).
export const dynamic = 'force-dynamic';

export default async function PaginaPreferencias() {
  const preferencias = await obterPreferenciasCifra();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BotaoVoltar href="/painel" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ fontSize: 28 }}>As minhas cifras</h1>
        <p style={{ color: 'var(--texto-suave)', fontSize: 14, lineHeight: 1.6 }}>
          Escolhe como queres ver as cifras no palco. So muda o que tu ves: os outros continuam a ver as suas.
          Tambem podes mexer nestas opcoes ali mesmo no modo palco, e ficam guardadas.
        </p>
      </div>

      <FormularioPreferencias preferencias={preferencias} />
    </section>
  );
}
