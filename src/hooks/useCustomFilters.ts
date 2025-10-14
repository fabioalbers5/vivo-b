import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { customFilterService } from '@/infra/di/container';
import { CustomFilter, FilterType } from '@/core/entities/CustomFilter';
import { CreateCustomFilterData } from '@/core/entities/CustomFilter';

// Interface para compatibilidade com componentes existentes
export interface LegacyCustomFilter {
  id: string;
  name: string;
  type: 'Input' | 'Dropdown' | 'Multi-select' | 'Range' | 'Checkbox' | 'Data' | 'Intervalo';
  table: string;
  field: string;
  options?: Array<{ value: string; label: string }>;
}

export const useCustomFilters = () => {
  const [customFilters, setCustomFilters] = useState<LegacyCustomFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Converter filtro do domínio para legado
  const toLegacyFilter = (filter: CustomFilter): LegacyCustomFilter => {
    // Mapear tipos do domínio para legado
    const typeMap: Record<FilterType, LegacyCustomFilter['type']> = {
      'text': 'Input',
      'select': 'Dropdown',
      'multiselect': 'Multi-select',
      'range': 'Range',
      'boolean': 'Checkbox',
      'date': 'Data',
      'number': 'Intervalo'
    };

    return {
      id: filter.id,
      name: filter.nomeFiltro,
      type: typeMap[filter.tipo] || 'Input',
      table: filter.tabelaOrigem,
      field: filter.campoOrigem,
      options: filter.configuracoes.options?.map(opt => ({
        value: String(opt.value),
        label: opt.label
      }))
    };
  };

  // Converter filtro legado para domínio
  const toDomainFilter = (filter: LegacyCustomFilter): CreateCustomFilterData => {
    // Mapear tipos legados para domínio
    const typeMap: Record<LegacyCustomFilter['type'], FilterType> = {
      'Input': 'text',
      'Dropdown': 'select',
      'Multi-select': 'multiselect',
      'Range': 'range',
      'Checkbox': 'boolean',
      'Data': 'date',
      'Intervalo': 'number'
    };

    return {
      nomeFiltro: filter.name,
      tabelaOrigem: filter.table,
      campoOrigem: filter.field,
      tipo: typeMap[filter.type] || 'text',
      configuracoes: {
        options: filter.options || []
      }
    };
  };

  // Load filters from service
  const loadFilters = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = await customFilterService.getAllCustomFilters();
      
      const legacyFilters = filters.map(toLegacyFilter);
      setCustomFilters(legacyFilters);
      
    } catch (error) {
      // // // console.error('Error loading filters:', error);
      toast({
        title: "Erro ao carregar filtros",
        description: error instanceof Error ? error.message : "Não foi possível carregar os filtros salvos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const addFilter = async (filter: LegacyCustomFilter) => {
    // Criar ID temporário para renderização instantânea
    const tempId = `temp-${Date.now()}`;
    const tempFilter = { ...filter, id: tempId };
    
    // Adicionar imediatamente na UI
    setCustomFilters(prev => [tempFilter, ...prev]);
    
    try {
      setIsLoading(true);
      
      const domainFilter = toDomainFilter(filter);
      
      const newFilter = await customFilterService.createCustomFilter(domainFilter);
      
      // Substituir filtro temporário pelo real
      const legacyFilter = toLegacyFilter(newFilter);
      setCustomFilters(prev => prev.map(f => f.id === tempId ? legacyFilter : f));
      
      toast({
        title: "Filtro salvo",
        description: `O filtro "${filter.name}" foi salvo com sucesso.`
      });
      
    } catch (error) {
      // // // console.error('🚨 Error saving filter:', error);
      
      // Log detalhado do erro
      const errorObj = error as Record<string, unknown>;
      
      // Marcar filtro temporário como "não salvo" mas manter na UI
      setCustomFilters(prev => prev.map(f => 
        f.id === tempId 
          ? { ...f, name: `${f.name} (não salvo - erro 23514)` }
          : f
      ));
      
      const errorMsg = error && typeof error === 'object' && 'message' in error 
        ? String(errorObj.message)
        : 'Erro desconhecido';
      
      toast({
        title: "Problema na constraint do banco",
        description: `Erro 23514: Execute o script fix-force.sql no Supabase. Detalhes: ${errorMsg}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFilter = async (filterId: string) => {
    try {
      setIsLoading(true);
      
      await customFilterService.deleteCustomFilter(filterId);
      setCustomFilters(prev => prev.filter(f => f.id !== filterId));
      
      toast({
        title: "Filtro excluído",
        description: "O filtro foi excluído com sucesso."
      });
      
    } catch (error) {
      // // // console.error('Error deleting filter:', error);
      toast({
        title: "Erro ao excluir filtro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o filtro.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customFilters,
    addFilter,
    removeFilter,
    isLoading,
    loadFilters
  };
};
