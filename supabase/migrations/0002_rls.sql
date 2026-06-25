-- Row Level Security (RLS) dos N'ASA.
--
-- Regra de ouro:
--  - Todos os autenticados podem LER tudo.
--  - Todos os autenticados podem CRIAR e EDITAR eventos, contactos, recibos e repertorio.
--  - So o admin pode APAGAR registos e escrever em equipa, escaloes e definicoes.
-- Assim os 5 elementos trabalham em tempo real sem destruir a estrutura.

-- Funcao que diz se a conta atual e admin.
-- SECURITY DEFINER para poder ler perfis sem cair em recursao de RLS.
create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and papel = 'admin'
  );
$$;

-- Cria automaticamente o perfil (papel membro) quando nasce uma conta nova.
create or replace function public.tratar_novo_utilizador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, papel)
  values (new.id, 'membro')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_utilizador on auth.users;
create trigger ao_criar_utilizador
  after insert on auth.users
  for each row execute function public.tratar_novo_utilizador();

-- Ativa o RLS em todas as tabelas.
alter table public.equipa     enable row level security;
alter table public.contactos  enable row level security;
alter table public.escaloes   enable row level security;
alter table public.eventos    enable row level security;
alter table public.recibos    enable row level security;
alter table public.repertorio enable row level security;
alter table public.definicoes enable row level security;
alter table public.perfis     enable row level security;

-- ---------------------------------------------------------------------------
-- Tabelas operacionais: ler todos, criar/editar todos, apagar so admin.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['eventos','contactos','recibos','repertorio']
  loop
    execute format('drop policy if exists ler_todos on public.%I;', t);
    execute format('drop policy if exists criar_autenticados on public.%I;', t);
    execute format('drop policy if exists editar_autenticados on public.%I;', t);
    execute format('drop policy if exists apagar_admin on public.%I;', t);

    -- Ler: qualquer autenticado.
    execute format($f$create policy ler_todos on public.%I
      for select to authenticated using (true);$f$, t);
    -- Criar: qualquer autenticado.
    execute format($f$create policy criar_autenticados on public.%I
      for insert to authenticated with check (true);$f$, t);
    -- Editar: qualquer autenticado.
    execute format($f$create policy editar_autenticados on public.%I
      for update to authenticated using (true) with check (true);$f$, t);
    -- Apagar: so admin.
    execute format($f$create policy apagar_admin on public.%I
      for delete to authenticated using (public.e_admin());$f$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tabelas de configuracao e estrutura: ler todos, escrever so admin.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['equipa','escaloes','definicoes']
  loop
    execute format('drop policy if exists ler_todos on public.%I;', t);
    execute format('drop policy if exists escrever_admin on public.%I;', t);

    execute format($f$create policy ler_todos on public.%I
      for select to authenticated using (true);$f$, t);
    -- Toda a escrita (criar, editar, apagar) fica reservada ao admin.
    execute format($f$create policy escrever_admin on public.%I
      for all to authenticated using (public.e_admin()) with check (public.e_admin());$f$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfis: cada um le o seu, o admin le e gere todos.
-- ---------------------------------------------------------------------------
drop policy if exists ler_perfis on public.perfis;
drop policy if exists gerir_perfis_admin on public.perfis;

create policy ler_perfis on public.perfis
  for select to authenticated
  using (id = auth.uid() or public.e_admin());

create policy gerir_perfis_admin on public.perfis
  for all to authenticated
  using (public.e_admin())
  with check (public.e_admin());
