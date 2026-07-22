// Tipos do dominio dos N'ASA, a espelhar o esquema da base de dados.
// Servem para acesso tipado ao Supabase e para reutilizar rotulos em PT-PT.

export type Papel = 'membro' | 'tecnico';
export type PapelConta = 'admin' | 'membro';
export type TipoContacto = 'camara' | 'junta' | 'associacao' | 'clube_motard' | 'empresa' | 'privado';
export type EstadoEvento = 'orcamentado' | 'pre_reserva' | 'confirmado' | 'realizado' | 'recusado';
export type DisponibilidadeTecnico = 'por_confirmar' | 'sim' | 'nao';
export type EstadoPagamento = 'por_receber' | 'recebido';

export interface Equipa {
  id: string;
  nome: string;
  papel: Papel;
  funcao_instrumento: string | null;
  email: string | null;
  telefone: string | null;
  foto_url: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Contacto {
  id: string;
  nome: string;
  entidade: string | null;
  tipo: TipoContacto | null;
  telefone: string | null;
  email: string | null;
  concelho: string | null;
  notas: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Escalao {
  id: string;
  nome: string;
  valor_base: number;
  condicoes: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Evento {
  id: string;
  referencia: string | null;
  evento: string;
  estado: EstadoEvento;
  data: string | null;
  local: string | null;
  concelho: string | null;
  contratante_id: string | null;
  quem_tratou_id: string | null;
  escalao_id: string | null;
  valor_base: number;
  deslocacao_valor: number | null;
  deslocacao_descricao: string | null;
  valor_total: number; // calculado pela base de dados
  tecnico_id: string | null;
  disponibilidade_tecnico: DisponibilidadeTecnico;
  material: string[];
  data_proposta: string | null;
  data_aprovacao: string | null;
  pago: EstadoPagamento;
  contactos_extra: string | null;
  notas: string | null;
  calendar_event_id: string | null;
  setlist_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Recibo {
  id: string;
  evento_id: string | null;
  membro_id: string | null;
  valor: number;
  data: string | null;
  passado: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Repertorio {
  id: string;
  musica: string;
  artista_original: string | null;
  decada: string | null;
  duracao: string | null;
  tom: string | null;
  ativo: boolean;
  notas: string | null;
  criado_em: string;
  atualizado_em: string;
}

// Varias versoes de cifra por musica (tons e arranjos diferentes).
export interface Cifra {
  id: string;
  musica_id: string;
  nome_versao: string;
  conteudo: string | null; // texto original da cifra (letra com ou sem acordes)
  tom: string | null;
  numero_som: string | null;
  notas_pessoais: string | null;
  por_defeito: boolean;
  created_at: string;
}

// Alinhamento de musicas (setlist).
export interface Setlist {
  id: string;
  nome: string;
  descricao: string | null;
  por_defeito: boolean;
  criada_por: string | null;
  created_at: string;
}

// Junção que guarda a ordem das musicas na setlist.
export interface SetlistMusica {
  id: string;
  setlist_id: string;
  musica_id: string;
  ordem: number;
  cifra_id: string | null;
  nota_rapida: string | null;
  created_at: string;
}

export interface Definicoes {
  id: number;
  nome_banda: string;
  localidade_base: string;
  proxima_referencia: number;
  dias_followup: number;
  dias_lembrete_preconcerto: number;
  link_materiais: string | null;
  texto_proposta_intro: string | null;
  texto_proposta_fecho: string | null;
  atualizado_em: string;
}

export interface Perfil {
  id: string;
  papel: PapelConta;
  equipa_id: string | null;
  criado_em: string;
  // Preferencias de cifra por login (ver migracao 0006).
  cifra_tag: string | null;
  cifra_esconder_acordes: boolean;
  cifra_so_tonica: boolean;
  cifra_tamanho: number;
}

// Etiquetas sugeridas para as versoes de cifra, por instrumento. Guiam o nome
// da versao (nome_versao) e a preferencia de cada membro. Nao sao obrigatorias.
export const TAGS_CIFRA = ['GERAL', 'VOZ', 'GUITARRA', 'BAIXO', 'TECLAS', 'BATERIA'] as const;

// -----------------------------------------------------------------------------
// Rotulos em PT-PT e cores dos estados, para usar na interface.
// -----------------------------------------------------------------------------

export const ESTADO_EVENTO: Record<EstadoEvento, { rotulo: string; corVar: string }> = {
  orcamentado: { rotulo: 'Orcamentado', corVar: 'var(--estado-orcamentado)' },
  pre_reserva: { rotulo: 'Pre-reserva', corVar: 'var(--estado-pre-reserva)' },
  confirmado: { rotulo: 'Confirmado', corVar: 'var(--estado-confirmado)' },
  realizado: { rotulo: 'Realizado', corVar: 'var(--estado-realizado)' },
  recusado: { rotulo: 'Recusado', corVar: 'var(--estado-recusado)' },
};

export const TIPO_CONTACTO: Record<TipoContacto, string> = {
  camara: 'Camara',
  junta: 'Junta',
  associacao: 'Associacao',
  clube_motard: 'Clube motard',
  empresa: 'Empresa',
  privado: 'Privado',
};

export const DISPONIBILIDADE_TECNICO: Record<DisponibilidadeTecnico, string> = {
  por_confirmar: 'Por confirmar',
  sim: 'Disponivel',
  nao: 'Indisponivel',
};

export const ESTADO_PAGAMENTO: Record<EstadoPagamento, string> = {
  por_receber: 'Por receber',
  recebido: 'Recebido',
};
