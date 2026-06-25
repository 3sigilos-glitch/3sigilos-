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
- **Fase 2**: esquema da base de dados (tabelas, relacoes e valor total calculado), permissoes
  finas com RLS (admin e membro) e dados de exemplo (equipa, escaloes e repertorio).
- **Fase 3**: gestao de eventos (lista em agenda, ficha, criar e editar, valor total ao vivo,
  deslocacao editavel, conflito de data e datas automaticas).
- **Fase 4**: painel com indicadores, pipeline por estado e proximos concertos.
- **Fase 5**: contactos (com historico), equipa (banda e tecnicos) e repertorio.
- **Fase 6**: recibos e resumo fiscal por membro, com lista de recibos por emitir.
- **Fase 7**: propostas (texto pronto a copiar, PDF com a referencia NASA, arquivo no Storage e
  email ao contratante).

As fases seguintes (automacoes e definicoes) chegam a seguir.

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

### Base de dados (esquema, permissoes e dados de exemplo)

O esquema e as permissoes estao em `supabase/migrations` e os dados de exemplo em `supabase/seed.sql`.

A forma mais simples, sem instalar nada:

1. No painel do Supabase, abre **SQL Editor**.
2. Cola e corre, por esta ordem, o conteudo de:
   - `supabase/migrations/0001_esquema.sql` (tabelas e relacoes)
   - `supabase/migrations/0002_rls.sql` (permissoes RLS e criacao automatica de perfis)
   - `supabase/seed.sql` (equipa, escaloes e repertorio de exemplo, opcional)

Corre tambem a migracao `0003_referencia.sql` (geracao da referencia das propostas) e, se quiseres
arquivar os PDF, a `0004_storage.sql` (cria o balde de Storage "propostas" e as suas permissoes).

Em alternativa, com a [CLI do Supabase](https://supabase.com/docs/guides/cli): `supabase db push`.

As permissoes ficam assim: todos os elementos leem tudo e podem criar e editar eventos, contactos,
recibos e repertorio; so o admin pode apagar registos e mexer em equipa, escaloes e definicoes.

### Definir quem e admin

Quando um elemento entra pela primeira vez, e criado automaticamente um perfil com papel `membro`.
Para te tornares admin, corre no **SQL Editor** (troca pelo teu email):

```sql
update public.perfis set papel = 'admin'
where id = (select id from auth.users where email = '3sigilos@gmail.com');
```

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

O logotipo branco da banda ja esta em `public/logo-branco.jpg` e aparece no ecra de entrada (com
mix-blend-mode para o fundo preto desaparecer sobre o tema escuro). A marca no cabecalho usa um
nome desenhado em tipografia (ver `components/Marca.tsx`).

Para o PDF da proposta (fundo claro), coloca o logotipo preto em `public/logo-preto.png` (ou .jpg).
Se nao existir, o PDF usa o nome da banda em tipografia. Ainda falta tambem os icones definitivos
da PWA em `public/icons` (por agora ha uma versao provisoria).

## Propostas

Na ficha de cada evento, em **Proposta**, geras a proposta: e atribuida uma referencia unica no
formato `NASA-{ano}-{numero}` (a comecar em 50, contador em Definicoes), fica marcada a data da
proposta, e podes copiar o texto pronto, ver e arquivar o PDF, e enviar por email. O envio
automatico usa o Resend (ver variaveis de ambiente); sem ele, o botao de rascunho de email abre o
teu cliente de email ja preenchido.

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
