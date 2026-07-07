-- Setlists e cifras dos N'ASA.
-- Acrescenta as tabelas cifras, setlists e setlist_musicas, e liga a setlist
-- aos eventos. Mantem a mesma logica de permissoes do resto da aplicacao.

-- ---------------------------------------------------------------------------
-- Cifras: varias versoes por musica (tons e arranjos diferentes).
-- ---------------------------------------------------------------------------
create table if not exists public.cifras (
  id             uuid primary key default gen_random_uuid(),
  musica_id      uuid not null references public.repertorio(id) on delete cascade,
  nome_versao    text not null default 'Versao',
  conteudo       text,                 -- letra, com ou sem acordes (texto original)
  tom            text,
  numero_som     text,
  notas_pessoais text,
  por_defeito    boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists cifras_musica_idx on public.cifras (musica_id);

-- ---------------------------------------------------------------------------
-- Setlists: alinhamentos de musicas.
-- ---------------------------------------------------------------------------
create table if not exists public.setlists (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  por_defeito boolean not null default false,
  criada_por  uuid references public.equipa(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Setlist_musicas: junção que guarda a ordem das musicas na setlist.
-- ---------------------------------------------------------------------------
create table if not exists public.setlist_musicas (
  id          uuid primary key default gen_random_uuid(),
  setlist_id  uuid not null references public.setlists(id) on delete cascade,
  musica_id   uuid not null references public.repertorio(id) on delete cascade,
  ordem       integer not null default 0,
  cifra_id    uuid references public.cifras(id) on delete set null,
  nota_rapida text,
  created_at  timestamptz not null default now()
);

create index if not exists setlist_musicas_setlist_idx on public.setlist_musicas (setlist_id, ordem);

-- ---------------------------------------------------------------------------
-- Eventos: liga uma setlist ao evento (opcional).
-- ---------------------------------------------------------------------------
alter table public.eventos
  add column if not exists setlist_id uuid references public.setlists(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Garante um unico por_defeito: uma setlist por defeito no total, e uma cifra
-- por defeito por musica. Ao marcar uma como por defeito, desmarca as outras.
-- ---------------------------------------------------------------------------
create or replace function public.garantir_setlist_unica_por_defeito()
returns trigger language plpgsql as $$
begin
  if new.por_defeito then
    update public.setlists set por_defeito = false
     where por_defeito and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists tg_setlist_por_defeito on public.setlists;
create trigger tg_setlist_por_defeito
  before insert or update on public.setlists
  for each row execute function public.garantir_setlist_unica_por_defeito();

create or replace function public.garantir_cifra_unica_por_defeito()
returns trigger language plpgsql as $$
begin
  if new.por_defeito then
    update public.cifras set por_defeito = false
     where por_defeito and musica_id = new.musica_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists tg_cifra_por_defeito on public.cifras;
create trigger tg_cifra_por_defeito
  before insert or update on public.cifras
  for each row execute function public.garantir_cifra_unica_por_defeito();

-- ---------------------------------------------------------------------------
-- RLS: mesma regra das tabelas operacionais.
-- Ler e criar e editar por qualquer autenticado, apagar so pelo admin.
-- ---------------------------------------------------------------------------
alter table public.cifras          enable row level security;
alter table public.setlists        enable row level security;
alter table public.setlist_musicas enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['cifras','setlists','setlist_musicas']
  loop
    execute format('drop policy if exists ler_todos on public.%I;', t);
    execute format('drop policy if exists criar_autenticados on public.%I;', t);
    execute format('drop policy if exists editar_autenticados on public.%I;', t);
    execute format('drop policy if exists apagar_admin on public.%I;', t);

    execute format($f$create policy ler_todos on public.%I
      for select to authenticated using (true);$f$, t);
    execute format($f$create policy criar_autenticados on public.%I
      for insert to authenticated with check (true);$f$, t);
    execute format($f$create policy editar_autenticados on public.%I
      for update to authenticated using (true) with check (true);$f$, t);
    execute format($f$create policy apagar_admin on public.%I
      for delete to authenticated using (public.e_admin());$f$, t);
  end loop;
end;
$$;
