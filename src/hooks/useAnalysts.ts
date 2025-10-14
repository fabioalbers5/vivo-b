import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAnalystsReturn {
  analysts: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar lista dinâmica de analistas da tabela contratos_filtrados
 * Usa SELECT DISTINCT para obter valores únicos da coluna usuario
 */
export const useAnalysts = (): UseAnalystsReturn => {
  const [analysts, setAnalysts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [ANALYSTS] Buscando lista de analistas...');

      // Buscar valores únicos e não nulos da coluna usuario
      const { data, error: queryError } = await supabase
        .from('contratos_filtrados')
        .select('usuario')
        .not('usuario', 'is', null)
        .not('usuario', 'eq', '')
        .order('usuario');

      if (queryError) {
        console.error('❌ [ANALYSTS] Erro na query:', queryError);
        throw queryError;
      }

      if (!data) {
        console.warn('⚠️ [ANALYSTS] Nenhum dado retornado');
        setAnalysts([]);
        return;
      }

      // Extrair valores únicos
      const uniqueAnalysts = [...new Set(
        data
          .map(item => item.usuario)
          .filter(Boolean) // Remove valores null/undefined/empty
      )].sort();

      console.log(`✅ [ANALYSTS] ${uniqueAnalysts.length} analistas encontrados:`, uniqueAnalysts);
      setAnalysts(uniqueAnalysts);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar analistas';
      console.error('❌ [ANALYSTS] Erro:', errorMessage);
      setError(errorMessage);
      setAnalysts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysts();
  }, []);

  return {
    analysts,
    isLoading,
    error,
    refetch: fetchAnalysts
  };
};