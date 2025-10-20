import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegacyContract } from './useContractFilters';

interface UseFilteredContractsOnlyReturn {
  contracts: LegacyContract[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseFilteredContractsOnlyParams {
  sampleId?: string;
}

/**
 * Hook para buscar APENAS os contratos que estão na tabela contratos_filtrados
 * Usado na tela de Gestão da Amostra (SampleManagementTab)
 */
export const useFilteredContractsOnly = (params?: UseFilteredContractsOnlyParams): UseFilteredContractsOnlyReturn => {
  const [contracts, setContracts] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFilteredContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Buscar números de contrato da tabela contratos_filtrados
      let query = supabase
        .from('contratos_filtrados')
        .select('numero_contrato, usuario, amostra_id');

      // Aplicar filtro por amostra_id se fornecido
      if (params?.sampleId && params.sampleId !== 'all') {
        query = query.eq('amostra_id', params.sampleId);
      }

      const { data: filteredData, error: filteredError } = await query;

      if (filteredError) {
        throw new Error(`Erro ao buscar contratos filtrados: ${filteredError.message}`);
      }

      if (!filteredData || filteredData.length === 0) {
        console.log('Nenhum contrato encontrado em contratos_filtrados');
        setContracts([]);
        return;
      }

      // 2. Extrair números de contratos e criar mapa de analistas e amostras
      const numeroContratos = filteredData.map(item => item.numero_contrato);
      const analystMap = new Map<string, string>();
      const sampleMap = new Map<string, string>();
      
      filteredData.forEach(item => {
        if (item.numero_contrato && item.usuario) {
          analystMap.set(item.numero_contrato, item.usuario);
        }
        if (item.numero_contrato && item.amostra_id) {
          sampleMap.set(item.numero_contrato, item.amostra_id);
        }
      });

      console.log(`📋 Encontrados ${numeroContratos.length} contratos em contratos_filtrados`);

      // 3. Buscar dados completos desses contratos na tabela contratos_vivo
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select('*')
        .in('numero_contrato', numeroContratos);

      if (contractsError) {
        throw new Error(`Erro ao buscar dados dos contratos: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log('Nenhum contrato encontrado em contratos_vivo para os filtrados');
        setContracts([]);
        return;
      }

      // 4. Converter para formato LegacyContract
      const legacyContracts: LegacyContract[] = contractsData.map(contract => ({
        id: contract.id,
        number: contract.numero_contrato,
        supplier: contract.fornecedor,
        type: contract.tipo_contrato || contract.tipo_fluxo,
        value: contract.valor_contrato,
        status: contract.status || '',
        dueDate: contract.data_vencimento_pagamento || contract.data_vencimento,
        contractDueDate: contract.data_vencimento,
        paymentDueDate: contract.data_vencimento_pagamento,
        alertType: contract.tipo_alerta || '',
        requestingArea: contract.area_solicitante || '',
        risk: contract.risco || '',
        fine: contract.multa || 0,
        paymentValue: contract.valor_pagamento || 0,
        region: contract.regiao || '',
        state: contract.estado,
        paymentStatus: contract.status_pagamento || '',
        analyst: analystMap.get(contract.numero_contrato) || '',
        sampleId: sampleMap.get(contract.numero_contrato) || ''
      }));

      setContracts(legacyContracts);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFilteredContracts();
  }, [params?.sampleId]);

  return { contracts, isLoading, error, refetch: loadFilteredContracts };
};
