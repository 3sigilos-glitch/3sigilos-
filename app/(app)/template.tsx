// Template da zona autenticada: re-monta a cada navegacao, o que faz o novo
// conteudo entrar com uma transicao curta e com direcao (ver .entra no CSS).
// Movimento com funcao: orienta a mudanca de ecra, sem se exibir.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="entra">{children}</div>;
}
