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
- **Fase 8**: automacoes (follow-up de propostas paradas, lembretes pre-concerto e briefings de
  semana e mes, com texto pronto a copiar e envio por email a banda).
- **Fase 9**: definicoes de admin (parametros, textos da proposta e escaloes), afinacao visual e
  preparacao do deploy no Vercel.

A aplicacao esta completa. As fases seguintes sao so afinacoes e o uso no dia a dia.

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

### Lista rapida de verificacao do deploy

- [ ] Variaveis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e NEXT_PUBLIC_SITE_URL
- [ ] Migracoes 0001 a 0004 corridas no Supabase
- [ ] Site URL e Redirect URLs do Supabase a apontar para o dominio de producao
- [ ] Os 5 elementos convidados e o teu perfil definido como admin
- [ ] Opcional: RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY e CRON_SECRET para email e lembretes

## Instalar no telemovel

### Opcao rapida (PWA)

Abre a app no browser do telemovel e usa **Adicionar ao ecra inicial**. Fica com icone proprio
e abre em ecra inteiro, com cara de app. Nao precisa de nada mais.

### App Android instalavel (APK, opcional)

Para um APK de verdade (que da para instalar diretamente e ate publicar na Play Store), a app usa
uma TWA (a app Android abre esta PWA em ecra inteiro). A forma mais simples, sem instalar nada:

1. Vai a [pwabuilder.com](https://www.pwabuilder.com) e mete o endereco da app (o dominio do Vercel).
2. Escolhe **Android** e gera o pacote. Descarrega o zip.
3. No zip vem o APK (e o AAB para a Play Store) e os dados de assinatura. Anota o **nome do pacote**
   e a **impressao digital SHA256** do certificado (ficam no ficheiro assetlinks.json que o
   PWABuilder inclui).
4. No Vercel, em **Settings, Environment Variables**, define:
   - `ANDROID_PACKAGE_NAME` (por exemplo pt.nasa.gestao)
   - `ANDROID_CERT_SHA256` (a impressao digital; varias separam-se por virgulas)
   Faz novo deploy.
5. A app passa a servir `/.well-known/assetlinks.json` com esses valores, e a app Android abre em
   ecra inteiro, sem a barra do browser.

Instala o APK no telemovel (ativando **Instalar apps desconhecidas** para o teu gestor de ficheiros)
ou publica na Play Store com o AAB.

## Logotipos

O logotipo branco da banda esta em `public/logo-branco.jpg` e aparece no ecra de entrada (com
mix-blend-mode para o fundo preto desaparecer sobre o tema escuro). A marca no cabecalho usa um
nome desenhado em tipografia (ver `components/Marca.tsx`).

O logotipo preto (`public/logo-preto.png`, gerado a partir do branco) e usado no PDF da proposta.
Os icones da PWA em `public/icons` (192, 512 e maskable, mais o apple-touch-icon) ja estao feitos
a partir do emblema da banda.

O logotipo preto do PDF e os icones da PWA ja estao no repositorio. Se quiseres trocar por versoes
oficiais, substitui `public/logo-preto.png` e os ficheiros em `public/icons`.

## Copias de seguranca

Em **Definicoes** (so admin), na seccao Copias de seguranca:

- **Descarregar**: guarda num ficheiro JSON toda a informacao (eventos, contactos, equipa,
  escaloes, repertorio, recibos e definicoes). Guarda esse ficheiro num sitio seguro, de vez em
  quando.
- **Restaurar**: carrega um ficheiro descarregado antes. Os registos com o mesmo identificador sao
  atualizados e os que faltam sao criados, sem apagar o que ja existe.

### Backup semanal automatico por email

O ficheiro `vercel.json` agenda o Vercel Cron para, todas as segundas as 8h, chamar
`/api/cron/backup`, que exporta toda a informacao e a envia por email com o JSON em anexo.
Para funcionar, define no Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`,
`CRON_SECRET` e, se quiseres mudar o destinatario, `BACKUP_EMAIL` (por omissao,
casakmsm.ai@gmail.com). O assunto do email e "Backup N'ASA Backoffice app".

## Automacoes

Em **Automacoes** (atalho no painel) tens, sempre prontos a copiar para o WhatsApp:

- **Follow-up**: propostas em orcamentado paradas ha mais dias do que o definido, com um texto de
  reforco para o contratante.
- **Lembretes pre-concerto**: concertos confirmados a chegar dentro da janela definida.
- **Briefings**: agenda da semana e do mes, com opcao de envio por email a toda a banda.

Para envio automatico agendado (sem ser a mao), o ficheiro `vercel.json` ja agenda o Vercel Cron
para chamar `/api/cron/lembretes` todos os dias as 9h. Para funcionar, define no Vercel as variaveis
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e, por seguranca, `CRON_SECRET`.

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
