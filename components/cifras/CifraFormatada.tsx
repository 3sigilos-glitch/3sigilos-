import { classificarLinhas, transporTexto, reduzirLinhaTonica } from '@/lib/acordes';

// Mostra uma cifra com os tres estilos (seccao, acordes, letra), sem alterar o
// conteudo guardado. Opcoes de visualizacao (por membro):
//  - semitons: transpoe so os acordes.
//  - tamanho: tamanho do texto.
//  - esconderAcordes: mostra so a letra (para quem canta).
//  - soTonica: reduz cada acorde a nota do baixo (para o baixista).
export default function CifraFormatada({
  conteudo,
  semitons = 0,
  tamanho = 15,
  esconderAcordes = false,
  soTonica = false,
}: {
  conteudo: string | null | undefined;
  semitons?: number;
  tamanho?: number;
  esconderAcordes?: boolean;
  soTonica?: boolean;
}) {
  const texto = transporTexto(conteudo ?? '', semitons);
  const linhas = classificarLinhas(texto);

  return (
    <div className="cifra" style={{ fontSize: tamanho }}>
      {linhas.map((linha, i) => {
        if (linha.tipo === 'vazia') return <div key={i} className="cifra-vazia" />;

        if (linha.tipo === 'acordes') {
          // Quem canta esconde os acordes e fica so com a letra.
          if (esconderAcordes) return null;
          // O baixista ve so a tonica (o texto ja vem transposto, por isso 0).
          const conteudoLinha = soTonica ? reduzirLinhaTonica(linha.texto, 0) : linha.texto;
          return (
            <div key={i} className="cifra-acordes">
              {conteudoLinha}
            </div>
          );
        }

        const classe = linha.tipo === 'seccao' ? 'cifra-seccao' : 'cifra-letra';
        return (
          <div key={i} className={classe}>
            {linha.texto}
          </div>
        );
      })}
    </div>
  );
}
