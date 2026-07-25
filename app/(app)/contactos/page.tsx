import Link from 'next/link';
import EstadoVazio from '@/components/EstadoVazio';
import { listarContactos } from '@/lib/consultas';
import { TIPO_CONTACTO, type Contacto, type TipoContacto } from '@/lib/tipos';

// Agrupa os contactos por tipo, para a lista ficar arrumada.
function agruparPorTipo(contactos: Contacto[]) {
  const grupos = new Map<string, Contacto[]>();
  for (const c of contactos) {
    const chave = c.tipo ? TIPO_CONTACTO[c.tipo as TipoContacto] : 'Sem tipo';
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(c);
  }
  return Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function PaginaContactos() {
  const contactos = await listarContactos();
  const grupos = agruparPorTipo(contactos);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 30 }}>Contactos</h1>
        <Link href="/contactos/novo" className="botao" style={{ width: 'auto' }}>Novo</Link>
      </div>

      {contactos.length === 0 ? (
        <EstadoVazio
          titulo="Sem contactos"
          texto="Guarda aqui quem contrata a banda (camaras, juntas, associacoes, motards) com o historico de cada um."
          accaoHref="/contactos/novo"
          accaoEtiqueta="Novo contacto"
        />
      ) : (
        grupos.map(([tipo, lista]) => (
          <div key={tipo} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="rotulo-seccao">{tipo}</h2>
            {lista.map((c) => (
              <Link key={c.id} href={`/contactos/${c.id}`} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontSize: 16 }}>{c.nome}</strong>
                <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                  {[c.entidade, c.concelho, c.telefone].filter(Boolean).join('  |  ') || 'Sem detalhes'}
                </span>
              </Link>
            ))}
          </div>
        ))
      )}
    </section>
  );
}
