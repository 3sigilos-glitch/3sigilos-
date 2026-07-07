# Ponto Riscado — verificação, troca de SVG e ajuste de texto

Trabalho sobre `PontoRiscado_app.html` (app autónoma, colocada aqui por ser o branch de trabalho;
não faz parte da app N'ASA deste repositório).

## Conteúdo
- `PontoRiscado_app.html` — versão modificada (Tasks 2 e 3 aplicadas).
- `simbolos_raiz/` — os 83 ficheiros SVG desenhados de raiz + `MAPA_SVG_HTML.md`.
- `VERIFICACAO_TASK1.md` — relatório de verificação (Task 1), sem alterações ao conteúdo.

## Task 1 — Verificação (só relatório, ver `VERIFICACAO_TASK1.md`)
Confronto do HTML com os documentos da Drive (Curso umbanda: ORIXAS/ESQUERDA + manual de
geometria + Saraceni/Cumino). Verificados na íntegra: Esquerda (Exu, Pombagira, Exu Mirim) e os
orixás Oxalá, Logunã, Oxum, Oxóssi; restantes ao nível dos dados do HTML. Principais divergências:
corrupção de extração no campo `elementos` (espaços comidos, truncamentos, duplicados, texto
infiltrado, carateres de controlo); saudações não constam dos e-books (são canónicas); campos
pedra/erva/fruta/bebida/dia ausentes das fontes do terreiro; símbolos são "de raiz" (o manual
define a gramática e o significado do tridente/encruzilhada, mas não de cada forma).

## Task 2 — Troca dos SVG embutidos pelos ficheiros da pasta
O app passou a desenhar a partir dos ficheiros de `simbolos_raiz/`, em vez dos geradores
procedurais, nos três sítios: estrela no topo da ficha e no cartão da grelha, símbolos na grelha da
ficha, e pontos/tridente/encruzilhada na secção Esquerda. Implementação: mapas `RAIZ_STAR`,
`RAIZ_SYM` (por orixá+tipo) e `RAIZ_ESQ` embebidos, e as funções `estrela()`, `symbolSVG()` e
`esqSVG()` passam a devolver o SVG do ficheiro (com fallback ao gerador se faltar). Cor por orixá,
tipografia, tema escuro, animação e ampliação em modal mantidos. Verificado em Chromium: estrela
da ficha com `viewBox 0 0 240 240` (ficheiro), grelha e pontos com `viewBox 0 0 100 100`, modal a
funcionar, sem erros de JS.

Nota honesta: os ficheiros da pasta são exportações estáticas dos MESMOS desenhos "de raiz" já
gerados pelo app (mesma geometria, cor por orixá aplicada, `pathLength` para animação). A troca é
fiel mas visualmente equivalente — a diferença real está no texto (Tasks 1 e 3).

## Task 3 — Ajuste de texto ao desenho (sem inventar significados)
Como a geometria não mudou, as legendas já correspondiam. Correções pontuais, ancoradas no que
está desenhado:
- Oxalá `simbolos`: acrescentado "cruz grega" (estava desenhada na grelha, faltava no texto).
- Xangô `estrela`: "…sobre uma grelha" → "Hexagrama (estrela de seis pontas) inscrito num círculo"
  (a estrela desenhada não tem grelha).
- Logunã `estrela`: "Espiral fechada…, com duas setas ascendentes" → "Espiral inscrita num círculo"
  (as setas são um símbolo à parte, não estão na estrela).
- Obaluaiê `estrela`: "Hexágono/heptágono…" → "Hexágono geométrico…" (o desenho tem 6 lados).

## Limpeza dos `elementos` (pós-verificação, a pedido)
Reescrita fiel à fonte (e-books da Comunidade Alexandra Ferreira, secções de oferendas) do campo
`elementos`, corrigindo a corrupção de extração (espaços comidos, truncamentos, duplicados, texto
infiltrado, carateres de controlo):
- **Confirmados na fonte: os 14 orixás.** Oxalá, Logunã, Oxum, Oxóssi (1.ª ronda); Xangô, Obá,
  Iansã, Omolu, Iemanjá, Oroiná, Nanã, Obaluaiê (2.ª ronda); Oxumaré e Ogum (3.ª ronda, a partir
  da transcrição dos e-books, já que os PDF originais não eram extraíveis). Enriquecidos com os
  elementos que faltavam.
- **Saudação corrigida:** Obá passou de "Obá Xi! (confirmar a vossa)" para **"Akirô Obá Yê!"**
  (fórmula do e-book do terreiro).
- **Dia do Exu:** preenchido "segunda-feira" (fonte: Verger, em Exu.pdf).

### Ficou por confirmar
- Campos pedra/erva/dia por orixá (ausentes das fontes do terreiro — mantêm o placeholder da app).
- Cores de Pombagira (preto/rosa) e a oferenda "rosas vermelhas"; saudação de Logunã.
