'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';

function lerFormulario(formData: FormData) {
  const texto = (chave: string) => {
    const v = formData.get(chave);
    const s = typeof v === 'string' ? v.trim() : '';
    return s === '' ? null : s;
  };
  return {
    nome_versao: texto('nome_versao') ?? 'Versao',
    conteudo: (formData.get('conteudo') as string) ?? '', // preserva o texto tal e qual
    tom: texto('tom'),
    numero_som: texto('numero_som'),
    notas_pessoais: texto('notas_pessoais'),
    por_defeito: formData.get('por_defeito') === 'on',
  };
}

// Estado devolvido ao formulario, para mostrar o erro na propria pagina em vez
// de rebentar com uma excecao no servidor.
export type EstadoCifra = { erro?: string } | null;

// Traduz erros comuns da base de dados numa mensagem util.
function mensagemErro(error: { message: string; code?: string }): string {
  const m = error.message ?? '';
  if (error.code === '42P01' || /does not exist/i.test(m)) {
    return 'A tabela de cifras ainda nao existe. Corre a migracao 0005 no SQL Editor do Supabase (ver README).';
  }
  return m || 'Nao foi possivel guardar.';
}

export async function criarCifra(musicaId: string, _prev: EstadoCifra, formData: FormData): Promise<EstadoCifra> {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('cifras').insert({ musica_id: musicaId, ...lerFormulario(formData) });
  if (error) return { erro: mensagemErro(error) };
  revalidatePath(`/repertorio/${musicaId}`);
  redirect(`/repertorio/${musicaId}`);
}

export async function atualizarCifra(
  musicaId: string,
  cifraId: string,
  _prev: EstadoCifra,
  formData: FormData
): Promise<EstadoCifra> {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('cifras').update(lerFormulario(formData)).eq('id', cifraId);
  if (error) return { erro: mensagemErro(error) };
  revalidatePath(`/repertorio/${musicaId}`);
  redirect(`/repertorio/${musicaId}`);
}

export async function apagarCifra(musicaId: string, cifraId: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('cifras').delete().eq('id', cifraId);
  if (error) throw new Error(`Nao foi possivel apagar: ${error.message}`);
  revalidatePath(`/repertorio/${musicaId}`);
  redirect(`/repertorio/${musicaId}`);
}

// Marca uma cifra como a versao por defeito da musica (o gatilho desmarca as outras).
export async function definirCifraPorDefeito(musicaId: string, cifraId: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from('cifras').update({ por_defeito: true }).eq('id', cifraId);
  if (error) throw new Error(`Nao foi possivel definir por defeito: ${error.message}`);
  revalidatePath(`/repertorio/${musicaId}`);
}

// Fase 3: importar o texto de uma cifra a partir de um ficheiro do Google Drive
// ou de um Google Docs, a partir do link de partilha (sem raspagem de sites).
// O ficheiro tem de estar partilhado (qualquer pessoa com o link).
export async function importarDoDrive(url: string): Promise<string> {
  const limpa = (url ?? '').trim();
  if (!limpa) throw new Error('Cola o link do ficheiro do Drive.');

  // Extrai o id do ficheiro dos formatos habituais do Drive e do Docs.
  const id =
    limpa.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    limpa.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    limpa.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) throw new Error('Nao reconheci o link. Usa o link de partilha de um Google Docs ou ficheiro do Drive.');

  // Google Docs exporta como texto; ficheiros do Drive descarregam diretamente.
  const enderecos = limpa.includes('/document/')
    ? [`https://docs.google.com/document/d/${id}/export?format=txt`]
    : [`https://drive.google.com/uc?export=download&id=${id}`];

  for (const endereco of enderecos) {
    try {
      const resposta = await fetch(endereco, { redirect: 'follow' });
      if (resposta.ok) {
        const texto = await resposta.text();
        if (texto && !texto.includes('<html')) return texto;
      }
    } catch {
      // tenta o proximo
    }
  }
  throw new Error('Nao consegui ler o ficheiro. Confirma que esta partilhado com quem tem o link.');
}
