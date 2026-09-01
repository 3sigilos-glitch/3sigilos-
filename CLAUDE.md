# CLAUDE.md

Ficheiro de contexto para o Claude Code. Ler no inicio de cada sessao.

## Instrucoes de eficiencia

- Antes de escrever codigo, mostra sempre um plano ou lista de ficheiros a alterar e espera confirmacao.
- Divide o trabalho em tarefas pequenas e fechadas (uma funcionalidade ou um ficheiro de cada vez), nunca "constroi a app toda de uma vez".
- Le este ficheiro no inicio de cada sessao para relembrar decisoes ja tomadas sobre este projeto (stack, convencoes, particularidades).
- Junta correccoes pequenas num unico pedido quando nao dependem umas das outras, em vez de pedidos isolados repetidos.
- Faz commits pequenos e frequentes, com mensagens claras, e mantem a branch principal sempre estavel.
- Este projeto e usado apenas em Android (sem dispositivos iOS), tem isso em conta em qualquer decisao de UI ou PWA.

## Lingua e escrita

- Tudo em portugues europeu (PT-PT), no codigo, nos comentarios, nos commits e nas respostas.
- Nunca usar travessao em nenhum output.
- Respostas directas, sem rodeios.
- Avisar antes de executar tarefas pesadas ou demoradas.

## Este projeto

**N'ASA Backoffice**: gestao interna dos N'ASA, banda de covers de rock portugues de Leiria. Pensada para o telemovel, partilhada pelos 5 elementos, instalavel como PWA.

- Stack: Next.js 14 (App Router), TypeScript, Supabase (Postgres, autenticacao por link magico, storage), pdf-lib. Deploy no Vercel.
- Permissoes por RLS no Supabase, com dois papeis: admin e membro.
- As chaves do Supabase ficam sempre em variaveis de ambiente, nunca no codigo. Ver `.env.example`.
- Esquema e migracoes em `supabase/`. Alterar a base de dados passa sempre por la.
- App ja completa (fases 1 a 9 fechadas). O que vem a seguir sao afinacoes e uso no dia a dia.
- Estetica escura e crua, o branco do logotipo a comandar e um unico acento de palco.
