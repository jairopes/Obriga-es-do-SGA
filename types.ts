
export enum Status {
  VIGENTE = 'VIGENTE',
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM ANDAMENTO',
  CONCLUIDO = 'CONCLUÍDO'
}

export enum Empresa {
  CAMPLUVAS = 'CAMPLUVAS',
  LOCATEX = 'LOCATEX'
}

export interface Obligation {
  id: string;
  periodicidade: string;
  dataInicio: string;
  dataFinal: string;
  orgao: string;
  tipo: string;
  numeroDocumento: string;
  validadeDocumento: string;
  nomeDocumento: string;
  empresa: Empresa;
  acao: string;
  status: Status;
  dataConclusao: string;
  responsavel: string;
  observacoes: string;
  createdAt: number;
}

export type NewObligation = Omit<Obligation, 'id' | 'createdAt'>;
