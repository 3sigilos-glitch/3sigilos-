import Link from 'next/link';
import FormularioPreferencias from '@/components/preferencias/FormularioPreferencias';
import { obterPreferenciasCifra } from '@/lib/consultas';

// Ecra pessoal: como cada membro quer ver as cifras no modo palco. E privado ao
// proprio login (so afeta o que este utilizador ve, nao as cifras partilhadas).
export const dynamic = 'force-dynamic';

export default async function PaginaPreferencias() {
  const preferencias = await obterPreferenciasCifra();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/setlists" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--texto-suave)', fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg>Voltar
        </Link>
      </div>

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
