-- Dados de exemplo dos N'ASA.
-- Servem para arrancar com algo na app. Edita ou apaga a vontade depois.
-- So insere se as tabelas estiverem vazias, para nao duplicar em re-execucoes.

-- Equipa: 5 elementos e 2 tecnicos de som (Nuno e Tome).
insert into public.equipa (nome, papel, funcao_instrumento, ativo)
select * from (values
  ('Kevin',  'membro',  'Voz',       true),
  ('Elemento 2', 'membro', 'Guitarra', true),
  ('Elemento 3', 'membro', 'Baixo',    true),
  ('Elemento 4', 'membro', 'Bateria',  true),
  ('Elemento 5', 'membro', 'Teclas',   true),
  ('Nuno',  'tecnico', 'Som',       true),
  ('Tome',  'tecnico', 'Som',       true)
) as v(nome, papel, funcao_instrumento, ativo)
where not exists (select 1 from public.equipa);

-- Escaloes: tabelas de preco base por tipo de contratacao.
insert into public.escaloes (nome, valor_base, condicoes)
select * from (values
  ('Camara ou Junta',        1200.00, 'Concerto completo, som proprio. A confirmar palco e energia.'),
  ('Associacao ou Coletividade', 900.00, 'Apoio a coletividades locais. Som proprio.'),
  ('Festa Motard',           1000.00, 'Concerto em encontro motard, normalmente ao ar livre.'),
  ('Privado ou Empresa',     1500.00, 'Eventos privados, casamentos e empresas.')
) as v(nome, valor_base, condicoes)
where not exists (select 1 from public.escaloes);

-- Atualiza os textos base da proposta nas definicoes.
update public.definicoes set
  texto_proposta_intro = 'Obrigado pelo interesse nos N''ASA, tributo ao rock portugues dos anos 80 e 90. Segue a nossa proposta para o vosso evento.',
  texto_proposta_fecho = 'Ficamos a aguardar a vossa confirmacao. Qualquer duvida, estamos ao dispor.'
where id = 1;

-- Repertorio: amostra de classicos do rock portugues.
insert into public.repertorio (musica, artista_original, decada, ativo)
select * from (values
  ('A Minha Casinha',       'Xutos & Pontapes', '80', true),
  ('Nao Sou o Unico',       'Xutos & Pontapes', '90', true),
  ('Circo de Feras',        'Xutos & Pontapes', '80', true),
  ('Chico Fininho',         'Rui Veloso',       '80', true),
  ('Porto Sentido',         'Rui Veloso',       '80', true),
  ('Dunas',                 'GNR',              '80', true),
  ('Pronuncia do Norte',    'GNR',              '90', true),
  ('Cavalos de Corrida',    'UHF',              '80', true),
  ('Nunca Me Faltaste',     'Delfins',          '90', true),
  ('Eu Sei',                'Resistencia',      '90', true),
  ('Por Teu Livre Pensamento', 'Cancao de Coimbra', '90', true)
) as v(musica, artista_original, decada, ativo)
where not exists (select 1 from public.repertorio);
