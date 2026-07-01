# 3 Sigilos | Organização da marca

Aplicação web simples para organizares a tua marca de roupa esotérica, a 3 Sigilos.
Feita para um único utilizador (tu), responsiva no telemóvel e no computador, com os
dados guardados na nuvem para acederes de qualquer sítio.

Fluxo real que a app respeita: não há t-shirts já estampadas em stock. Há t-shirts em
branco e há desenhos, e só se estampa quando alguém encomenda. Quando marcas uma
encomenda como entregue, a app abate do stock uma t-shirt em branco da cor e tamanho
da encomenda.

## O que tens dentro da app

- **Painel** leve: t-shirts a repor, encomendas por estampar, dinheiro a receber e pagas por faturar.
- **Registo rápido de encomenda**, sempre à mão pelo botão dourado, com total e margem em tempo real.
- **Faturação pendente**, a vista central: encomendas pagas mas ainda por faturar, com um toque para marcar como faturada.
- **Stock de t-shirts em branco**, com o que está a repor em destaque e entrada rápida quando compras mais.
- **Catálogo de desenhos**, com filtros por categoria e estado, e desenhos personalizados de cliente.
- **Clientes**, cujos dados são puxados ao registar uma encomenda.

## Tecnologia

- Next.js (React e TypeScript)
- Tailwind CSS
- Supabase (base de dados e autenticação por email e password)
- Publicação gratuita no Vercel

---

# Guia passo a passo (para quem não percebe de alojamento)

Vais fazer três coisas: criar a base de dados no Supabase, publicar a app no Vercel, e
ligar as duas com duas chaves. Segue pela ordem e não tem como falhar.

## Parte 1: Criar a base de dados no Supabase

1. Vai a `https://supabase.com` e carrega em **Start your project**. Cria conta (podes entrar com o Google).
2. Carrega em **New project**.
   - **Name**: `3sigilos`
   - **Database Password**: inventa uma password forte e guarda-a num sítio seguro.
   - **Region**: escolhe `West EU (London)` ou `Central EU (Frankfurt)`, mais perto de Portugal.
   - Carrega em **Create new project** e espera um ou dois minutos até ficar pronto.

## Parte 2: Criar as tabelas

1. No menu à esquerda, abre **SQL Editor**.
2. Carrega em **New query**.
3. Abre o ficheiro `supabase/setup_completo.sql` deste projeto, copia **tudo** e cola na caixa.
4. Carrega em **Run** (canto inferior direito). Deve aparecer **Success**.

Isto cria as quatro tabelas (t-shirts em branco, desenhos, clientes, encomendas), as
regras de segurança, e já deixa o catálogo com os 14 desenhos mais o Pack Tarot, todos
como "Pronto a estampar". As categorias vêm com um ponto de partida sensato e podes
mudar cada uma dentro da app.

## Parte 3: Criar o teu utilizador (o login só teu)

1. No menu à esquerda, abre **Authentication** e depois **Users**.
2. Carrega em **Add user** e depois **Create new user**.
3. Escreve o teu **email** e uma **password** à tua escolha (é este o login da app).
4. Liga a opção **Auto Confirm User** (assim entras logo, sem email de confirmação).
5. Carrega em **Create user**.

Para garantir que mais ninguém se regista: em **Authentication**, **Sign In / Providers**,
no fornecedor **Email**, desliga a opção **Allow new users to sign up**. A app não tem
ecrã de registo, isto é só uma tranca extra.

## Parte 4: Copiar as duas chaves

1. No menu à esquerda, abre **Project Settings** (o ícone da roda dentada).
2. Abre **Data API**. Copia o **Project URL** (algo como `https://xxxx.supabase.co`).
3. Abre **API Keys**. Copia a chave **anon public** (uma chave longa).

Guarda as duas, vais colá-las no Vercel a seguir. Estas duas chaves podem estar no site
sem problema. Nunca uses a chave `service_role` nesta app.

## Parte 5: Publicar no Vercel

Este código já está no GitHub, no repositório `3sigilos-glitch/3sigilos-`.

1. Vai a `https://vercel.com` e carrega em **Sign up**. Entra com a tua conta do **GitHub**.
2. No painel do Vercel, carrega em **Add New** e depois **Project**.
3. Escolhe o repositório `3sigilos-` e carrega em **Import**.
4. Antes de publicar, abre a secção **Environment Variables** e cola estas duas:

   | Name (nome)                     | Value (valor)                        |
   | ------------------------------- | ------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`      | o Project URL que copiaste           |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave anon public que copiaste     |

   Escreve o nome à esquerda, cola o valor à direita, e faz **Add** para cada uma.
5. Carrega em **Deploy** e espera. No fim, o Vercel dá-te um endereço tipo `https://3sigilos.vercel.app`.

## Parte 6: Dizer ao Supabase qual é o endereço da app

1. Volta ao Supabase, **Authentication**, **URL Configuration**.
2. Em **Site URL**, cola o endereço do Vercel (ex: `https://3sigilos.vercel.app`).
3. Guarda.

## Parte 7: Entrar

Abre o endereço do Vercel no telemóvel ou no computador, escreve o teu email e password,
e já está. No telemóvel, no menu do navegador, escolhe **Adicionar ao ecrã principal**
para ficares com o ícone da app, como se fosse uma aplicação normal.

Sempre que quiseres mudar alguma coisa no código, basta enviar para o GitHub que o Vercel
volta a publicar sozinho.

---

# Correr no teu computador (opcional)

Só precisas disto se quiseres experimentar mudanças antes de publicar.

1. Instala o Node.js (versão 18 ou mais recente).
2. Na pasta do projeto, corre `npm install`.
3. Copia `.env.example` para `.env.local` e preenche com as tuas duas chaves do Supabase.
4. Corre `npm run dev` e abre `http://localhost:3000`.

---

# Notas sobre os cálculos

- **Total** de cada encomenda: preço por peça multiplicado pela quantidade.
- **Margem**: (preço por peça menos custo por peça) multiplicado pela quantidade.
- **Custo por peça** vem a 4 EUR por defeito e fica sempre editável.
- **Preço sugerido** (sempre editável): comunidade ou terreiro 6 EUR, normal 19 EUR, Pack Tarot 50 EUR.
- **Abate de stock**: ao marcar uma encomenda como entregue, desconta do stock as t-shirts
  em branco da cor e tamanho indicados. Se voltares a pôr como "Por estampar", o stock é reposto.
