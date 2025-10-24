import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogWithContract {
  id: string;
  data?: string;
  hora?: string;
  numero_pagamento?: string;
  acao?: string;
  usuario_responsavel?: string;
  // Dados do contrato
  data_vencimento?: string;
  tipo_fluxo?: string;
  fornecedor?: string;
  numero_contrato?: string;
  status_pagamento?: string;
  status_contrato?: string;
  // Campos alternativos para compatibilidade
  timestamp?: string;
  created_at?: string;
  user_id?: string | null;
  user_email?: string | null;
  action?: string;
  record_id?: string | null;
}

export const useAuditLogsWithContracts = () => {
  return useQuery({
    queryKey: ['audit-logs-with-contracts'],
    queryFn: async () => {
      // Buscar logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        console.error('Erro ao buscar logs do Supabase:', logsError);
        throw logsError;
      }
      
      console.log('Logs carregados do Supabase:', logsData?.length || 0);
      if (logsData && logsData.length > 0) {
        console.log('Estrutura do primeiro log:', logsData[0]);
      }

      // Buscar contratos
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos_vivo')
        .select('numero_contrato, data_vencimento, tipo_fluxo, fornecedor, status_pagamento');

      if (contractsError) {
        console.error('Erro ao buscar contratos do Supabase:', contractsError);
      }

      // Criar mapa de contratos para busca rápida
      const contractsMap = new Map();
      if (contractsData) {
        contractsData.forEach((contract: any) => {
          contractsMap.set(contract.numero_contrato, contract);
        });
      }

      // Combinar logs com dados de contratos
      const enrichedLogs = logsData?.map((log: any) => {
        const numeroPagamento = log.numero_pagamento || log.record_id;
        const contract = numeroPagamento ? contractsMap.get(numeroPagamento) : null;
        
        return {
          ...log,
          data_vencimento: contract?.data_vencimento,
          tipo_fluxo: contract?.tipo_fluxo,
          fornecedor: contract?.fornecedor,
          numero_contrato: contract?.numero_contrato,
          status_pagamento: contract?.status_pagamento,
        };
      }) || [];

      console.log('Logs enriquecidos com dados de contratos:', enrichedLogs.length);
      
      return enrichedLogs as AuditLogWithContract[];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  });
};
