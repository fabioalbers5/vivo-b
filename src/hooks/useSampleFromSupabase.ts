import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSample } from '@/contexts/SampleContext';
import { LegacyContract } from '@/hooks/useContractFilters';

interface SampleSupabaseData {
  contracts: LegacyContract[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSampleFromSupabase = (): SampleSupabaseData => {
  const { sampleMetadata } = useSample();
  const [contracts, setContracts] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildSupabaseQuery = (filters: Record<string, unknown>) => {
    let query = supabase
      .from('contratos_vivo')
      .select('*');

    // Aplicar filtros baseados nos filtros salvos no contexto
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      switch (key) {
        case 'flowType':
          if (Array.isArray(value) && value.length > 0) {
            query = query.in('tipo_fluxo', value);
          }
          break;

        case 'contractValue':
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value as [number, number];
            if (min > 0) query = query.gte('valor_contrato', min);
            if (max < 10000000) query = query.lte('valor_contrato', max);
          }
          break;

        case 'paymentValue':
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value as [number, number];
            if (min > 0) query = query.gte('valor_pagamento', min);
            if (max < 10000000) query = query.lte('valor_pagamento', max);
          }
          break;

        case 'region':
          if (typeof value === 'string' && value.trim()) {
            query = query.eq('regiao', value);
          }
          break;

        case 'selectedStates':
          if (Array.isArray(value) && value.length > 0) {
            query = query.in('estado', value);
          }
          break;

        case 'dueDate':
          if (typeof value === 'string' && value.trim()) {
            query = query.eq('data_vencimento', value);
          }
          break;

        case 'customStart':
          if (typeof value === 'string' && value.trim()) {
            query = query.gte('data_vencimento', value);
          }
          break;

        case 'customEnd':
          if (typeof value === 'string' && value.trim()) {
            query = query.lte('data_vencimento', value);
          }
          break;

        case 'supplierName':
          if (typeof value === 'string' && value.trim()) {
            query = query.ilike('fornecedor', `%${value}%`);
          }
          break;

        case 'contractNumber':
          if (typeof value === 'string' && value.trim()) {
            query = query.ilike('numero_contrato', `%${value}%`);
          }
          break;

        case 'customFilters':
          if (typeof value === 'object' && value !== null) {
            const customFilters = value as Record<string, unknown>;
            Object.entries(customFilters).forEach(([filterId, filterValue]) => {
              // Mapear filtros customizados para campos do banco
              if (filterId.includes('status_pagamento') && Array.isArray(filterValue) && filterValue.length > 0) {
                query = query.in('status_pagamento', filterValue);
              }
              if (filterId.includes('tipo_alerta') && Array.isArray(filterValue) && filterValue.length > 0) {
                query = query.in('tipo_alerta', filterValue);
              }
              if (filterId.includes('area_solicitante') && Array.isArray(filterValue) && filterValue.length > 0) {
                query = query.in('area_solicitante', filterValue);
              }
              if (filterId.includes('risco') && Array.isArray(filterValue) && filterValue.length > 0) {
                query = query.in('risco', filterValue);
              }
              if (filterId.includes('multa') && Array.isArray(filterValue) && filterValue.length === 2) {
                const [min, max] = filterValue as [number, number];
                if (min > 0) query = query.gte('multa', min);
                if (max < 1000000) query = query.lte('multa', max);
              }
              if (filterId.includes('municipio') && typeof filterValue === 'string' && filterValue.trim()) {
                query = query.ilike('municipio', `%${filterValue}%`);
              }
            });
          }
          break;
      }
    });

    // Aplicar limite se especificado
    if (filters.contractCount && typeof filters.contractCount === 'number') {
      query = query.limit(filters.contractCount);
    }

    return query;
  };

  const mapSupabaseToLegacyContract = (row: Record<string, unknown>): LegacyContract => {
    return {
      id: String(row.id || ''),
      number: String(row.numero_contrato || ''),
      supplier: String(row.fornecedor || ''),
      type: String(row.tipo_fluxo || 'Não informado'),
      value: Number(row.valor_contrato) || 0,
      status: String(row.status || 'pending'),
      dueDate: String(row.data_vencimento || ''),
      alertType: row.tipo_alerta ? String(row.tipo_alerta) : undefined,
      requestingArea: row.area_solicitante ? String(row.area_solicitante) : undefined,
      risk: row.risco ? String(row.risco) : undefined,
      fine: row.multa ? Number(row.multa) : undefined,
      paymentValue: row.valor_pagamento ? Number(row.valor_pagamento) : undefined,
    };
  };

  const fetchContracts = useCallback(async () => {
    if (!sampleMetadata.appliedFilters || Object.keys(sampleMetadata.appliedFilters).length === 0) {
      setContracts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = buildSupabaseQuery(sampleMetadata.appliedFilters);
      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(`Erro na consulta ao Supabase: ${supabaseError.message}`);
      }

      const mappedContracts = (data || []).map(mapSupabaseToLegacyContract);
      setContracts(mappedContracts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar contratos';
      setError(errorMessage);
      // // // console.error('Erro ao buscar contratos do Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sampleMetadata]);

  // Buscar contratos sempre que os filtros mudarem
  useEffect(() => {
    fetchContracts();
  }, [sampleMetadata.lastUpdated, sampleMetadata.appliedFilters, fetchContracts]);

  return {
    contracts,
    isLoading,
    error,
    refresh: fetchContracts
  };
};

export default useSampleFromSupabase;
