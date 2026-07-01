import { criarClienteServidor } from '@/lib/supabase/server';
import { hoje } from '@/lib/formatar';

// Descarrega uma copia de seguranca com toda a informacao, num unico ficheiro JSON.
// A rota so responde a quem tem sessao iniciada (o middleware ja protege /backups,
// mas confirmamos aqui tambem por seguranca).
export async function GET() {
  const supabase = await criarClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Sem sessão iniciada.', { status: 401 });
  }

  // Vai buscar as quatro tabelas.
  const [tshirts, desenhos, clientes, encomendas] = await Promise.all([
    supabase.from('tshirts_brancas').select('*').order('criado_em'),
    supabase.from('desenhos').select('*').order('criado_em'),
    supabase.from('clientes').select('*').order('criado_em'),
    supabase.from('encomendas').select('*').order('criado_em'),
  ]);

  const erro = tshirts.error || desenhos.error || clientes.error || encomendas.error;
  if (erro) {
    return new Response(`Não foi possível gerar a cópia: ${erro.message}`, { status: 500 });
  }

  const copia = {
    aplicacao: '3 Sigilos',
    versao: 1,
    data_exportacao: new Date().toISOString(),
    dados: {
      tshirts_brancas: tshirts.data ?? [],
      desenhos: desenhos.data ?? [],
      clientes: clientes.data ?? [],
      encomendas: encomendas.data ?? [],
    },
  };

  const nomeFicheiro = `3sigilos-copia-${hoje()}.json`;

  return new Response(JSON.stringify(copia, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeFicheiro}"`,
      'Cache-Control': 'no-store',
    },
  });
}
