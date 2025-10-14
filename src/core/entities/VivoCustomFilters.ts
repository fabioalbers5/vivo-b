import { FilterType, FilterConfiguration } from './CustomFilter';
import { PaymentStatus, AlertType, RequestingArea, ContractRisk } from './Contract';

// Tipos específicos para os filtros personalizados do sistema Vivo
export type VivoFilterField = 
  | 'status_pagamento' 
  | 'tipo_alerta' 
  | 'area_solicitante' 
  | 'risco' 
  | 'multa' 
  | 'municipio';

// Configurações específicas para cada campo de filtro do Vivo
export interface VivoFilterConfigurations {
  status_pagamento: {
    type: 'select';
    options: Array<{ value: PaymentStatus; label: PaymentStatus }>;
    multiple: boolean;
  };
  tipo_alerta: {
    type: 'select';
    options: Array<{ value: AlertType; label: AlertType }>;
    multiple: boolean;
  };
  area_solicitante: {
    type: 'select';
    options: Array<{ value: RequestingArea; label: RequestingArea }>;
    multiple: boolean;
  };
  risco: {
    type: 'select';
    options: Array<{ value: ContractRisk; label: ContractRisk }>;
    multiple: boolean;
  };
  multa: {
    type: 'range';
    min: number;
    max: number;
    step: number;
    currency: true;
    inputs: boolean; // Se permite inputs numéricos manuais
  };
  municipio: {
    type: 'text';
    placeholder: string;
    searchMode: 'ilike' | 'unaccent'; // Para busca sem acentuação
  };
}

// Factory para criar configurações de filtros do Vivo
export class VivoFilterConfigFactory {
  private static readonly PAYMENT_STATUS_OPTIONS: Array<{ value: PaymentStatus; label: PaymentStatus }> = [
    { value: 'Aprovado com análise', label: 'Aprovado com análise' },
    { value: 'Aprovado em massa', label: 'Aprovado em massa' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Rejeitado', label: 'Rejeitado' }
  ];

  private static readonly ALERT_TYPE_OPTIONS: Array<{ value: AlertType; label: AlertType }> = [
    { value: 'Assinatura', label: 'Assinatura' },
    { value: 'Clausulas contraditorias', label: 'Clausulas contraditorias' },
    { value: 'Contrato aprovado', label: 'Contrato aprovado' },
    { value: 'Dados das partes', label: 'Dados das partes' },
    { value: 'Obrigatoriedades legais', label: 'Obrigatoriedades legais' },
    { value: 'Operacional', label: 'Operacional' },
    { value: 'Pagamento', label: 'Pagamento' }
  ];

  private static readonly REQUESTING_AREA_OPTIONS: Array<{ value: RequestingArea; label: RequestingArea }> = [
    { value: 'Compras', label: 'Compras' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Jurídico', label: 'Jurídico' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'RH' },
    { value: 'Operações', label: 'Operações' }
  ];

  private static readonly RISK_OPTIONS: Array<{ value: ContractRisk; label: ContractRisk }> = [
    { value: 'Baixo', label: 'Baixo' },
    { value: 'Médio', label: 'Médio' },
    { value: 'Alto', label: 'Alto' }
  ];

  static getConfiguration(field: VivoFilterField): FilterConfiguration {
    switch (field) {
      case 'status_pagamento':
        return {
          label: 'Status do Pagamento',
          description: 'Status de aprovação do pagamento do contrato',
          options: this.PAYMENT_STATUS_OPTIONS,
          required: false
        };

      case 'tipo_alerta':
        return {
          label: 'Tipo de Alerta',
          description: 'Categoria do alerta gerado para o contrato',
          options: this.ALERT_TYPE_OPTIONS,
          required: false
        };

      case 'area_solicitante':
        return {
          label: 'Área Solicitante',
          description: 'Área organizacional que solicitou o contrato',
          options: this.REQUESTING_AREA_OPTIONS,
          required: false
        };

      case 'risco':
        return {
          label: 'Nível de Risco',
          description: 'Classificação de risco do contrato',
          options: this.RISK_OPTIONS,
          required: false
        };

      case 'multa':
        return {
          label: 'Valor da Multa',
          description: 'Faixa de valor da multa contratual (R$ 0 - R$ 1.000.000)',
          min: 0,
          max: 1000000,
          step: 1000,
          defaultValue: [0, 1000000],
          required: false
        };

      case 'municipio':
        return {
          label: 'Município',
          description: 'Nome do município do contrato',
          placeholder: 'Digite o nome do município...',
          required: false
        };

      default:
        throw new Error(`Configuração não encontrada para o campo: ${field}`);
    }
  }

  static getFilterType(field: VivoFilterField): FilterType {
    switch (field) {
      case 'status_pagamento':
      case 'tipo_alerta':
      case 'area_solicitante':
      case 'risco':
        return 'multiselect';
      case 'multa':
        return 'range';
      case 'municipio':
        return 'text';
      default:
        throw new Error(`Tipo de filtro não encontrado para o campo: ${field}`);
    }
  }

  static getFieldLabel(field: VivoFilterField): string {
    const config = this.getConfiguration(field);
    return config.label || field;
  }

  static getAllAvailableFields(): Array<{ value: VivoFilterField; label: string; description: string }> {
    const fields: VivoFilterField[] = ['status_pagamento', 'tipo_alerta', 'area_solicitante', 'risco', 'multa', 'municipio'];
    
    return fields.map(field => {
      const config = this.getConfiguration(field);
      return {
        value: field,
        label: config.label || field,
        description: config.description || `Filtro para ${field}`
      };
    });
  }

  static isMultipleSelection(field: VivoFilterField): boolean {
    return ['status_pagamento', 'tipo_alerta', 'area_solicitante', 'risco'].includes(field);
  }

  static hasNumericInputs(field: VivoFilterField): boolean {
    return field === 'multa';
  }

  static requiresUnaccentSearch(field: VivoFilterField): boolean {
    return field === 'municipio';
  }
}
