import Link from 'next/link';
import FormularioContacto from '@/components/contactos/FormularioContacto';
import { criarContacto } from '../acoes';

export default function PaginaNovoContacto() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link href="/contactos" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
      <h1 style={{ fontSize: 30 }}>Novo contacto</h1>
      <FormularioContacto acao={criarContacto} />
    </section>
  );
}
