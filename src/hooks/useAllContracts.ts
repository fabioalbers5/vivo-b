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
  const [isLoading, setIsLoading] = useState(false); // Começar como false
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadAllContracts = async () => {
    // Evitar múltiplas chamadas se já carregou uma vez
    if (hasLoaded) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar todos os contratos da tabela contratos_vivo
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select('*');

      if (contractsError) {
        throw new Error(`Erro ao buscar contratos: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log('Nenhum contrato encontrado em contratos_vivo');
        setAllContracts([]);
        return;
      }

      console.log(`📋 Carregados ${contractsData.length} contratos de contratos_vivo`);

      // Converter para formato LegacyContract
      const legacyContracts: LegacyContract[] = contractsData.map(contract => ({
        id: contract.id,
        number: contract.numero_contrato,
        supplier: contract.fornecedor,
        type: contract.tipo_contrato || contract.tipo_fluxo,
        value: contract.valor_contrato,
        status: contract.status || '',
        dueDate: contract.data_vencimento_pagamento || contract.data_vencimento, // Vencimento do pagamento
        contractDueDate: contract.data_vencimento, // Vencimento do contrato
        paymentDueDate: contract.data_vencimento_pagamento, // Vencimento do pagamento
        alertType: contract.tipo_alerta || '',
        requestingArea: contract.area_solicitante || '',
        risk: contract.risco || '',
        fine: contract.multa || 0,
        paymentValue: contract.valor_pagamento || 0,
        region: contract.regiao || '',
        state: contract.estado,
        paymentStatus: contract.status_pagamento || '',
        analyst: '' // Será preenchido conforme necessário por cada tela
      }));

      setAllContracts(legacyContracts);
      setHasLoaded(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Carregar dados apenas uma vez na inicialização
    loadAllContracts();
  }, []); // Array de dependências vazio para executar apenas uma vez

  return {
    allContracts,
    isLoading,
    error
  };
};