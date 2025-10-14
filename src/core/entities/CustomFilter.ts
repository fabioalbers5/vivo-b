// Entidade de domínio para Filtros Personalizados
export interface CustomFilter {
  id: string;
  nomeFiltro: string;
  tabelaOrigem: string;
  campoOrigem: string;
  tipo: FilterType;
  configuracoes: FilterConfiguration;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

// Tipos de filtros suportados
export type FilterType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'range' 
  | 'boolean';

// Configurações específicas para cada tipo de filtro
export interface FilterConfiguration {
  // Para filtros de texto
  placeholder?: string;
  
  // Para filtros de seleção
  options?: FilterOption[];
  
  // Para filtros de range
  min?: number;
  max?: number;
  step?: number;
  
  // Para filtros de data
  dateFormat?: string;
  
  // Configurações gerais
  required?: boolean;
  defaultValue?: any;
  label?: string;
  description?: string;
}

export interface FilterOption {
  value: string | number;
  label: string;
}

// Interface para criação de filtro personalizado
export interface CreateCustomFilterData {
  nomeFiltro: string;
  tabelaOrigem: string;
  campoOrigem: string;
  tipo: FilterType;
  configuracoes: FilterConfiguration;
}

// Interface para atualização de filtro personalizado
export interface UpdateCustomFilterData {
  nomeFiltro?: string;
  tabelaOrigem?: string;
  campoOrigem?: string;
  tipo?: FilterType;
  configuracoes?: FilterConfiguration;
}
