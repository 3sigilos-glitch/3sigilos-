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
