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
