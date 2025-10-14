import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import FilterBar, { FilterItem } from "./FilterBar";
import FilterWrapper from "./FilterWrapper";
import FlowTypeFilter from "./filters/FlowTypeFilter";
import ValueRangeFilter from "./filters/ValueRangeFilter";
import LocationFilter from "./filters/LocationFilter";
import DueDateFilter from "./filters/DueDateFilter";
import SupplierNameFilter from "./filters/SupplierNameFilter";
import ContractNumberFilter from "./filters/ContractNumberFilter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginatedContractsTable from "./PaginatedContractsTable";
import CreateFilterModal from "./CreateFilterModal";
import ContractAnalysisModal from "./ContractAnalysisModal";
import CustomFilterRenderer from "./CustomFilterRenderer";
import { useCustomFilters } from "@/hooks/useCustomFilters";
import { useContractFilters, LegacyContract } from "@/hooks/useContractFilters";
import { useAllContracts } from "@/hooks/useAllContracts";



const PaymentVerificationApp = () => {
  const { toast } = useToast();
  const { customFilters, addFilter, removeFilter, isLoading: filtersLoading } = useCustomFilters();
  const { contracts, isLoading, applyFilters: originalApplyFilters } = useContractFilters();
  const { allContracts, isLoading: allContractsLoading } = useAllContracts();
  
  // Estado para mostrar resultados filtrados na tabela
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  // Estado para modals
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  // Função memoizada para aplicar filtros - evita recriação constante e múltiplas chamadas
  const applyFilters = useCallback(async (filterParams: any) => {
    setIsApplyingFilters(prev => {
      if (prev) return prev; // Se já estiver aplicando, não fazer nada
      return true;
    });
    
    try {
      await originalApplyFilters(filterParams);
    } finally {
      setIsApplyingFilters(false);
    }
  }, [originalApplyFilters]); // Removida dependência isApplyingFilters
  
  // Default filter states
  const [flowType, setFlowType] = useState<string[]>([]);
  const [contractValue, setContractValue] = useState<[number, number]>([0, 10000000]);
  const [paymentValue, setPaymentValue] = useState<[number, number]>([0, 10000000]);
  const [region, setRegion] = useState<string>("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string[]>([]);
  const [contractNumber, setContractNumber] = useState<string[]>([]);
  const [contractCount, setContractCount] = useState<number>(10);
  
  // Custom filter values
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, unknown>>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Referência para manter o último conjunto de filtros aplicado
  const lastAppliedFiltersRef = useRef<string>("");

  // Memoizar os parâmetros do filtro e convertê-los para uma string estável
  const filterParamsHash = useMemo(() => {
    const params = {
      flowType: flowType.sort(),
      contractValue,
      paymentValue,
      region,
      selectedStates: selectedStates.sort(),
      dueDate,
      customStart,
      customEnd,
      supplierName: supplierName.sort(),
      contractNumber: contractNumber.sort(),
      contractCount,
      customFilterValues,
      customFilters: customFilters.map(f => f.id).sort()
    };
    return JSON.stringify(params);
  }, [flowType, contractValue, paymentValue, region, selectedStates, dueDate, customStart, customEnd, supplierName, contractNumber, contractCount, customFilterValues, customFilters]);

  // useEffect com debouncing para aplicar filtros automaticamente
  useEffect(() => {
    // Verificar se os filtros realmente mudaram
    if (lastAppliedFiltersRef.current === filterParamsHash) {
      return; // Sem mudanças, não aplicar filtros
    }

    const currentFilterParams = {
      flowType,
      contractValue,
      paymentValue,
      region,
      selectedStates,
      dueDate,
      customStart,
      customEnd,
      supplierName,
      contractNumber,
      contractCount,
      customFilterValues,
      customFilters
    };

    // Verificar se há filtros ativos
    const hasFilters = currentFilterParams.flowType.length > 0 || 
                      currentFilterParams.contractValue[0] > 0 || currentFilterParams.contractValue[1] < 10000000 ||
                      currentFilterParams.paymentValue[0] > 0 || currentFilterParams.paymentValue[1] < 10000000 ||
                      currentFilterParams.selectedStates.length > 0 ||
                      (currentFilterParams.dueDate && currentFilterParams.dueDate !== 'all' && currentFilterParams.dueDate !== '') ||
                      currentFilterParams.supplierName.length > 0 ||
                      currentFilterParams.contractNumber.length > 0 ||
                      Object.keys(currentFilterParams.customFilterValues).some(key => currentFilterParams.customFilterValues[key]);
    
    setHasActiveFilters(hasFilters);
    setShowFilteredResults(hasFilters);

    // Debouncing: aplicar filtros após 800ms de inatividade para garantir estabilidade
    const timeoutId = setTimeout(() => {
      if (hasFilters) {
        applyFilters(currentFilterParams);
        lastAppliedFiltersRef.current = filterParamsHash; // Salvar o hash dos filtros aplicados
      } else {
        lastAppliedFiltersRef.current = ""; // Reset quando não há filtros
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [filterParamsHash, applyFilters]); // Dependência apenas do hash memoizado

  const handleCustomFilterChange = (filterId: string, value: unknown) => {
    setCustomFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };



  const handleViewContract = (contractId: string) => {
    toast({
      title: "Visualizar Contrato",
      description: `Abrindo detalhes do contrato ${contractId}...`
    });
  };

  const handleAnalyzeContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setAnalysisModalOpen(true);
    toast({
      title: "Análise de IA",
      description: `Carregando análise inteligente do contrato ${contractId}...`
    });
  };

  const resetFilters = () => {
    setFlowType([]);
    setContractValue([0, 10000000]);
    setPaymentValue([0, 10000000]);
    setRegion("");
    setSelectedStates([]);
    setDueDate("all");
    setCustomStart("");
    setCustomEnd("");
    setSupplierName([]);
    setContractNumber([]);
    setContractCount(10);
    setCustomFilterValues({});
    
    // Resetar estados da tabela
    setHasActiveFilters(false);
    setShowFilteredResults(false);
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados. Mostrando todos os contratos."
    });
  };

  // Preparar filtros para a FilterBar
  const filterItems: FilterItem[] = [
    {
      id: 'supplier',
      label: 'Fornecedor',
      activeCount: supplierName.length,
      isActive: supplierName.length > 0,
      component: (
        <FilterWrapper>
          <SupplierNameFilter
            value={supplierName}
            onChange={setSupplierName}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'contract',
      label: 'Número do Contrato',
      activeCount: contractNumber.length,
      isActive: contractNumber.length > 0,
      component: (
        <FilterWrapper>
          <ContractNumberFilter
            value={contractNumber}
            onChange={setContractNumber}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'flowtype',
      label: 'Tipo de Fluxo',
      activeCount: flowType.length,
      isActive: flowType.length > 0,
      component: (
        <FilterWrapper>
          <FlowTypeFilter value={flowType} onChange={setFlowType} />
        </FilterWrapper>
      )
    },
    {
      id: 'contractvalue',
      label: 'Valor do Contrato',
      activeCount: (contractValue[0] > 0 || contractValue[1] < 10000000) ? 1 : 0,
      isActive: contractValue[0] > 0 || contractValue[1] < 10000000,
      component: (
        <FilterWrapper>
          <ValueRangeFilter
            title="Valor do Contrato"
            min={0}
            max={10000000}
            value={contractValue}
            onChange={setContractValue}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'paymentvalue',
      label: 'Valor do Pagamento',
      activeCount: (paymentValue[0] > 0 || paymentValue[1] < 10000000) ? 1 : 0,
      isActive: paymentValue[0] > 0 || paymentValue[1] < 10000000,
      component: (
        <FilterWrapper>
          <ValueRangeFilter
            title="Valor do Pagamento"
            min={0}
            max={10000000}
            value={paymentValue}
            onChange={setPaymentValue}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'states',
      label: 'Estados',
      activeCount: selectedStates.length,
      isActive: selectedStates.length > 0,
      component: (
        <FilterWrapper>
          <LocationFilter
            region=""
            selectedStates={selectedStates}
            onRegionChange={() => {}}
            onStatesChange={setSelectedStates}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'duedate',
      label: 'Data de Vencimento',
      activeCount: (dueDate && dueDate !== 'all') ? 1 : 0,
      isActive: dueDate && dueDate !== 'all',
      component: (
        <FilterWrapper>
          <DueDateFilter
            value={dueDate}
            customStart={customStart}
            customEnd={customEnd}
            onChange={setDueDate}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </FilterWrapper>
      )
    },
    // Custom Filters
    ...customFilters.map((filter) => ({
      id: `custom-${filter.id}`,
      label: filter.name,
      activeCount: customFilterValues[filter.id] ? 1 : 0,
      isActive: !!customFilterValues[filter.id],
      component: (
        <FilterWrapper>
          <CustomFilterRenderer
            filter={filter}
            value={customFilterValues[filter.id]}
            onChange={(value) => handleCustomFilterChange(filter.id, value)}
          />
          <div className="pt-3 border-t border-gray-100 mt-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeFilter(filter.id)}
              className="w-full"
            >
              Remover Filtro
            </Button>
          </div>
        </FilterWrapper>
      )
    }))
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto">
        {/* Nova Barra de Filtros */}
        <FilterBar 
          filters={filterItems}
          onClearAll={resetFilters}
          onAddFilter={() => setIsModalOpen(true)}
        />
        
        {/* Contracts Table */}
        <div className="p-6">
          {/* Debug temporário */}
          <PaginatedContractsTable
            contracts={allContracts}
            filteredContracts={contracts}
            showFilteredResults={showFilteredResults}
            onViewContract={handleViewContract}
            onAnalyzeContract={handleAnalyzeContract}
            isLoading={showFilteredResults ? isLoading : allContractsLoading}
          />
        </div>
      </main>
      
      {/* Create Filter Modal */}
      <CreateFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addFilter}
      />
      
      {/* Contract Analysis Modal */}
      <ContractAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        contractId={selectedContractId}
      />
    </div>
  );
};

export default PaymentVerificationApp;
