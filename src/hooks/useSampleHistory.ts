import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegacyContract } from './useContractFilters';

interface SampleHistoryItem {
  amostra_id: number;
  totalContracts: number;
  createdAt: string;
  mesReferencia: string;
}

interface UseSampleHistoryReturn {
  sampleHistory: SampleHistoryItem[];
  isLoading: boolean;
  error: string | null;
  loadSampleById: (amostraId: number) => Promise<LegacyContract[]>;
  refreshHistory: () => Promise<void>;
}

export const useSampleHistory = (): UseSampleHistoryReturn => {
  const [sampleHistory, setSampleHistory] = useState<SampleHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSampleHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar todas as amostras agrupadas por amostra_id
      const { data: samplesData, error: samplesError } = await supabase
        .from('contratos_filtrados')
        .select('amostra_id, data_analise, mes_referencia')
        .order('amostra_id', { ascending: false });

      if (samplesError) {
        throw samplesError;
      }

      if (!samplesData || samplesData.length === 0) {
        setSampleHistory([]);
        return;
      }

      // Agrupar por amostra_id e contar contratos
      const groupedSamples = samplesData.reduce((acc, item) => {
        const amostraId = item.amostra_id;
        if (amostraId !== null && !acc[amostraId]) {
          acc[amostraId] = {
            amostra_id: amostraId,
            totalContracts: 0,
            createdAt: item.data_analise || new Date().toISOString(),
            mesReferencia: item.mes_referencia || 'N/A'
          };
        }
        if (amostraId !== null) {
          acc[amostraId].totalContracts++;
        }
        return acc;
      }, {} as Record<number, SampleHistoryItem>);

      const historyItems = Object.values(groupedSamples).sort((a, b) => b.amostra_id - a.amostra_id);
      setSampleHistory(historyItems);

    } catch (err) {
      console.error('Erro ao carregar histórico de amostras:', err);
      setError('Erro ao carregar histórico de amostras');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleById = async (amostraId: number): Promise<LegacyContract[]> => {
    try {
      console.log(`🔍 Carregando amostra ${amostraId}...`);
      
      // 1. Buscar números de contrato da amostra específica
      const { data: filteredContracts, error: filteredError } = await supabase
        .from('contratos_filtrados')
        .select('numero_contrato')
        .eq('amostra_id', amostraId);

      if (filteredError) {
        throw new Error(`Erro ao buscar contratos filtrados: ${filteredError.message}`);
      }

      if (!filteredContracts || filteredContracts.length === 0) {
        console.log(`⚠️ Nenhum contrato encontrado para amostra ${amostraId}`);
        return [];
      }

      const numeroContratos = filteredContracts.map(item => item.numero_contrato);
      console.log(`📋 Encontrados ${numeroContratos.length} contratos na amostra ${amostraId}`);

      // 2. Buscar dados completos na tabela contratos_vivo
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select('*')
        .in('numero_contrato', numeroContratos);

      if (contractsError) {
        throw new Error(`Erro ao buscar dados dos contratos: ${contractsError.message}`);
      }

      if (!contractsData || contractsData.length === 0) {
        console.log(`⚠️ Nenhum dado encontrado na tabela contratos_vivo para os contratos da amostra ${amostraId}`);
        return [];
      }

      // 3. Converter para formato LegacyContract
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

      console.log(`✅ Carregados ${legacyContracts.length} contratos da amostra ${amostraId}`);
      return legacyContracts;

    } catch (err) {
      console.error(`❌ Erro ao carregar amostra ${amostraId}:`, err);
      throw new Error(`Erro ao carregar amostra: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const refreshHistory = async () => {
    await loadSampleHistory();
  };

  useEffect(() => {
    loadSampleHistory();
  }, []);

  return {
    sampleHistory,
    isLoading,
    error,
    loadSampleById,
    refreshHistory
  };
};