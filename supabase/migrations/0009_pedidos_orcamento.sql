-- Pedidos de orcamento e disponibilidade da banda (N'ASA).
--
-- Fluxo que esta migracao prepara (so a base de dados, sem interface):
--   1. Um contratante preenche um formulario publico  ->  linha em pedidos_orcamento.
--   2. A propria base de dados abre uma linha de resposta por cada elemento da
--      banda ativo  ->  linhas em disponibilidade_respostas com estado 'pendente'.
--   3. Cada elemento responde mais tarde (push ou Telegram) e a linha passa a
--      'disponivel' ou 'indisponivel'.
--
-- Nao ha tabela "membros" nova: os elementos ja vivem em public.equipa, que
-- ganha aqui as duas colunas necessarias ao aviso (Telegram e Web Push).
-- Nao ha tabela "propostas": a proposta e o proprio evento (public.eventos),
-- por isso o pedido liga-se ao evento que vier a ser criado a partir dele.

-- ---------------------------------------------------------------------------
-- Equipa: canais de aviso de cada elemento.
-- ---------------------------------------------------------------------------
alter table public.equipa
  add column if not exists telegram_chat_id  text,
  -- Objeto de subscricao Web Push tal como o browser o devolve (endpoint e keys).
  add column if not exists push_subscription jsonb;

-- ---------------------------------------------------------------------------
-- Pedidos de orcamento: entram pelo formulario publico do site.
-- ---------------------------------------------------------------------------
create table if not exists public.pedidos_orcamento (
  id                 uuid primary key default gen_random_uuid(),
  criado_em          timestamptz not null default now(),
  nome_contacto      text not null,
  email_contacto     text not null,
  telefone_contacto  text,
  data_evento        date not null,
  local              text not null,
  tipo_evento        text,
  -- Texto livre por agora. Os escaloes reais vivem em public.escaloes e a
  -- ligacao formal fica para quando o formulario existir.
  escalao_preco      text,
  estado             text not null default 'pendente'
                       check (estado in ('pendente', 'confirmado', 'recusado')),
  -- O evento (proposta) criado a partir deste pedido, quando avancar.
  evento_id          uuid references public.eventos(id) on delete set null
);

create index if not exists pedidos_orcamento_estado_idx on public.pedidos_orcamento (estado);
create index if not exists pedidos_orcamento_data_idx   on public.pedidos_orcamento (data_evento);
create index if not exists pedidos_orcamento_evento_idx on public.pedidos_orcamento (evento_id);

-- ---------------------------------------------------------------------------
-- Disponibilidade: uma linha por pedido e por elemento da banda.
-- ---------------------------------------------------------------------------
create table if not exists public.disponibilidade_respostas (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references public.pedidos_orcamento(id) on delete cascade,
  membro_id     uuid not null references public.equipa(id) on delete cascade,
  estado        text not null default 'pendente'
                  check (estado in ('pendente', 'disponivel', 'indisponivel')),
  respondido_em timestamptz,
  -- Por onde chegou a resposta. Fica vazio ate haver resposta.
  canal         text check (canal in ('push', 'telegram')),
  constraint disponibilidade_respostas_pedido_membro_key unique (pedido_id, membro_id)
);

create index if not exists disponibilidade_respostas_pedido_idx on public.disponibilidade_respostas (pedido_id);
create index if not exists disponibilidade_respostas_membro_idx on public.disponibilidade_respostas (membro_id);

-- ---------------------------------------------------------------------------
-- Ao entrar um pedido, abre logo uma linha de resposta por elemento ativo.
-- So os membros da banda: a disponibilidade do tecnico de som ja e tratada no
-- proprio evento (eventos.disponibilidade_tecnico).
-- SECURITY DEFINER para o gatilho funcionar mesmo que o insert venha de uma
-- sessao sem permissao de escrita em disponibilidade_respostas.
-- ---------------------------------------------------------------------------
create or replace function public.abrir_disponibilidade_do_pedido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.disponibilidade_respostas (pedido_id, membro_id, estado)
  select new.id, e.id, 'pendente'
    from public.equipa e
   where e.ativo and e.papel = 'membro'
  on conflict (pedido_id, membro_id) do nothing;
  return null;
end;
$$;

drop trigger if exists tg_abrir_disponibilidade on public.pedidos_orcamento;
create trigger tg_abrir_disponibilidade
  after insert on public.pedidos_orcamento
  for each row execute function public.abrir_disponibilidade_do_pedido();

-- ---------------------------------------------------------------------------
-- RLS: mesma regra das tabelas operacionais.
-- Ler, criar e editar por qualquer autenticado, apagar so pelo admin.
--
-- Nao ha politica de insert para anon: o formulario publico vai escrever pela
-- rota de API com a service key (ver lib/supabase/admin.ts), que passa ao lado
-- do RLS. Assim a validacao e a defesa contra spam ficam do lado do servidor.
-- ---------------------------------------------------------------------------
alter table public.pedidos_orcamento        enable row level security;
alter table public.disponibilidade_respostas enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['pedidos_orcamento','disponibilidade_respostas']
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
