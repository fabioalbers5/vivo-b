import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegacyContract } from './useContractFilters';

interface UseFilteredContractsReturn {
  filteredContracts: LegacyContract[];
  isLoading: boolean;
  error: string | null;
}

interface FilterCriteria {
  analystName?: string | null;
  sampleId?: number | null;
}

export const useFilteredContracts = (criteria: FilterCriteria): UseFilteredContractsReturn => {
  const [filteredContracts, setFilteredContracts] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFilteredContracts = async (filters: FilterCriteria) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { analystName, sampleId } = filters;
      
      // Construir a query base
      let query = supabase
        .from('contratos_vivo')
        .select(`
          *,
          contratos_filtrados!inner(numero_contrato, usuario, amostra_id)
        `);

      // Aplicar filtros condicionalmente
      const conditions: string[] = [];
      
      if (analystName && analystName.trim() !== '' && analystName !== 'ALL_ANALYSTS') {
        query = query.eq('contratos_filtrados.usuario', analystName);
        conditions.push(`analista: ${analystName}`);
      } else if (analystName === 'ALL_ANALYSTS') {
        conditions.push('todos os analistas');
      }
      
      if (sampleId && sampleId > 0) {
        query = query.eq('contratos_filtrados.amostra_id', sampleId);
        conditions.push(`amostra: ${sampleId}`);
      }

      const conditionsText = conditions.length > 0 ? conditions.join(' + ') : 'todos os contratos analisados';
      console.log('🔍 Carregando contratos com filtros:', conditionsText);
      
      const { data: contractsData, error: contractsError } = await query;

      if (contractsError) {
        throw new Error(`Erro ao buscar contratos filtrados: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log('⚠️ Nenhum contrato encontrado com os filtros:', conditionsText);
        setFilteredContracts([]);
        return;
      }

      // Converter para formato LegacyContract
      const legacyContracts: LegacyContract[] = contractsData.map(contract => ({
        id: contract.id,
        number: contract.numero_contrato,
        supplier: contract.fornecedor,
        type: contract.tipo_contrato || contract.tipo_fluxo,
        value: contract.valor_contrato,
        status: contract.status || '',
        dueDate: contract.data_vencimento,
        alertType: contract.tipo_alerta || '',
        requestingArea: contract.area_solicitante || '',
        risk: contract.risco || '',
        fine: contract.multa || 0,
        paymentValue: contract.valor_pagamento || 0,
        region: contract.regiao || '',
        state: contract.estado,
        paymentStatus: contract.status_pagamento || ''
      }));

      console.log(`✅ Carregados ${legacyContracts.length} contratos com filtros: ${conditionsText}`);
      setFilteredContracts(legacyContracts);

    } catch (err) {
      console.error('❌ Erro ao carregar contratos filtrados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setFilteredContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { analystName, sampleId } = criteria;
    
    // Só fazer a busca se há pelo menos um filtro ativo
    if ((analystName && analystName.trim() !== '') || (sampleId && sampleId > 0)) {
      loadFilteredContracts(criteria);
    } else {
      // Se não há filtros, limpar os dados
      setFilteredContracts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [criteria.analystName, criteria.sampleId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    filteredContracts,
    isLoading,
    error
  };
};