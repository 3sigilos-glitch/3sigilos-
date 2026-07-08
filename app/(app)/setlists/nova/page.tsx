import Link from 'next/link';
import FormularioSetlist from '@/components/setlists/FormularioSetlist';
import { criarSetlist } from '../acoes';

export default function PaginaNovaSetlist() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/setlists" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Nova setlist</h1>
      <FormularioSetlist acao={criarSetlist} />
    </section>
  );
}
