'use server';

import { emailsDaBanda, carregarBriefing, type Periodo } from '@/lib/automacoes';

// Envia um briefing por email a toda a banda, via Resend.
// Sem RESEND_API_KEY, lanca um aviso (a alternativa e copiar para o WhatsApp).
export async function enviarBriefingEmail(periodo: Periodo) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    throw new Error('Envio automatico nao configurado. Define RESEND_API_KEY ou copia o texto para o grupo.');
  }

  const [{ texto }, emails] = await Promise.all([carregarBriefing(periodo), emailsDaBanda()]);
  if (emails.length === 0) {
    throw new Error('Nenhum membro ativo tem email. Acrescenta os emails na Equipa.');
  }

  const remetente = process.env.RESEND_FROM ?? 'N\'ASA <agenda@nasa.pt>';
  const assunto = periodo === 'semana' ? 'Agenda da semana' : 'Agenda do mes';

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: remetente, to: emails, subject: assunto, text: texto }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`O servico de email recusou o envio: ${detalhe}`);
  }
}
