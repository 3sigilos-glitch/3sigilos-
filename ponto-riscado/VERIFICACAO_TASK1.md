# Task 1 — Verificação de conteúdo (HTML vs documentos da Drive)

Fontes lidas na Drive (Curso umbanda):
- ESQUERDA/Exu.pdf, ESQUERDA/Pombagira.pdf, ESQUERDA/ExuMirim.pdf (terreiro / Saraceni) — **lidos na íntegra**
- ORIXAS/E-bookOxalá, E-bookLogunã, E-bookOxum, E-bookOxóssi (Comunidade Alexandra Ferreira) — **lidos na íntegra**
- manual_geometria_sagrada_ponto_riscado_v2.pdf (Tratado Técnico da Geometria Mágica) — **lido**
- Restantes e-books de orixá: E-bookOxumaré devolveu texto vazio (PDF achatado/imagem, não extraível). Os demais (Obá, Xangô, Oroiná, Ogum, Iansã, Obaluaiê, Nanã, Omolu, Iemanjá) **não lidos linha-a-linha** por limite de sessão — verificação ao nível dos dados do HTML (padrão de corrupção idêntico), a confirmar.

## Conclusões estruturais

1. **Substância fiel.** Onde foi possível confrontar com a fonte (Oxalá, Logunã, Oxum, Oxóssi, e toda a Esquerda), o conteúdo do HTML — cor da vela, elementos, orações, arquétipo — corresponde ao dos e-books. As orações estão transcritas corretamente.

2. **Saudações não vêm dos e-books.** Os e-books da Comunidade Alexandra Ferreira **não trazem fórmula de saudação**. As saudações do HTML são as canónicas de Umbanda (Kaô Kabecilê, Eparrei, Odoyá, Atotô, Saluba, Ora yê yê ô, Okê Arô, Ogum Yê, Arroboboi, Saravá) — corretas mas não "confirmáveis" nesses documentos. Duas estão sinalizadas pelo próprio autor como incertas: **Obá ("Obá Xi! (confirmar a vossa)")** e **Logunã ("Olhe o Tempo Minha Mãe!")** — esta última é uma frase de terreiro, não aparece no e-book de Logunã.

3. **Pedra / erva / fruta / bebida / dia:** estes cinco campos **não existem nos e-books do terreiro**. O e-book dá "Elementos simbólicos" (velas, flores, frutas, água, mel, bebida…) mas não uma tabela pedra/erva/dia. Por isso a ficha mostra honestamente o placeholder «Pedra, erva, dia: a confirmar». Único dado de "dia" localizável: **Exu → segunda-feira** (secção Pierre Verger dentro de Exu.pdf); e **contas pretas e vermelhas** (idem).

4. **Símbolos são "desenhados de raiz".** O manual de geometria define a *gramática* (círculo = redoma; eixo vertical = direita/esquerda; eixo horizontal = cima/baixo; cruz = 4 quadrantes; 8 polos cardeais; símbolo central = orixá regente; esquerda = polo absorvente; ativação por fogo/erva/mineral) e o significado do **tridente** e da **encruzilhada**. **Não atribui significado a cada forma geométrica individual** (coração, vesica, chevron, losango, etc.). Logo as legendas dos símbolos são descrições de forma, não significados doutrinários — e assim devem permanecer (Task 3: não inventar significados).

## Divergências concretas por entidade

### Corrupção de extração no campo `elementos` (a principal categoria de divergência)
Vários orixás têm o campo `elementos` com texto corrompido na extração do e-book:

- **Oxalá** — 3.º elemento truncado: «…lembram o essencial **que**» (falta «sustém a vida»). Espaços comidos: «fresca— representa», «intençãoe». Falta listar "Velas brancas" (está só como cor).
- **Logunã** — lista **duplicada e truncada**: aparece o conjunto limpo (velas azul-escuro/branca; frutas maracujá, romã, uvas, figos, coco fatiado; quartzo fumado; licor de anis; coco seco) **e** três entradas truncadas repetidas («…a», «…harmonia e», «…quebra de»). Fonte confirma: velas azul-escuro/branca, frutas (maracujá, dióspiro, romã, uvas, amoras), quartzo fumado, licor de anis / sumo de maracujá, coco seco.
- **Oxumaré** — **muito corrompido**: «F rutas sementeiras», «V elas turquesa ou velas de 7 cores», e uma frase de depoimento infiltrada («florescoloridaseumavelaacesa.Colocou-a…»). E-book não extraível para confronto — **a reconstruir/ confirmar**.
- **Oxóssi** — correto em substância mas com espaços comidos: «Frutasfrescasdaépoca», «Milho, frutassecasougrãos». Fonte: frutas frescas da época (banana, laranja, manga); milho/frutas secas/grãos; folhas e ervas; velas verdes ou brancas; cerveja branca. ✔ substância.
- **Iemanjá** — espaços comidos: «representamproteção,serenidadeeligaçãoàs», «águas.» solto.
- **Omolu** — «oco seco» (falta o "C" de Coco); espaços comidos.
- **Iansã** — lista **duplicada** (Velas amarelas / Frutas amarelas repetidas, uma versão curta e outra longa).
- **Oroiná** — carateres de controlo unicode (‭/‬) a poluir a última linha das velas.
- **Oxum** — **limpo e completo** ✔ (5 elementos + 5 orações batem certo com a fonte).

### Referência de símbolos/estrela vs o que é desenhado (para Task 3)
- **Oxalá**: `simbolos` diz «cruz latina, cruz de barras, cruz dupla» mas a grelha mostra também **cruz grega**. Falta mencioná-la.
- Restantes: as frases `estrela`/`simbolos` descrevem corretamente as formas geradas na maioria dos casos; alinhamento fino feito na Task 3.

### Esquerda (fonte confirmada na íntegra)
- **Exu** — saudação «Laroyê Exu, Exu é Mojubá!» ✔; cores preto e vermelho ✔ (Verger: contas pretas e vermelhas); trabalha em encruzilhada e tronqueira ✔; elementos (farofa, marafo, velas pretas/vermelhas, charuto, padê) coerentes ✔. **Dia = segunda-feira** é confirmável (Verger) — hoje está «a confirmar».
- **Pombagira** — saudação do HTML «Salve as Pombagiras! Pomba-gira Mojubá!»; a fórmula literal da fonte é «**Laroiê Pomba-gira! Pomba-gira Mojubá!**» («Salve as Pombagiras» é título de secção, não a saudação). Elementos champanhe, cigarrilha, batom/lenços vermelhos, velas ✔. **«Rosas vermelhas» não consta do e-book** (oferenda comum, mas não sourced). Cores «preto, vermelho e rosa»: o e-book só afirma vermelho; preto/rosa por convenção — a confirmar.
- **Exu Mirim** — texto do HTML bate quase à letra com a fonte (não humanos; encantados da 7.ª dimensão à esquerda; irrequietos mas não desrespeitadores; refletores por osmose; bebidas agradáveis; frutas ácidas; doces duros rapadura/pé-de-moleque/cocada/balas de menta; oferendados na natureza; enfraquecem se usados contra desafetos; não usar em demandas) ✔. Saudação «Laroyê Exu Mirim…» é construída (não na fonte). Cores/dia: a confirmar (não na fonte) ✔.
- Fundamentos/pontos da esquerda: mecânica (polo absorvente esquerdo, corte, descarrego, firmeza octogonal, tridente reto de Exu vs curvo de Pombagira) coerente com o manual de geometria ✔.

## Itens que ficam por confirmar
- E-books de Oxumaré, Obá, Xangô, Oroiná, Ogum, Iansã, Obaluaiê, Nanã, Omolu, Iemanjá: confronto texto-a-texto de `elementos`/`orações` (só o de Oxumaré foi tentado e devolveu vazio).
- Saudação de Obá e de Logunã (terreiro-específicas).
- Cores de Pombagira (preto/rosa) e «rosas vermelhas».
- Campos pedra/erva/fruta/bebida/dia: ausentes das fontes do terreiro para praticamente todos.
