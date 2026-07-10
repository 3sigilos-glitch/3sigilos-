import Link from 'next/link';
import EstadoVazio from '@/components/EstadoVazio';
import { criarClienteServidor } from '@/lib/supabase/server';
import type { Cliente } from '@/lib/tipos';

// Lista de clientes, simples de consultar e editar.
export default async function PaginaClientes() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from('clientes').select('*').order('nome');
  const lista = (data ?? []) as Cliente[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-texto">Clientes</h1>
        <Link href="/clientes/novo" className="text-sm font-semibold text-dourado">
          Novo
        </Link>
      </div>

      {lista.length === 0 ? (
        <EstadoVazio texto="Ainda não há clientes. Cria o primeiro no botão Novo." />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((c) => (
            <li key={c.id}>
              <Link href={`/clientes/${c.id}/editar`} className="cartao block">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-texto">{c.nome}</p>
                    {c.contacto && <p className="truncate text-sm text-texto-suave">{c.contacto}</p>}
                    {c.nif && <p className="text-[12px] text-texto-fraco">NIF: {c.nif}</p>}
                  </div>
                  <span className="etiqueta shrink-0 text-texto-suave">{c.tipo}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
