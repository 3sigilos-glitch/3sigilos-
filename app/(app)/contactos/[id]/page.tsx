import Link from 'next/link';
import { notFound } from 'next/navigation';
import EtiquetaEstado from '@/components/EtiquetaEstado';
import BotaoApagar from '@/components/BotaoApagar';
import { obterContacto } from '@/lib/consultas';
import { obterSessao } from '@/lib/sessao';
import { apagarContacto } from '../acoes';
import { dataExtenso, euros } from '@/lib/formatar';
import { TIPO_CONTACTO, type TipoContacto } from '@/lib/tipos';

export default async function PaginaFichaContacto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contacto, sessao] = await Promise.all([obterContacto(id), obterSessao()]);
  if (!contacto) notFound();
  const apagar = apagarContacto.bind(null, id);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/contactos" style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Voltar</Link>
        <Link href={`/contactos/${id}/editar`} className="botao" style={{ width: 'auto' }}>Editar</Link>
      </div>

      <div>
        <h1 style={{ fontSize: 30 }}>{contacto.nome}</h1>
        {contacto.tipo && (
          <span style={{ fontSize: 13, color: 'var(--texto-fraco)' }}>{TIPO_CONTACTO[contacto.tipo as TipoContacto]}</span>
        )}
      </div>

      <div className="cartao" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {contacto.entidade && <Linha rotulo="Entidade" valor={contacto.entidade} />}
        {contacto.telefone && <Linha rotulo="Telefone" valor={contacto.telefone} />}
        {contacto.email && <Linha rotulo="Email" valor={contacto.email} />}
        {contacto.concelho && <Linha rotulo="Concelho" valor={contacto.concelho} />}
        {contacto.notas && <p style={{ color: 'var(--texto-suave)', lineHeight: 1.6, fontSize: 14, marginTop: 4 }}>{contacto.notas}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="rotulo-seccao">
          Historico de eventos ({contacto.eventos.length})
        </h2>
        {contacto.eventos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Ainda sem eventos com este contratante.</p>
        ) : (
          contacto.eventos.map((ev) => (
            <Link key={ev.id} href={`/eventos/${ev.id}`} className="cartao" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <strong style={{ fontSize: 15 }}>{ev.evento}</strong>
                <span style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{dataExtenso(ev.data)}{ev.local ? `, ${ev.local}` : ''}</span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <EtiquetaEstado estado={ev.estado} />
                <strong className="titulo" style={{ fontSize: 15 }}>{euros(ev.valor_total)}</strong>
              </span>
            </Link>
          ))
        )}
      </div>

      {sessao.ehAdmin && (
        <BotaoApagar acao={apagar} confirmacao={`Apagar o contacto "${contacto.nome}"?`} etiqueta="Apagar contacto" />
      )}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
      <span style={{ color: 'var(--texto-suave)' }}>{rotulo}</span>
      <span style={{ textAlign: 'right' }}>{valor}</span>
    </div>
  );
}
