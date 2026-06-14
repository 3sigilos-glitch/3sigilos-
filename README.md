# 3 Sigilos | Plataforma de Gestao

Plataforma web de gestao de encomendas, stocks e producao para a marca de roupa esoterica 3 Sigilos. Interface em portugues europeu, estetica escura e mistica, pensada para funcionar bem em telemovel e desktop.

## Funcionalidades

- Painel principal com indicadores, alertas e encomendas recentes
- Gestao de encomendas com calculo automatico de preco e margem
- Registo de encomendas a partir do texto de um email
- Gestao de clientes com historico de compras, total gasto e marcacoes VIP e Terreiro
- Gestao de stocks separada entre t-shirts em branco e t-shirts estampadas
- Gestao de producao com pedidos ao fornecedor e lista de trabalho diaria
- Alertas configuraveis no dashboard com opcao de marcar como resolvido
- Faturacao pronta para o Portal das Financas com separacao Portugal e Europa
- Relatorios mensais por canal, modelo e tamanho com meta e barra de progresso
- Calendario com encomendas pendentes, envios previstos e producao
- Exportacao de dados em CSV e PDF
- Sistema de copias de seguranca e exportacao e importacao em JSON
- Estrutura modular preparada para integracao futura com o Notion

## Requisitos

- Node.js 18 ou superior

## Instalacao

```bash
npm install
```

## Arranque

```bash
npm start
```

A aplicacao fica disponivel em `http://localhost:3000`.

Para desenvolvimento com reinicio automatico:

```bash
npm run dev
```

## Base de dados

A base de dados e um ficheiro SQLite local em `data/3sigilos.db`, criado e preenchido automaticamente no primeiro arranque. Nao depende de servicos externos. O esquema e os dados base sao garantidos por `npm run seed`, que tambem corre no arranque.

## Copias de seguranca

Pela interface, em Definicoes, e possivel criar copias de seguranca e exportar ou importar todos os dados em JSON. Pela linha de comandos:

```bash
npm run backup
```

As copias ficam guardadas em `data/backups`.

## Estrutura do projeto

```
server.js                Ponto de entrada
src/config/catalog.js    Catalogo fixo: modelos, tamanhos, tipos de preco
src/db/                  Ligacao, esquema e preenchimento da base de dados
src/services/            Logica de negocio modular (precos, stock, alertas, ...)
src/routes/              Rotas da API REST
public/                  Interface web (HTML, CSS, JavaScript)
data/                    Base de dados e copias de seguranca (ignorado pelo git)
```

## Integracao com o Notion

O modulo `src/services/notion.js` esta preparado de forma isolada para a sincronizacao futura das bases de dados de encomendas e clientes com o Notion. Nas Definicoes e possivel guardar o token e os identificadores das bases de dados. A aplicacao funciona de forma completa e fiavel sem depender desta integracao.

## Catalogo e precos

Modelos disponiveis: Exu Guardiao, Pombagira Guardia, Celestial Balance, Ciclo Eterno, Mitologia Nordica, Ouija, Cards Never Lie, Forca Draconiana, Ze Pilintra, Maria Navalha, Hecate, Roda da Fortuna, A Estrela e O Mundo. Tamanhos S, M, L, XL e XXL.

Tipos de preco: Normal 19 euros, VIP, Terreiro 6 euros, Europa com portes incluidos 33 euros e Personalizado. Pack Tarot (Roda da Fortuna, A Estrela e O Mundo) por 50 euros. Custo de producao base de 4 euros por t-shirt, usado para calcular a margem. Todos os valores configuraveis em Definicoes.
