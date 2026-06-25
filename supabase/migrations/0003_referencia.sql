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
