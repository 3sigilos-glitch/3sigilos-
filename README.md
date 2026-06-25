# N'ASA | Gestao da banda

Aplicacao web de gestao interna dos N'ASA, banda de covers de rock portugues sediada em Leiria.
Pensada para o telemovel (palco e estrada), partilhada pelos 5 elementos, instalavel como app (PWA).

Tudo em portugues europeu. Estetica escura e crua, com o branco do logotipo a comandar e um unico
acento de palco.

## Stack

- **Next.js** (App Router) e **TypeScript**
- **Supabase**: base de dados Postgres, autenticacao e storage
- Deploy no **Vercel**
- PWA instalavel (manifesto e service worker)

## Estado da construcao

A app esta a ser construida por fases. Concluido ate agora:

- **Fase 1**: projeto Next.js, ligacao ao Supabase, autenticacao dos elementos por link magico,
  tema escuro base, navegacao inferior e app instalavel como PWA.

As fases seguintes (base de dados e permissoes, eventos, painel, contactos, equipa, repertorio,
recibos, propostas e automacoes) chegam a seguir.

## Configurar as variaveis de ambiente

As chaves do Supabase ficam sempre em variaveis de ambiente, nunca no codigo.

1. Cria um projeto em [supabase.com](https://supabase.com).
2. Copia o ficheiro de exemplo:

   ```bash
   cp .env.example .env.local
   ```

3. Preenche o `.env.local` com os valores do teu projeto (em Supabase: Project Settings, API):

   - `NEXT_PUBLIC_SUPABASE_URL`: o Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: a chave anon public
   - `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` em local, ou o dominio do Vercel em producao

O `.env.local` esta ignorado pelo git e nunca deve ir para o repositorio.

## Correr localmente

```bash
npm install
npm run dev
```

A app fica em `http://localhost:3000`.

### Configurar a autenticacao no Supabase

O login e feito por link magico (email, sem palavra-passe). No painel do Supabase:

1. Em **Authentication, URL Configuration**, define o **Site URL** como `http://localhost:3000`
   (e mais tarde o dominio do Vercel).
2. Em **Redirect URLs**, acrescenta `http://localhost:3000/auth/confirmar` (e o equivalente em
   producao).

### Convidar os 5 elementos

Em **Authentication, Users**, usa **Invite user** (ou **Add user**) para cada um dos 5 emails.
Como o login e por link magico, basta o email estar registado para a pessoa conseguir entrar.

## Deploy no Vercel

1. Liga o repositorio em [vercel.com](https://vercel.com) (importar o projeto do GitHub).
2. Em **Settings, Environment Variables**, define as mesmas tres variaveis do `.env.local`,
   com `NEXT_PUBLIC_SITE_URL` a apontar para o dominio de producao.
3. No Supabase, acrescenta o dominio de producao ao **Site URL** e as **Redirect URLs**
   (`https://o-teu-dominio/auth/confirmar`).
4. Faz deploy. O Vercel constroi e publica automaticamente a cada push.

## Instalar no telemovel

Abre a app no browser do telemovel e usa **Adicionar ao ecra inicial**. Fica com icone proprio
e abre em ecra inteiro, com cara de app.

## Logotipos

Coloca os logotipos da banda em:

- `public/logo-branco.svg` (ou .png): usado na interface escura
- `public/logo-preto.svg` (ou .png): usado mais tarde no PDF da proposta (fundo claro)

Enquanto nao existirem, a app mostra um nome desenhado em tipografia (ver `components/Marca.tsx`),
e os icones da PWA usam uma versao provisoria em `public/icons`.

## Estrutura

```
app/                  Rotas (App Router)
  (app)/              Zona autenticada (cabecalho e navegacao inferior partilhados)
    painel/           Painel
    eventos/          Eventos
    contactos/        Contactos
    equipa/           Equipa
    repertorio/       Repertorio
  login/              Ecra de entrada
  auth/               Confirmacao do link magico e fim de sessao
  manifest.ts         Manifesto da PWA
components/           Componentes de interface
lib/supabase/         Ligacao ao Supabase (browser, servidor e middleware)
public/               Ficheiros estaticos, icones e service worker
```
