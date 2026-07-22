-- Escolha pessoal de versao de cifra, por musica (N'ASA).
--
-- Complementa a preferencia por instrumento (0006): cada membro pode, em
-- qualquer musica, escolher a mao a versao que quer ver. Essa escolha manda
-- sobre a automatica (instrumento). E privada: cada um so ve e gere as suas.
--
-- Ordem de decisao ao mostrar uma cifra a um membro:
--   1. escolha manual desta musica (esta tabela)
--   2. versao com a etiqueta do seu instrumento (0006)
--   3. versao base (por_defeito)
--   4. a primeira que houver

create table if not exists public.cifras_escolhidas (
  user_id       uuid not null references auth.users(id) on delete cascade,
  musica_id     uuid not null references public.repertorio(id) on delete cascade,
  cifra_id      uuid not null references public.cifras(id) on delete cascade,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, musica_id)
);

create index if not exists cifras_escolhidas_user_idx on public.cifras_escolhidas (user_id);

alter table public.cifras_escolhidas enable row level security;

-- Cada membro so ve e gere as suas proprias escolhas.
drop policy if exists gerir_escolhas_proprias on public.cifras_escolhidas;
create policy gerir_escolhas_proprias on public.cifras_escolhidas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
