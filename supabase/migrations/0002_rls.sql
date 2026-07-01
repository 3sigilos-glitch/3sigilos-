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
