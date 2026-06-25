import Link from 'next/link';
import FormularioMusica from '@/components/repertorio/FormularioMusica';
import { criarMusica } from '../acoes';

export default function PaginaNovaMusica() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/repertorio" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Nova musica</h1>
      <FormularioMusica acao={criarMusica} />
    </section>
  );
}
