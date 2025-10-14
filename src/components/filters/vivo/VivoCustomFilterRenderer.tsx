import React from 'react';
import { VivoFilterField } from '@/core/entities/VivoCustomFilters';
import { PaymentStatus, AlertType, RequestingArea, ContractRisk } from '@/core/entities/Contract';
import { 
  PaymentStatusFilter, 
  AlertTypeFilter, 
  RequestingAreaFilter, 
  RiskFilter 
} from './VivoSelectFilters';
import { MultaFilter } from './VivoFinancialRange';
import { MunicipioFilter } from './VivoTextSearch';

interface VivoCustomFilterRendererProps {
  field: VivoFilterField;
  value: unknown;
  onValueChange: (value: unknown) => void;
  suggestions?: string[];
}

export const VivoCustomFilterRenderer: React.FC<VivoCustomFilterRendererProps> = ({
  field,
  value,
  onValueChange,
  suggestions = []
}) => {
  switch (field) {
    case 'status_pagamento':
      return (
        <PaymentStatusFilter
          selectedValues={(value as PaymentStatus[]) || []}
          onValueChange={onValueChange as (values: PaymentStatus[]) => void}
        />
      );

    case 'tipo_alerta':
      return (
        <AlertTypeFilter
          selectedValues={(value as AlertType[]) || []}
          onValueChange={onValueChange as (values: AlertType[]) => void}
        />
      );

    case 'area_solicitante':
      return (
        <RequestingAreaFilter
          selectedValues={(value as RequestingArea[]) || []}
          onValueChange={onValueChange as (values: RequestingArea[]) => void}
        />
      );

    case 'risco':
      return (
        <RiskFilter
          selectedValues={(value as ContractRisk[]) || []}
          onValueChange={onValueChange as (values: ContractRisk[]) => void}
        />
      );

    case 'multa':
      return (
        <MultaFilter
          value={(value as [number, number]) || [0, 1000000]}
          onValueChange={onValueChange as (value: [number, number]) => void}
        />
      );

    case 'municipio':
      return (
        <MunicipioFilter
          value={(value as string) || ''}
          onValueChange={onValueChange as (value: string) => void}
          suggestions={suggestions}
        />
      );

    default:
      return (
        <div className="p-4 text-center text-muted-foreground">
          Tipo de filtro não suportado: {field}
        </div>
      );
  }
};

