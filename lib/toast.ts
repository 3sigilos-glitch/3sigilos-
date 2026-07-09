// Confirmacoes curtas (toasts). Qualquer componente de cliente pode chamar
// mostrarToast; o Toaster (no layout) ouve o evento e trata de mostrar e sair.
export type TipoToast = 'ok' | 'erro';

export function mostrarToast(tipo: TipoToast, texto: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('nasa-toast', { detail: { tipo, texto } }));
}
