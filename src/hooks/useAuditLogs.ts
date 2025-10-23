import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  data?: string;
  hora?: string;
  numero_pagamento?: string;
  acao?: string;
  usuario_responsavel?: string;
  // Campos alternativos para compatibilidade
  timestamp?: string;
  created_at?: string;
  user_id?: string | null;
  user_email?: string | null;
  action?: string;
  table_name?: string | null;
  record_id?: string | null;
  old_data?: any;
  new_data?: any;
  ip_address?: string | null;
  user_agent?: string | null;
}

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar logs do Supabase:', error);
        throw error;
      }
      
      console.log('Logs carregados do Supabase:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Estrutura do primeiro log:', data[0]);
      }
      return (data || []) as unknown as AuditLog[];
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  });
};
