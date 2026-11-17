-- Endurecer as funcoes da base de dados (avisos de seguranca do Supabase).
--
-- 1. Quem nao tem sessao (anon) deixa de poder chamar funcoes pela API. Antes,
--    qualquer pessoa com a chave publica da app conseguia chamar, por exemplo,
--    gerar_referencia e gastar numeros de referencia das propostas a toa.
-- 2. As funcoes de gatilho so correm como gatilho; ninguem as chama diretamente.
--    O Postgres nao verifica esta permissao quando um gatilho dispara, por isso
--    os gatilhos continuam a funcionar (testado antes de aplicar).
-- 3. search_path fixo nas funcoes que ainda nao o tinham.
--
-- O que NAO muda: quem tem sessao continua a poder usar e_admin (usada pelas
-- regras de acesso) e gerar_referencia (usada ao gerar propostas).

revoke execute on function public.e_admin() from public, anon;
revoke execute on function public.gerar_referencia() from public, anon;

revoke execute on function public.proteger_campos_perfil() from public, anon, authenticated;
revoke execute on function public.tratar_novo_utilizador() from public, anon, authenticated;
-- O servico de autenticacao do Supabase e quem cria utilizadores (gatilho em
-- auth.users): fica com permissao explicita, por seguranca.
grant execute on function public.tratar_novo_utilizador() to supabase_auth_admin;

alter function public.tocar_atualizado_em() set search_path = public;
alter function public.garantir_setlist_unica_por_defeito() set search_path = public;
alter function public.garantir_cifra_unica_por_defeito() set search_path = public;
