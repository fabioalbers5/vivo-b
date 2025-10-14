import React from 'react';
import { VivoFilterField } from '@/core/entities/VivoCustomFilters';

// Hook para gerenciar valores dos filtros personalizados do Vivo
export const useVivoCustomFilterValues = () => {
  const [filterValues, setFilterValues] = React.useState<Record<VivoFilterField, unknown>>({
    status_pagamento: [],
    tipo_alerta: [],
    area_solicitante: [],
    risco: [],
    multa: [0, 1000000],
    municipio: ''
  });

  const updateFilterValue = (field: VivoFilterField, value: unknown) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilterValue = (field: VivoFilterField) => {
    const defaultValues: Record<VivoFilterField, unknown> = {
      status_pagamento: [],
      tipo_alerta: [],
      area_solicitante: [],
      risco: [],
      multa: [0, 1000000],
      municipio: ''
    };

    setFilterValues(prev => ({
      ...prev,
      [field]: defaultValues[field]
    }));
  };

  const resetAllFilters = () => {
    setFilterValues({
      status_pagamento: [],
      tipo_alerta: [],
      area_solicitante: [],
      risco: [],
      multa: [0, 1000000],
      municipio: ''
    });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    
    if ((filterValues.status_pagamento as unknown[]).length > 0) count++;
    if ((filterValues.tipo_alerta as unknown[]).length > 0) count++;
    if ((filterValues.area_solicitante as unknown[]).length > 0) count++;
    if ((filterValues.risco as unknown[]).length > 0) count++;
    if (filterValues.municipio && (filterValues.municipio as string).trim().length > 0) count++;
    
    const multaValue = filterValues.multa as [number, number];
    if (multaValue[0] > 0 || multaValue[1] < 1000000) count++;
    
    return count;
  };

  const hasActiveFilters = (): boolean => {
    return getActiveFiltersCount() > 0;
  };

  return {
    filterValues,
    updateFilterValue,
    resetFilterValue,
    resetAllFilters,
    getActiveFiltersCount,
    hasActiveFilters
  };
};
