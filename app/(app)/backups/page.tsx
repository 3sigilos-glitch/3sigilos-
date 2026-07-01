import RestaurarCopia from '@/components/backups/RestaurarCopia';
import { criarClienteServidor } from '@/lib/supabase/server';

// Copias de seguranca: descarregar toda a informacao num ficheiro e repor a
// partir de um ficheiro guardado. Simples e sem depender de ninguem.
export default async function PaginaBackups() {
  const supabase = await criarClienteServidor();

  // Contagem rapida do que vai na copia, so para dar confianca.
  const [tshirts, desenhos, clientes, encomendas] = await Promise.all([
    supabase.from('tshirts_brancas').select('*', { count: 'exact', head: true }),
    supabase.from('desenhos').select('*', { count: 'exact', head: true }),
    supabase.from('clientes').select('*', { count: 'exact', head: true }),
    supabase.from('encomendas').select('*', { count: 'exact', head: true }),
  ]);

  const contagens = [
    { rotulo: 'T-shirts em branco', valor: tshirts.count ?? 0 },
    { rotulo: 'Desenhos', valor: desenhos.count ?? 0 },
    { rotulo: 'Clientes', valor: clientes.count ?? 0 },
    { rotulo: 'Encomendas', valor: encomendas.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl text-texto">Cópias de segurança</h1>

      <p className="text-sm leading-relaxed text-texto-suave">
        Guarda toda a tua informação num ficheiro. Podes guardá-lo no telemóvel, no
        computador ou na nuvem (Google Drive, email para ti própria). Se um dia precisares,
        repões tudo a partir desse ficheiro.
      </p>

      {/* O que vai na copia. */}
      <div className="cartao">
        <p className="mb-3 text-[12px] uppercase tracking-wide text-texto-fraco">
          O que vai na cópia
        </p>
        <ul className="flex flex-col gap-2">
          {contagens.map((c) => (
            <li key={c.rotulo} className="flex items-center justify-between text-sm">
              <span className="text-texto-suave">{c.rotulo}</span>
              <span className="font-semibold text-texto">{c.valor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Descarregar. O link vai a rota que gera o ficheiro. */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm uppercase tracking-wide text-texto-suave">Guardar cópia</h2>
        <a href="/backups/exportar" download className="botao">
          Descarregar cópia de segurança
        </a>
        <p className="text-[12px] text-texto-fraco">
          Descarrega um ficheiro com a data de hoje. Faz isto de vez em quando, para teres
          sempre uma cópia recente.
        </p>
      </section>

      {/* Restaurar. */}
      <section className="flex flex-col gap-2 border-t border-linha pt-5">
        <h2 className="text-sm uppercase tracking-wide text-texto-suave">Repor de uma cópia</h2>
        <RestaurarCopia />
        <p className="text-[12px] text-texto-fraco">
          Escolhe um ficheiro de cópia que tenhas guardado. A informação é reposta por id,
          por isso junta se à atual sem apagar o que já tens.
        </p>
      </section>
    </div>
  );
}
