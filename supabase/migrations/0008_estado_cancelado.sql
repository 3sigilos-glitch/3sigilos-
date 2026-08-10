-- Novo estado de evento: "cancelado" (N'ASA).
--
-- Um concerto confirmado que acaba por nao se realizar (raro). Diferente de
-- "recusado", que e para propostas que nao avancaram. Atualiza a restricao de
-- estados permitidos para incluir "cancelado".

alter table public.eventos drop constraint if exists eventos_estado_check;
alter table public.eventos
  add constraint eventos_estado_check
  check (estado in ('orcamentado', 'pre_reserva', 'confirmado', 'realizado', 'recusado', 'cancelado'));
