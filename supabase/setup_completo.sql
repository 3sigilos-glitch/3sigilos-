-- =============================================================
-- N'ASA | Configuracao completa da base de dados
-- Cola tudo isto no SQL Editor do Supabase e carrega em Run.
-- Inclui: esquema, permissoes (RLS), geracao de referencia,
-- balde de Storage para propostas e dados de exemplo.
-- =============================================================

-- ----- 1. ESQUEMA -----
-- Esquema da base de dados dos N'ASA.
-- Postgres (Supabase). Identificadores em UUID, texto e datas com fuso.

-- Funcao auxiliar para manter a coluna atualizado_em sempre certa.
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Equipa: os 5 elementos e os tecnicos de som.
-- ---------------------------------------------------------------------------
create table if not exists public.equipa (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  papel              text not null default 'membro' check (papel in ('membro', 'tecnico')),
  funcao_instrumento text,
  email              text,
  telefone           text,
  foto_url           text,
  ativo              boolean not null default true,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contactos: contratantes e entidades.
-- ---------------------------------------------------------------------------
create table if not exists public.contactos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  entidade      text,
  tipo          text check (tipo in ('camara', 'junta', 'associacao', 'clube_motard', 'empresa', 'privado')),
  telefone      text,
  email         text,
  concelho      text,
  notas         text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Escaloes: tabelas de preco base e condicoes. (configuracao, so admin escreve)
-- ---------------------------------------------------------------------------
create table if not exists public.escaloes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  valor_base    numeric(10, 2) not null default 0,
  condicoes     text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Eventos: a tabela central.
-- ---------------------------------------------------------------------------
create table if not exists public.eventos (
  id                     uuid primary key default gen_random_uuid(),
  referencia             text unique,
  evento                 text not null,
  estado                 text not null default 'orcamentado'
                           check (estado in ('orcamentado', 'pre_reserva', 'confirmado', 'realizado', 'recusado')),
  data                   timestamptz,
  local                  text,
  concelho               text,
  contratante_id         uuid references public.contactos(id) on delete set null,
  quem_tratou_id         uuid references public.equipa(id) on delete set null,
  escalao_id             uuid references public.escaloes(id) on delete set null,
  valor_base             numeric(10, 2) not null default 0,
  deslocacao_valor       numeric(10, 2) default 0,
  deslocacao_descricao   text,
  -- Valor total calculado pela propria base de dados, nunca a mao.
  valor_total            numeric(10, 2)
                           generated always as (coalesce(valor_base, 0) + coalesce(deslocacao_valor, 0)) stored,
  tecnico_id             uuid references public.equipa(id) on delete set null,
  disponibilidade_tecnico text not null default 'por_confirmar'
                           check (disponibilidade_tecnico in ('por_confirmar', 'sim', 'nao')),
  material               text[] not null default '{}',
  data_proposta          date,
  data_aprovacao         date,
  pago                   text not null default 'por_receber' check (pago in ('por_receber', 'recebido')),
  contactos_extra        text,
  notas                  text,
  calendar_event_id      text,
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);

create index if not exists eventos_data_idx on public.eventos (data);
create index if not exists eventos_estado_idx on public.eventos (estado);
create index if not exists eventos_contratante_idx on public.eventos (contratante_id);

-- ---------------------------------------------------------------------------
-- Recibos: por evento e por membro.
-- ---------------------------------------------------------------------------
create table if not exists public.recibos (
  id            uuid primary key default gen_random_uuid(),
  evento_id     uuid references public.eventos(id) on delete cascade,
  membro_id     uuid references public.equipa(id) on delete set null,
  valor         numeric(10, 2) not null default 0,
  data          date,
  passado       boolean not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists recibos_evento_idx on public.recibos (evento_id);
create index if not exists recibos_membro_idx on public.recibos (membro_id);

-- ---------------------------------------------------------------------------
-- Repertorio: biblioteca de musicas.
-- ---------------------------------------------------------------------------
create table if not exists public.repertorio (
  id                uuid primary key default gen_random_uuid(),
  musica            text not null,
  artista_original  text,
  decada            text,
  duracao           text,
  tom               text,
  ativo             boolean not null default true,
  notas             text,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Definicoes: uma unica linha com a configuracao da app. (so admin escreve)
-- ---------------------------------------------------------------------------
create table if not exists public.definicoes (
  id                        smallint primary key default 1 check (id = 1),
  nome_banda                text not null default 'N''ASA',
  localidade_base           text not null default 'Leiria',
  proxima_referencia        integer not null default 50,
  dias_followup             integer not null default 10,
  dias_lembrete_preconcerto integer not null default 15,
  link_materiais            text,
  texto_proposta_intro      text,
  texto_proposta_fecho      text,
  atualizado_em             timestamptz not null default now()
);

-- Garante que existe sempre a linha unica de definicoes.
insert into public.definicoes (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Perfis: liga as contas de autenticacao (auth.users) ao papel admin ou membro.
-- E aqui que vive o controlo fino de permissoes do RLS.
-- ---------------------------------------------------------------------------
create table if not exists public.perfis (
  id        uuid primary key references auth.users(id) on delete cascade,
  papel     text not null default 'membro' check (papel in ('admin', 'membro')),
  equipa_id uuid references public.equipa(id) on delete set null,
  criado_em timestamptz not null default now()
);

-- Gatilhos de atualizado_em nas tabelas que o tem.
do $$
declare
  t text;
begin
  foreach t in array array['equipa','contactos','escaloes','eventos','recibos','repertorio','definicoes']
  loop
    execute format(
      'drop trigger if exists tg_atualizado_em on public.%I;
       create trigger tg_atualizado_em before update on public.%I
       for each row execute function public.tocar_atualizado_em();', t, t);
  end loop;
end;
$$;

-- ----- 2. PERMISSOES (RLS) -----
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

-- ----- 3. REFERENCIA DAS PROPOSTAS -----
-- Geracao da referencia das propostas, no formato NASA-{ano}-{numero}.
-- O contador vive em definicoes.proxima_referencia (comeca em 50).
--
-- A funcao e SECURITY DEFINER de proposito: assim qualquer elemento autenticado
-- consegue gerar uma referencia (que incrementa o contador) sem ter permissao
-- direta para escrever na tabela de definicoes, que continua reservada ao admin.
create or replace function public.gerar_referencia()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ano integer := extract(year from now())::integer;
  numero integer;
begin
  update public.definicoes
     set proxima_referencia = proxima_referencia + 1
   where id = 1
   returning proxima_referencia - 1 into numero;

  -- Caso a linha de definicoes ainda nao exista, cria com o valor inicial.
  if numero is null then
    insert into public.definicoes (id, proxima_referencia) values (1, 51)
      on conflict (id) do update set proxima_referencia = public.definicoes.proxima_referencia + 1;
    numero := 50;
  end if;

  return 'NASA-' || ano::text || '-' || numero::text;
end;
$$;

-- Permite a execucao pelos utilizadores autenticados (e tambem anon, inofensivo).
grant execute on function public.gerar_referencia() to authenticated;

-- ----- 4. STORAGE (PDF das propostas) -----
-- Balde de Storage para arquivar os PDF das propostas.
-- Especifico do Supabase (usa o esquema storage). Correr no SQL Editor do Supabase.

-- Cria o balde "propostas" (privado).
insert into storage.buckets (id, name, public)
values ('propostas', 'propostas', false)
on conflict (id) do nothing;

-- Permissoes: qualquer elemento autenticado pode ler e arquivar propostas;
-- so o admin pode apagar ficheiros, em linha com o resto da aplicacao.
drop policy if exists propostas_ler on storage.objects;
drop policy if exists propostas_escrever on storage.objects;
drop policy if exists propostas_atualizar on storage.objects;
drop policy if exists propostas_apagar on storage.objects;

create policy propostas_ler on storage.objects
  for select to authenticated using (bucket_id = 'propostas');

create policy propostas_escrever on storage.objects
  for insert to authenticated with check (bucket_id = 'propostas');

create policy propostas_atualizar on storage.objects
  for update to authenticated using (bucket_id = 'propostas') with check (bucket_id = 'propostas');

create policy propostas_apagar on storage.objects
  for delete to authenticated using (bucket_id = 'propostas' and public.e_admin());

-- ----- 5. DADOS DE EXEMPLO (podes apagar depois) -----
-- Dados de exemplo dos N'ASA.
-- Servem para arrancar com algo na app. Edita ou apaga a vontade depois.
-- So insere se as tabelas estiverem vazias, para nao duplicar em re-execucoes.

-- Equipa: 5 elementos e 2 tecnicos de som (Nuno e Tome).
insert into public.equipa (nome, papel, funcao_instrumento, ativo)
select * from (values
  ('Kevin',  'membro',  'Voz',       true),
  ('Elemento 2', 'membro', 'Guitarra', true),
  ('Elemento 3', 'membro', 'Baixo',    true),
  ('Elemento 4', 'membro', 'Bateria',  true),
  ('Elemento 5', 'membro', 'Teclas',   true),
  ('Nuno',  'tecnico', 'Som',       true),
  ('Tome',  'tecnico', 'Som',       true)
) as v(nome, papel, funcao_instrumento, ativo)
where not exists (select 1 from public.equipa);

-- Escaloes: tabelas de preco base por tipo de contratacao.
insert into public.escaloes (nome, valor_base, condicoes)
select * from (values
  ('Camara ou Junta',        1200.00, 'Concerto completo, som proprio. A confirmar palco e energia.'),
  ('Associacao ou Coletividade', 900.00, 'Apoio a coletividades locais. Som proprio.'),
  ('Festa Motard',           1000.00, 'Concerto em encontro motard, normalmente ao ar livre.'),
  ('Privado ou Empresa',     1500.00, 'Eventos privados, casamentos e empresas.')
) as v(nome, valor_base, condicoes)
where not exists (select 1 from public.escaloes);

-- Atualiza os textos base da proposta nas definicoes.
update public.definicoes set
  texto_proposta_intro = 'Obrigado pelo interesse nos N''ASA, tributo ao rock portugues dos anos 80 e 90. Segue a nossa proposta para o vosso evento.',
  texto_proposta_fecho = 'Ficamos a aguardar a vossa confirmacao. Qualquer duvida, estamos ao dispor.'
where id = 1;

-- Repertorio: amostra de classicos do rock portugues.
insert into public.repertorio (musica, artista_original, decada, ativo)
select * from (values
  ('A Minha Casinha',       'Xutos & Pontapes', '80', true),
  ('Nao Sou o Unico',       'Xutos & Pontapes', '90', true),
  ('Circo de Feras',        'Xutos & Pontapes', '80', true),
  ('Chico Fininho',         'Rui Veloso',       '80', true),
  ('Porto Sentido',         'Rui Veloso',       '80', true),
  ('Dunas',                 'GNR',              '80', true),
  ('Pronuncia do Norte',    'GNR',              '90', true),
  ('Cavalos de Corrida',    'UHF',              '80', true),
  ('Nunca Me Faltaste',     'Delfins',          '90', true),
  ('Eu Sei',                'Resistencia',      '90', true),
  ('Por Teu Livre Pensamento', 'Cancao de Coimbra', '90', true)
) as v(musica, artista_original, decada, ativo)
where not exists (select 1 from public.repertorio);

-- ----- 6. SETLISTS E CIFRAS -----
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
