import { classificarLinhas, transporTexto } from '@/lib/acordes';

// Mostra uma cifra com os tres estilos (seccao, acordes, letra), sem alterar o
// conteudo. Opcionalmente transpoe (so os acordes) por um numero de semitons.
export default function CifraFormatada({
  conteudo,
  semitons = 0,
  tamanho = 15,
}: {
  conteudo: string | null | undefined;
  semitons?: number;
  tamanho?: number;
}) {
  const texto = transporTexto(conteudo ?? '', semitons);
  const linhas = classificarLinhas(texto);

  return (
    <div className="cifra" style={{ fontSize: tamanho }}>
      {linhas.map((linha, i) => {
        if (linha.tipo === 'vazia') return <div key={i} className="cifra-vazia" />;
        const classe =
          linha.tipo === 'seccao' ? 'cifra-seccao' : linha.tipo === 'acordes' ? 'cifra-acordes' : 'cifra-letra';
        return (
          <div key={i} className={classe}>
            {linha.texto}
          </div>
        );
      })}
    </div>
  );
}
