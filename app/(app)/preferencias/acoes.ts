'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/server';

export type EstadoPreferencias = { ok?: boolean; erro?: string } | null;

// Limita o tamanho ao mesmo intervalo do modo palco.
function tamanhoValido(valor: unknown): number {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 18;
  return Math.min(48, Math.max(12, Math.round(n)));
}

// Guarda as preferencias de cifra do login atual (ecra de preferencias).
export async function guardarPreferenciasCifra(
  _prev: EstadoPreferencias,
  formData: FormData
): Promise<EstadoPreferencias> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: 'A sessao expirou. Entra de novo.' };

  const tag = String(formData.get('cifra_tag') ?? '').trim() || null;

  const { error } = await supabase
    .from('perfis')
    .update({
      cifra_tag: tag,
      cifra_esconder_acordes: formData.get('cifra_esconder_acordes') === 'on',
      cifra_so_tonica: formData.get('cifra_so_tonica') === 'on',
      cifra_tamanho: tamanhoValido(formData.get('cifra_tamanho')),
    })
    .eq('id', user.id);

  if (error) {
    return {
      erro: 'Nao foi possivel guardar. Confirma que a migracao 0006 foi corrida no Supabase.',
    };
  }

  revalidatePath('/preferencias');
  return { ok: true };
}

// Guarda rapida usada pelo modo palco: escreve as opcoes assim que o membro as
// muda ali no momento, para ficarem lembradas da proxima vez. Silenciosa (nao
// interrompe quem esta a tocar se algo falhar).
export async function guardarPreferenciasRapido(p: {
  tag: string | null;
  esconderAcordes: boolean;
  soTonica: boolean;
  tamanho: number;
}): Promise<void> {
  try {
    const supabase = await criarClienteServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('perfis')
      .update({
        cifra_tag: p.tag,
        cifra_esconder_acordes: p.esconderAcordes,
        cifra_so_tonica: p.soTonica,
        cifra_tamanho: tamanhoValido(p.tamanho),
      })
      .eq('id', user.id);
  } catch {
    // Sem barulho: as preferencias voltam a tentar guardar na proxima mudanca.
  }
}
