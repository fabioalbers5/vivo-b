import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { contractService } from '@/infra/di/container';
import { Contract, ContractFilters, PaymentStatus, AlertType, RequestingArea, ContractRisk } from '@/core/entities/Contract';
import { CustomFilter } from '@/core/entities/CustomFilter';

// Interface para compatibilidade com componentes existentes
interface LegacyCustomFilter {
  id: string;
  name: string;
  type: 'Input' | 'Dropdown' | 'Multi-select' | 'Range' | 'Checkbox' | 'Data' | 'Intervalo';
  table: string;
  field: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FilterParams {
  flowType: string[];
  contractValue: [number, number];
  paymentValue: [number, number];
  dueDate: string;
  customStart: string;
  customEnd: string;
  supplierName: string[];
  contractNumber: string[];
  contractCount: number;
  customFilterValues: Record<string, unknown>;
  customFilters: LegacyCustomFilter[];
}

// Interface para compatibilidade com componentes existentes
export interface LegacyContract {
  id: string;
  number: string;
  supplier: string;
  type: string;
  value: number;
  status: string; // Aceitar qualquer valor da tabela contratos_vivo
  dueDate: string; // data_vencimento_pagamento (vencimento do pagamento)
  contractDueDate?: string; // data_vencimento (vencimento do contrato)
  paymentDueDate?: string; // data_vencimento_pagamento (vencimento do pagamento) - alias de dueDate
  alertType?: string; // Campo tipo_alerta da tabela contratos_vivo
  requestingArea?: string; // Campo area_solicitante da tabela contratos_vivo
  risk?: string; // Campo risco da tabela contratos_vivo
  fine?: number; // Campo multa da tabela contratos_vivo
  paymentValue?: number; // Campo valor_pagamento da tabela contratos_vivo
  region?: string; // Campo regiao da tabela contratos_vivo
  state?: string; // Campo estado da tabela contratos_vivo
  paymentStatus?: string; // Campo status_pagamento da tabela contratos_vivo
  flowType?: string; // Campo tipo_fluxo da tabela contratos_vivo
  treasuryCycle?: string; // Campo ciclo_tesouraria (Sim/Não)
  // Campos de gestão de amostra
  analyst?: string;
  analysisStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  isUrgent?: boolean;
  notes?: string;
  priority?: string;
  estimatedCompletionDate?: string;
  reviewComments?: string;
  watchers?: string[];
  lastModified?: string;
}

export const useContractFilters = () => {
  const [contracts, setContracts] = useState<LegacyContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const applyFilters = useCallback(async (filterParams: FilterParams) => {
    setIsLoading(true);
    
    try {
      // Construir filtros para o service usando a nova arquitetura
      const filters: ContractFilters = {};

      // Flow type filter
      if (filterParams.flowType.length > 0) {
        filters.tipoFluxo = filterParams.flowType;
      }

      // Contract value range
      filters.valorMin = filterParams.contractValue[0];
      filters.valorMax = filterParams.contractValue[1];

      // Payment value range
      filters.valorPagamentoMin = filterParams.paymentValue[0];
      filters.valorPagamentoMax = filterParams.paymentValue[1];

      // Due date filter
      if (filterParams.dueDate) {
        const today = new Date();
        
        switch (filterParams.dueDate) {
          case "30": {
            const date30 = new Date(today);
            date30.setDate(date30.getDate() + 30);
            filters.dataVencimentoFim = date30;
            break;
          }
          case "30-60": {
            const date30Start = new Date(today);
            date30Start.setDate(date30Start.getDate() + 30);
            const date60End = new Date(today);
            date60End.setDate(date60End.getDate() + 60);
            filters.dataVencimentoInicio = date30Start;
            filters.dataVencimentoFim = date60End;
            break;
          }
          case "60-90": {
            const date60Start = new Date(today);
            date60Start.setDate(date60Start.getDate() + 60);
            const date90End = new Date(today);
            date90End.setDate(date90End.getDate() + 90);
            filters.dataVencimentoInicio = date60Start;
            filters.dataVencimentoFim = date90End;
            break;
          }
          case "custom": {
            if (filterParams.customStart && filterParams.customEnd) {
              filters.dataVencimentoInicio = new Date(filterParams.customStart);
              filters.dataVencimentoFim = new Date(filterParams.customEnd);
            }
            break;
          }
        }
      }

      // Processar filtros personalizados
      const customFilters = Array.isArray(filterParams.customFilters) ? filterParams.customFilters : [];
      for (const customFilter of customFilters) {
        const filterValue = filterParams.customFilterValues[customFilter.id];
        
        // Usar as propriedades corretas do LegacyCustomFilter
        const filterField = customFilter.field;
        
        if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
          // Mapear campos dos filtros personalizados para os filtros do domínio
          switch (filterField) {
            case 'status_pagamento':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                filters.statusPagamento = filterValue as PaymentStatus[];
              }
              break;
            case 'tipo_alerta':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                filters.tipoAlerta = filterValue as AlertType[];
              }
              break;
            case 'area_solicitante':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                filters.areaSolicitante = filterValue as RequestingArea[];
              }
              break;
            case 'risco':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                filters.risco = filterValue as ContractRisk[];
              }
              break;
            case 'multa':
              if (Array.isArray(filterValue) && filterValue.length === 2) {
                const [min, max] = filterValue as [number, number];
                filters.multaMin = min;
                filters.multaMax = max;
              }
              break;
            case 'municipio':
              if (typeof filterValue === 'string' && filterValue.trim() !== '') {
                filters.municipio = filterValue.trim();
              }
              break;
          }
        }
      }



      // Buscar contratos usando o service
      let contractsResult: Contract[] = [];

      // Se tem filtro por nome de fornecedor ou número do contrato, usar busca específica
      if (filterParams.supplierName.length > 0) {
        // Buscar contratos para cada fornecedor selecionado
        const supplierContractsPromises = filterParams.supplierName.map(supplier =>
          contractService.getContractsBySupplier(supplier)
        );
        const supplierContractsArrays = await Promise.all(supplierContractsPromises);
        const allSupplierContracts = supplierContractsArrays.flat();
        
        contractsResult = allSupplierContracts.filter(contract => {
          // Aplicar outros filtros manualmente
          if (filterParams.contractNumber.length > 0 && 
              !filterParams.contractNumber.some(contractNum => 
                contract.numeroContrato.toLowerCase().includes(contractNum.toLowerCase())
              )) {
            return false;
          }
          return true;
        });
      } else {
        // Usar filtros gerais
        contractsResult = await contractService.getContractsByFilters(filters);
        
        // Aplicar filtro de número do contrato se especificado
        if (filterParams.contractNumber.length > 0) {
          contractsResult = contractsResult.filter(contract =>
            filterParams.contractNumber.some(contractNum =>
              contract.numeroContrato.toLowerCase().includes(contractNum.toLowerCase())
            )
          );
        }
      }

      // Ordenar por número do contrato de forma determinística e aplicar limite
      if (filterParams.contractCount > 0) {
        const sortedContracts = [...contractsResult].sort((a, b) => {
          const numA = a.numeroContrato || '';
          const numB = b.numeroContrato || '';
          return numA.localeCompare(numB);
        });
        
        contractsResult = sortedContracts.slice(0, filterParams.contractCount);
      }

      // Transformar para o formato legado
      const transformedContracts: LegacyContract[] = contractsResult.map((contract, index) => ({
        id: contract.id || `generated-${index}-${Date.now()}`,
        number: contract.numeroContrato,
        supplier: contract.fornecedor,
        type: contract.tipoFluxo || 'Não informado',
        value: contract.valorContrato,
        status: contract.statusPagamento || contract.status || 'N/A',
        dueDate: contract.dataVencimento && !isNaN(contract.dataVencimento.getTime()) 
          ? contract.dataVencimento.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        alertType: contract.tipoAlerta || undefined,
        requestingArea: contract.areaSolicitante || undefined,
        risk: contract.risco || undefined,
        fine: contract.multa || undefined,
        paymentValue: contract.valorPagamento || undefined,
        region: contract.regiao || undefined,
        state: contract.estado || undefined,
        paymentStatus: contract.statusPagamento || undefined,
        flowType: contract.tipoFluxo || undefined,
        treasuryCycle: Math.random() > 0.5 ? 'Sim' : 'Não', // Gerar aleatoriamente
      }));

      setContracts(transformedContracts);

      // Toast removido para evitar popup constante em filtros dinâmicos
      // console.log(`Filtros aplicados: ${transformedContracts.length} contratos encontrados.`);

    } catch (error) {
      console.error('Error applying filters:', error);
      // Toast de erro mantido apenas para casos críticos
      toast({
        title: "Erro ao aplicar filtros",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao buscar os contratos. Tente novamente.",
        variant: "destructive"
      });
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Dependências mínimas do useCallback

  return {
    contracts,
    isLoading,
    applyFilters
  };
};
