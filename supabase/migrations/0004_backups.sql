-- =============================================================================
-- 3 Sigilos | Suporte a copias de seguranca (restauro)
-- Atualiza a funcao de abate de stock para NAO voltar a descontar o stock
-- quando se restaura uma encomenda que ja vinha marcada como abatida.
-- Correr este ficheiro so e necessario se ja tinhas corrido o setup antigo;
-- o setup_completo.sql atual ja inclui esta versao.
-- =============================================================================

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
