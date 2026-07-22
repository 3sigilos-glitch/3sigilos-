'use client';

import { useRef, useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import CifraFormatada from '@/components/cifras/CifraFormatada';
import { importarDoDrive, type EstadoCifra } from '@/app/(app)/repertorio/[id]/cifras/acoes';
import { TAGS_CIFRA, type Cifra } from '@/lib/tipos';

type Acao = (prev: EstadoCifra, formData: FormData) => Promise<EstadoCifra>;

export default function EditorCifra({ acao, cifra }: { acao: Acao; cifra?: Cifra }) {
  const [estado, formAction] = useFormState(acao, null);
  const [conteudo, setConteudo] = useState(cifra?.conteudo ?? '');
  const [linkDrive, setLinkDrive] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [aImportar, iniciar] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // Importar de um ficheiro do dispositivo (por exemplo, descarregado do Drive).
  function lerFicheiro(ficheiro: File) {
    const leitor = new FileReader();
    leitor.onload = () => {
      setConteudo(String(leitor.result ?? ''));
      setMensagem({ tipo: 'ok', texto: `Importado de ${ficheiro.name}.` });
    };
    leitor.readAsText(ficheiro);
  }

  // Importar de um link de partilha do Google Drive ou Docs.
  function importarLink() {
    if (!linkDrive.trim()) return;
    setMensagem(null);
    iniciar(async () => {
      try {
        const texto = await importarDoDrive(linkDrive);
        setConteudo(texto);
        setMensagem({ tipo: 'ok', texto: 'Cifra importada do Drive.' });
      } catch (e: any) {
        setMensagem({ tipo: 'erro', texto: e?.message ?? 'Nao foi possivel importar.' });
      }
    });
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Campo etiqueta="Nome da versao" obrigatorio>
        <input
          name="nome_versao"
          required
          className="campo"
          list="tags-versao"
          defaultValue={cifra?.nome_versao ?? ''}
          placeholder="GERAL, BAIXO, TECLAS, Meio tom abaixo..."
        />
        <datalist id="tags-versao">
          {TAGS_CIFRA.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <span style={{ fontSize: 11, color: 'var(--texto-fraco)', lineHeight: 1.5 }}>
          Usa uma etiqueta de instrumento (BAIXO, TECLAS, VOZ) para cada um ver a sua versao no palco,
          ou um nome livre para versoes de tom (Meio tom abaixo).
        </span>
      </Campo>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo etiqueta="Tom">
          <input name="tom" className="campo" defaultValue={cifra?.tom ?? ''} placeholder="Em, G, A..." />
        </Campo>
        <Campo etiqueta="Numero do som">
          <input name="numero_som" className="campo" defaultValue={cifra?.numero_som ?? ''} placeholder="12" />
        </Campo>
      </div>

      {/* Importar */}
      <div className="cartao" style={{ background: 'var(--superficie-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Importar (opcional)</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="botao botao-secundario" style={{ width: 'auto' }} onClick={() => fileRef.current?.click()}>
            De um ficheiro
          </button>
          <input ref={fileRef} type="file" accept=".txt,.text,text/plain" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && lerFicheiro(e.target.files[0])} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="campo" style={{ flex: 1 }} value={linkDrive} onChange={(e) => setLinkDrive(e.target.value)} placeholder="Link do Google Drive ou Docs" />
          <button type="button" className="botao botao-secundario" style={{ width: 'auto' }} disabled={aImportar} onClick={importarLink}>
            {aImportar ? '...' : 'Importar'}
          </button>
        </div>
        <span style={{ fontSize: 11, color: 'var(--texto-fraco)', lineHeight: 1.5 }}>
          O ficheiro do Drive tem de estar partilhado com quem tem o link. Tambem podes simplesmente colar o texto no campo abaixo.
        </span>
      </div>

      <Campo etiqueta="Cifra (cola aqui o texto)">
        <textarea
          name="conteudo"
          className="campo cifra"
          rows={10}
          style={{ paddingTop: 12, height: 'auto', resize: 'vertical', minHeight: 200 }}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={'Intro\nAm      G      F\nA minha casinha tem...'}
        />
      </Campo>

      {/* Pre-visualizacao com os tres estilos */}
      <div>
        <span style={{ fontSize: 12, color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pre-visualizacao</span>
        <div className="cartao" style={{ marginTop: 6, overflowX: 'auto' }}>
          {conteudo.trim() ? <CifraFormatada conteudo={conteudo} /> : <span style={{ color: 'var(--texto-fraco)', fontSize: 13 }}>A cifra formatada aparece aqui.</span>}
        </div>
      </div>

      <Campo etiqueta="Notas pessoais">
        <textarea name="notas_pessoais" className="campo" rows={2} style={{ paddingTop: 12, height: 'auto', resize: 'vertical' }} defaultValue={cifra?.notas_pessoais ?? ''} placeholder="Entra a seguir ao discurso, cuidado com o final..." />
      </Campo>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 'var(--toque)' }}>
        <input type="checkbox" name="por_defeito" defaultChecked={cifra?.por_defeito ?? false} style={{ width: 20, height: 20, accentColor: 'var(--acento)' }} />
        <span style={{ fontSize: 15 }}>Versao por defeito desta musica</span>
      </label>

      {mensagem && (
        <p style={{ fontSize: 13, color: mensagem.tipo === 'ok' ? 'var(--estado-confirmado)' : 'var(--acento-forte)' }}>{mensagem.texto}</p>
      )}
      {estado?.erro && (
        <p style={{ fontSize: 13, color: 'var(--acento-forte)', lineHeight: 1.5 }}>{estado.erro}</p>
      )}

      <button type="submit" className="botao">{cifra ? 'Guardar cifra' : 'Criar cifra'}</button>
    </form>
  );
}

function Campo({ etiqueta, obrigatorio, children }: { etiqueta: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 13, color: 'var(--texto-suave)', letterSpacing: '0.03em' }}>
        {etiqueta}{obrigatorio && <span style={{ color: 'var(--acento)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}
