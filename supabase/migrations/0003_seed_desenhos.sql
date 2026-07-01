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
