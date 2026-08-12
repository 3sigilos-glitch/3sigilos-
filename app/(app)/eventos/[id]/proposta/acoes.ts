'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/server';
import { obterEvento, obterDefinicoes } from '@/lib/consultas';
import { gerarPdfProposta } from '@/lib/propostaPdf';

// Gera e atribui a referencia (NASA-ano-numero) ao evento, se ainda nao tiver,
// e marca a data da proposta. A referencia vem de uma funcao atomica no Postgres.
export async function gerarProposta(eventoId: string) {
  const supabase = await criarClienteServidor();

  const { data: atual } = await supabase.from('eventos').select('referencia').eq('id', eventoId).single();
  if (atual?.referencia) {
    revalidatePath(`/eventos/${eventoId}/proposta`);
    return;
  }

  const { data: referencia, error: erroRef } = await supabase.rpc('gerar_referencia');
  if (erroRef) throw new Error(`Nao foi possivel gerar a referencia: ${erroRef.message}`);

  const hoje = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from('eventos')
    .update({ referencia, data_proposta: hoje })
    .eq('id', eventoId);
  if (error) throw new Error(`Nao foi possivel guardar a referencia: ${error.message}`);

  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath(`/eventos/${eventoId}/proposta`);
}

// Gera o PDF e arquiva-o no Supabase Storage, no balde "propostas".
export async function arquivarProposta(eventoId: string) {
  const supabase = await criarClienteServidor();
  const [evento, definicoes] = await Promise.all([obterEvento(eventoId), obterDefinicoes()]);
  if (!evento) throw new Error('Evento nao encontrado.');

  const pdf = await gerarPdfProposta(evento, definicoes);
  const caminho = `${eventoId}.pdf`;

  const { error } = await supabase.storage
    .from('propostas')
    .upload(caminho, pdf, { contentType: 'application/pdf', upsert: true });

  if (error) {
    throw new Error(
      `Nao foi possivel arquivar no Storage: ${error.message}. ` +
        'Confirma que existe o balde "propostas" (ver migracao 0004 e README).'
    );
  }
}

// Envia a proposta por email ao contratante, com o PDF em anexo, via Resend.
// So funciona se RESEND_API_KEY estiver definido. Caso contrario, usa o rascunho
// de email (mailto) disponivel na pagina.
export async function enviarPropostaEmail(eventoId: string) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    throw new Error('Envio automatico nao configurado. Define RESEND_API_KEY ou usa o rascunho de email.');
  }

  const [evento, definicoes] = await Promise.all([obterEvento(eventoId), obterDefinicoes()]);
  if (!evento) throw new Error('Evento nao encontrado.');
  const destino = evento.contratante?.email;
  if (!destino) throw new Error('O contratante nao tem email. Acrescenta o email no contacto.');

  const pdf = await gerarPdfProposta(evento, definicoes);
  const remetente = process.env.RESEND_FROM ?? 'N\'ASA <propostas@nasa.pt>';

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: remetente,
      to: [destino],
      subject: `Proposta ${evento.referencia ?? ''} | ${definicoes?.nome_banda ?? "N'ASA"}`.trim(),
      text: `Em anexo, a nossa proposta para ${evento.evento}.`,
      attachments: [
        { filename: `proposta-${evento.referencia ?? eventoId}.pdf`, content: Buffer.from(pdf).toString('base64') },
      ],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`O servico de email recusou o envio: ${detalhe}`);
  }
}
