// Entidade de domínio para Contrato
export interface Contract {
  id: string;
  numeroContrato: string;
  fornecedor: string;
  tipoContrato?: string;
  valorContrato: number;
  valorPagamento?: number;
  status?: ContractStatus;
  dataVencimento: Date;
  dataAssinatura?: Date;
  dataPagamento?: Date;
  dataVencimentoPagamento?: Date;
  tipoFluxo: string;
  regiao?: string;
  estado: string;
  municipio?: string;
  areaResponsavel?: string;
  prioridade?: ContractPriority;
  risco?: ContractRisk;
  responsavel?: string;
  // Novos campos para filtros personalizados
  statusPagamento?: PaymentStatus;
  tipoAlerta?: AlertType;
  areaSolicitante?: RequestingArea;
  multa?: number;
}

// Enums para tipagem forte
export type ContractStatus = 'paid' | 'pending' | 'overdue' | 'processing';
export type ContractPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContractRisk = 'Baixo' | 'Médio' | 'Alto';

// Novos enums para filtros personalizados
export type PaymentStatus = 'Aprovado com análise' | 'Aprovado em massa' | 'Pendente' | 'Rejeitado';
export type AlertType = 'Assinatura' | 'Clausulas contraditorias' | 'Contrato aprovado' | 'Dados das partes' | 'Obrigatoriedades legais' | 'Operacional' | 'Pagamento';
export type RequestingArea = 'Compras' | 'Financeiro' | 'Jurídico' | 'Logística' | 'Marketing' | 'RH' | 'Operações';

// Interface para criação de novo contrato
export interface CreateContractData {
  numeroContrato: string;
  fornecedor: string;
  tipoContrato?: string;
  valorContrato: number;
  valorPagamento?: number;
  status?: ContractStatus;
  dataVencimento: Date;
  dataAssinatura?: Date;
  dataPagamento?: Date;
  dataVencimentoPagamento?: Date;
  tipoFluxo: string;
  regiao?: string;
  estado: string;
  municipio?: string;
  areaResponsavel?: string;
  prioridade?: ContractPriority;
  risco?: ContractRisk;
  responsavel?: string;
  // Novos campos
  statusPagamento?: PaymentStatus;
  tipoAlerta?: AlertType;
  areaSolicitante?: RequestingArea;
  multa?: number;
}

// Interface para atualização de contrato
export interface UpdateContractData {
  numeroContrato?: string;
  fornecedor?: string;
  tipoContrato?: string;
  valorContrato?: number;
  valorPagamento?: number;
  status?: ContractStatus;
  dataVencimento?: Date;
  dataAssinatura?: Date;
  dataPagamento?: Date;
  dataVencimentoPagamento?: Date;
  tipoFluxo?: string;
  regiao?: string;
  estado?: string;
  municipio?: string;
  areaResponsavel?: string;
  prioridade?: ContractPriority;
  risco?: ContractRisk;
  responsavel?: string;
  // Novos campos
  statusPagamento?: PaymentStatus;
  tipoAlerta?: AlertType;
  areaSolicitante?: RequestingArea;
  multa?: number;
}

// Filtros para busca de contratos
export interface ContractFilters {
  fornecedor?: string[];
  estado?: string[];
  regiao?: string[];
  tipoFluxo?: string[];
  status?: ContractStatus[];
  valorMin?: number;
  valorMax?: number;
  dataVencimentoInicio?: Date;
  dataVencimentoFim?: Date;
  prioridade?: ContractPriority[];
  risco?: ContractRisk[];
  // Novos filtros personalizados
  statusPagamento?: PaymentStatus[];
  tipoAlerta?: AlertType[];
  areaSolicitante?: RequestingArea[];
  multaMin?: number;
  multaMax?: number;
  municipio?: string;
}
