import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegacyContract } from './useContractFilters';

interface UseAllContractsReturn {
  allContracts: LegacyContract[];
  isLoading: boolean;
  error: string | null;
}

export const useAllContracts = (): UseAllContractsReturn => {
  const [allContracts, setAllContracts] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando apenas contratos que foram analisados (existem em contratos_filtrados)...');
      
      // Buscar apenas contratos que existem tanto em contratos_vivo quanto em contratos_filtrados
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select(`
          *,
          contratos_filtrados!inner(numero_contrato)
        `);

      if (contractsError) {
        throw new Error(`Erro ao buscar contratos: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log('⚠️ Nenhum contrato encontrado na base de dados');
        setAllContracts([]);
        return;
      }

      // Converter para formato LegacyContract
      const legacyContracts: LegacyContract[] = contractsData.map(contract => ({
        id: contract.id,
        number: contract.numero_contrato,
        supplier: contract.fornecedor,
        type: contract.tipo_contrato || contract.tipo_fluxo, // Usar tipo_contrato ou tipo_fluxo como fallback
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

      console.log(`✅ Carregados ${legacyContracts.length} contratos analisados (que existem em ambas as tabelas)`);
      setAllContracts(legacyContracts);

    } catch (err) {
      console.error('❌ Erro ao carregar todos os contratos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllContracts();
  }, []);

  return {
    allContracts,
    isLoading,
    error
  };
};