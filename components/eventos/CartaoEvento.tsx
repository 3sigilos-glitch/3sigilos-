import Link from 'next/link';
import EtiquetaEstado from '@/components/EtiquetaEstado';
import { dataExtenso, hora, textoDias, euros } from '@/lib/formatar';
import type { Evento } from '@/lib/tipos';

// Item de lista de um evento, tocavel para abrir a ficha.
export default function CartaoEvento({ evento }: { evento: Evento }) {
  const h = hora(evento.data);
  const dias = textoDias(evento.data);

  return (
    <Link href={`/eventos/${evento.id}`} className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <h3 style={{ fontSize: 18, lineHeight: 1.15 }}>{evento.evento}</h3>
        <EtiquetaEstado estado={evento.estado} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', color: 'var(--texto-suave)', fontSize: 13 }}>
        <span>{dataExtenso(evento.data)}{h ? `, ${h}` : ''}</span>
        {evento.local && <span>{evento.local}</span>}
        {dias && <span style={{ color: 'var(--texto-fraco)' }}>({dias})</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--linha)', paddingTop: 8 }}>
        {evento.referencia
          ? <span className="carimbo">{evento.referencia}</span>
          : <span />}
        <strong className="titulo numero" style={{ fontSize: 18 }}>{euros(evento.valor_total)}</strong>
      </div>
    </Link>
  );
}
