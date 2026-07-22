-- Preferencias de cifra por membro (N'ASA).
--
-- Cada login passa a poder escolher COMO quer ver as cifras no modo palco,
-- sem alterar as cifras partilhadas. Ideia:
--  - As cifras continuam partilhadas por todos (colaborativo). A versao de cada
--    musica pode ter um nome/etiqueta por instrumento (por exemplo "BAIXO",
--    "TECLAS", "VOZ"), a par de uma versao "GERAL" por defeito.
--  - Cada membro guarda no seu perfil a etiqueta preferida e as opcoes de
--    visualizacao. No modo palco, a app escolhe automaticamente a versao com a
--    etiqueta do membro (senao, a versao por defeito) e aplica as suas opcoes.
--
-- Isto e privado ao proprio login: a regra de leitura de perfis ja so deixa
-- cada um ver a sua propria linha (ver 0002_rls.sql).

-- ---------------------------------------------------------------------------
-- Colunas de preferencia no perfil (com valores por defeito seguros).
-- ---------------------------------------------------------------------------
alter table public.perfis
  add column if not exists cifra_tag              text,
  add column if not exists cifra_esconder_acordes boolean not null default false,
  add column if not exists cifra_so_tonica        boolean not null default false,
  add column if not exists cifra_tamanho          integer not null default 18;

-- ---------------------------------------------------------------------------
-- Cada membro pode atualizar a SUA propria linha (para guardar preferencias).
-- Junta-se a politica de admin ja existente (gerir_perfis_admin), que continua
-- a permitir ao admin gerir qualquer perfil.
-- ---------------------------------------------------------------------------
drop policy if exists atualizar_proprio_perfil on public.perfis;
create policy atualizar_proprio_perfil on public.perfis
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Barreira de seguranca: ao permitir que o membro atualize a sua linha, e
-- preciso impedir que se promova a admin ou mexa no vinculo a equipa. Este
-- trigger forca papel e equipa_id a manterem-se, excepto se quem edita for
-- admin. Ou seja: um membro so consegue mexer nas preferencias de cifra.
-- ---------------------------------------------------------------------------
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.e_admin() then
    new.papel := old.papel;
    new.equipa_id := old.equipa_id;
  end if;
  return new;
end;
$$;

drop trigger if exists tg_proteger_perfil on public.perfis;
create trigger tg_proteger_perfil
  before update on public.perfis
  for each row execute function public.proteger_campos_perfil();
