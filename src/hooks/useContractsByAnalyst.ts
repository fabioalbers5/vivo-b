import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegacyContract } from './useContractFilters';

interface UseContractsByAnalystReturn {
  contractsByAnalyst: LegacyContract[];
  isLoading: boolean;
  error: string | null;
}

export const useContractsByAnalyst = (analystName: string | null): UseContractsByAnalystReturn => {
  const [contractsByAnalyst, setContractsByAnalyst] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContractsByAnalyst = async (analyst: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando contratos do analista:', analyst);
      
      // Buscar contratos que foram analisados pelo analista específico
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select(`
          *,
          contratos_filtrados!inner(numero_contrato, usuario)
        `)
        .eq('contratos_filtrados.usuario', analyst);

      if (contractsError) {
        throw new Error(`Erro ao buscar contratos do analista: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log('⚠️ Nenhum contrato encontrado para o analista:', analyst);
        setContractsByAnalyst([]);
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

      console.log(`✅ Carregados ${legacyContracts.length} contratos do analista: ${analyst}`);
      setContractsByAnalyst(legacyContracts);

    } catch (err) {
      console.error('❌ Erro ao carregar contratos do analista:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setContractsByAnalyst([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (analystName && analystName.trim() !== '') {
      loadContractsByAnalyst(analystName);
    } else {
      // Se não há analista selecionado, limpar os dados
      setContractsByAnalyst([]);
      setIsLoading(false);
      setError(null);
    }
  }, [analystName]);

  return {
    contractsByAnalyst,
    isLoading,
    error
  };
};