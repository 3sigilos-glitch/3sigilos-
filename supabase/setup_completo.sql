-- =============================================================================
-- 3 Sigilos | Configuracao completa da base de dados
-- -----------------------------------------------------------------------------
-- Cola este ficheiro inteiro no SQL Editor do Supabase e carrega em "Run".
-- Cria as quatro tabelas, as regras de seguranca e o catalogo inicial de
-- desenhos. Pode ser corrido mais do que uma vez sem problemas (e idempotente).
-- =============================================================================


-- =============================================================================
-- 3 Sigilos | Esquema da base de dados
-- Quatro tabelas: t-shirts em branco, desenhos, clientes e encomendas.
-- Pensado para organizacao pessoal, baixo volume, um unico utilizador.
-- =============================================================================

-- Funcao reutilizavel: mantem a coluna atualizado_em sempre certa.
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. T-SHIRTS EM BRANCO
-- O stock real que se gasta a cada encomenda entregue.
-- Cada combinacao de cor e tamanho e unica (para o abate encontrar a linha certa).
-- -----------------------------------------------------------------------------
create table if not exists public.tshirts_brancas (
  id           uuid primary key default gen_random_uuid(),
  cor          text not null,
  tamanho      text not null check (tamanho in ('S', 'M', 'L', 'XL', 'XXL')),
  quantidade   integer not null default 0 check (quantidade >= 0),
  minimo       integer not null default 0 check (minimo >= 0),
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (cor, tamanho)
);

drop trigger if exists tocar_tshirts on public.tshirts_brancas;
create trigger tocar_tshirts
  before update on public.tshirts_brancas
  for each row execute function public.tocar_atualizado_em();

-- -----------------------------------------------------------------------------
-- 2. DESENHOS
-- Catalogo do que esta disponivel para estampar. Sem contagem de unidades.
-- -----------------------------------------------------------------------------
create table if not exists public.desenhos (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  categoria    text not null default 'Personalizado de cliente'
                 check (categoria in ('Umbanda', 'Tarot', 'Mitologia', 'Oculto', 'Personalizado de cliente')),
  estado       text not null default 'Só ideia'
                 check (estado in ('Pronto a estampar', 'Por testar em DTF', 'Só ideia')),
  descricao    text,
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists tocar_desenhos on public.desenhos;
create trigger tocar_desenhos
  before update on public.desenhos
  for each row execute function public.tocar_atualizado_em();

-- -----------------------------------------------------------------------------
-- 3. CLIENTES
-- Dados que se puxam ao registar uma encomenda de um cliente ja existente.
-- -----------------------------------------------------------------------------
create table if not exists public.clientes (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  contacto     text,
  tipo         text not null default 'Normal'
                 check (tipo in ('Normal', 'Terreiro', 'Pontual', 'Cliente marca')),
  morada       text,
  nif          text,
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists tocar_clientes on public.clientes;
create trigger tocar_clientes
  before update on public.clientes
  for each row execute function public.tocar_atualizado_em();

-- -----------------------------------------------------------------------------
-- 4. ENCOMENDAS
-- O total e a margem sao colunas calculadas pela base de dados.
--   total  = preco unitario  x quantidade
--   margem = (preco - custo)  x quantidade
-- preco e custo sao sempre por peca. O custo vem a 4 EUR por defeito, editavel.
-- -----------------------------------------------------------------------------
create table if not exists public.encomendas (
  id               uuid primary key default gen_random_uuid(),
  data             date not null default current_date,
  cliente_id       uuid references public.clientes(id) on delete set null,
  desenho_id       uuid references public.desenhos(id) on delete set null,
  descricao_livre  text,
  cor              text,
  tamanho          text check (tamanho in ('S', 'M', 'L', 'XL', 'XXL')),
  quantidade       integer not null default 1 check (quantidade > 0),
  preco            numeric(10, 2) not null default 0 check (preco >= 0),
  custo            numeric(10, 2) not null default 4 check (custo >= 0),
  metodo_pagamento text check (metodo_pagamento in ('Transferência', 'MB Way', 'Paypal', 'Dinheiro')),
  pago             boolean not null default false,
  data_pagamento   date,
  estado           text not null default 'Por estampar' check (estado in ('Por estampar', 'Entregue')),
  faturado         boolean not null default false,
  data_faturacao   date,
  notas            text,
  -- Controla o abate de stock para nunca abater duas vezes a mesma encomenda.
  stock_abatido    boolean not null default false,
  -- Colunas calculadas: nunca precisam de ser escritas pela aplicacao.
  total            numeric(12, 2) generated always as (preco * quantidade) stored,
  margem           numeric(12, 2) generated always as ((preco - custo) * quantidade) stored,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

drop trigger if exists tocar_encomendas on public.encomendas;
create trigger tocar_encomendas
  before update on public.encomendas
  for each row execute function public.tocar_atualizado_em();

-- Indices uteis para as vistas mais usadas.
create index if not exists idx_encomendas_data on public.encomendas (data desc);
create index if not exists idx_encomendas_estado on public.encomendas (estado);
create index if not exists idx_encomendas_faturacao on public.encomendas (pago, faturado);

-- -----------------------------------------------------------------------------
-- Abate automatico de stock quando a encomenda fica entregue.
-- Procura a t-shirt em branco da mesma cor e tamanho e desconta a quantidade.
-- Se a encomenda deixar de estar entregue, repoe o stock que tinha descontado.
-- -----------------------------------------------------------------------------
create or replace function public.ajustar_stock_encomenda()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    -- Encomenda criada ja como entregue: abate logo.
    -- Excecao: se vier ja marcada como abatida (por exemplo, de uma copia de
    -- seguranca restaurada), respeita esse estado e nao abate outra vez.
    if (new.estado = 'Entregue' and not new.stock_abatido
        and new.cor is not null and new.tamanho is not null) then
      update public.tshirts_brancas
        set quantidade = greatest(quantidade - new.quantidade, 0)
        where cor = new.cor and tamanho = new.tamanho;
      new.stock_abatido := true;
    end if;
    return new;
  end if;

  -- Passou a entregue e ainda nao tinha abatido: desconta o stock.
  if (new.estado = 'Entregue' and not old.stock_abatido) then
    if (new.cor is not null and new.tamanho is not null) then
      update public.tshirts_brancas
        set quantidade = greatest(quantidade - new.quantidade, 0)
        where cor = new.cor and tamanho = new.tamanho;
      new.stock_abatido := true;
    end if;

  -- Deixou de estar entregue e ja tinha abatido: repoe o stock descontado.
  elsif (new.estado <> 'Entregue' and old.stock_abatido) then
    if (old.cor is not null and old.tamanho is not null) then
      update public.tshirts_brancas
        set quantidade = quantidade + old.quantidade
        where cor = old.cor and tamanho = old.tamanho;
    end if;
    new.stock_abatido := false;
  end if;

  return new;
end;
$$;

drop trigger if exists abater_stock on public.encomendas;
create trigger abater_stock
  before insert or update on public.encomendas
  for each row execute function public.ajustar_stock_encomenda();


-- =============================================================================
-- 3 Sigilos | Seguranca ao nivel da linha (Row Level Security)
-- A aplicacao tem um unico utilizador. A regra e simples e segura:
--   qualquer pessoa autenticada tem acesso total aos dados; quem nao tem
--   sessao iniciada nao ve nem altera nada.
-- =============================================================================

alter table public.tshirts_brancas enable row level security;
alter table public.desenhos        enable row level security;
alter table public.clientes        enable row level security;
alter table public.encomendas      enable row level security;

-- Cria, para cada tabela, uma unica politica de acesso total a autenticados.
do $$
declare
  t text;
begin
  foreach t in array array['tshirts_brancas', 'desenhos', 'clientes', 'encomendas']
  loop
    execute format('drop policy if exists acesso_autenticado on public.%I;', t);
    execute format(
      'create policy acesso_autenticado on public.%I
         for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end;
$$;


-- =============================================================================
-- 3 Sigilos | Catalogo inicial de desenhos
-- Pre-carrega os 14 desenhos base mais o Pack Tarot, todos prontos a estampar.
-- As categorias sao um ponto de partida sensato e podem ser editadas na app.
-- So insere se ainda nao existir um desenho com o mesmo nome (idempotente).
-- =============================================================================

insert into public.desenhos (nome, categoria, estado)
select d.nome, d.categoria, 'Pronto a estampar'
from (values
  ('Exu Guardião',      'Umbanda'),
  ('Pombagira Guardiã', 'Umbanda'),
  ('Zé Pilintra',       'Umbanda'),
  ('Maria Navalha',     'Umbanda'),
  ('Celestial Balance', 'Oculto'),
  ('Ciclo Eterno',      'Oculto'),
  ('Mitologia Nórdica', 'Mitologia'),
  ('Força Draconiana',  'Mitologia'),
  ('Ouija',             'Oculto'),
  ('Cards Never Lie',   'Tarot'),
  ('Hécate',            'Mitologia'),
  ('Roda da Fortuna',   'Tarot'),
  ('A Estrela',         'Tarot'),
  ('O Mundo',           'Tarot'),
  ('Pack Tarot',        'Tarot')
) as d(nome, categoria)
where not exists (
  select 1 from public.desenhos existentes where existentes.nome = d.nome
);
