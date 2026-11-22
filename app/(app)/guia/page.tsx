'use client';

import { useRouter } from 'next/navigation';
import Guia, { CHAVE_GUIA, VERSAO_GUIA } from '@/components/guia/Guia';

// Pagina do guia (nasarockpt.vercel.app/guia), para partilhar o link. Abre o
// guia de imediato; ao fechar, vai para o Painel.
export default function PaginaGuia() {
  const router = useRouter();
  return (
    <Guia
      aberto
      onFechar={(porAtalho) => {
        try {
          localStorage.setItem(CHAVE_GUIA, VERSAO_GUIA);
        } catch {
          // Sem armazenamento: so navega.
        }
        if (!porAtalho) router.push('/painel');
      }}
    />
  );
}
