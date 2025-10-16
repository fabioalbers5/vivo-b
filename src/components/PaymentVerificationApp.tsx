import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle, Check, FileText, DollarSign, TrendingUp, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import FilterBar, { FilterItem } from "./FilterBar";
import FlowTypeFilter from "./filters/FlowTypeFilter";
import ValueRangeFilter from "./filters/ValueRangeFilter";
import DueDateFilter from "./filters/DueDateFilter";
import SupplierNameFilter from "./filters/SupplierNameFilter";
import ContractNumberFilter from "./filters/ContractNumberFilter";
import TreasuryCycleFilter from "./filters/TreasuryCycleFilter";
import { PaymentStatusFilter, AlertTypeFilter, RiskFilter } from "./filters/vivo/VivoSelectFilters";
import FilterWrapper from "./FilterWrapper";
import PaginatedContractsTable from "./PaginatedContractsTable";
import ContractAnalysisModal from "./ContractAnalysisModal";
import SampleManagementTab from "./SampleManagementTab";
import { useContractFilters, LegacyContract } from "@/hooks/useContractFilters";
import { useAllContracts } from "@/hooks/useAllContracts";
import { executeSamplingMotor, SamplingMotorType } from "@/utils/samplingEngines";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatus, AlertType, ContractRisk } from "@/core/entities/Contract";



const PaymentVerificationApp = () => {
  const { toast } = useToast();
  const { contracts, isLoading, applyFilters: originalApplyFilters } = useContractFilters();
  const { allContracts, isLoading: allContractsLoading } = useAllContracts();
  
  // Estado para mostrar resultados filtrados na tabela
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  // Estado para modals
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  
  // Estado para seleção da amostra
  const [sampleSize, setSampleSize] = useState<number>(10);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  
  // Motor de amostragem
  const [samplingMotor, setSamplingMotor] = useState<SamplingMotorType>('highest-value');

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
  const [dueDate, setDueDate] = useState<string>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string[]>([]);
  const [contractNumber, setContractNumber] = useState<string[]>([]);
  const [contractCount, setContractCount] = useState<number>(10);
  
  // Vivo specific filter states
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([]);
  const [alertType, setAlertType] = useState<AlertType[]>([]);
  const [riskLevel, setRiskLevel] = useState<ContractRisk[]>([]);
  const [treasuryCycle, setTreasuryCycle] = useState<string>("all");
  
  // Custom filter values
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, unknown>>({});

  // Referência para manter o último conjunto de filtros aplicado
  const lastAppliedFiltersRef = useRef<string>("");

  // Memoizar os parâmetros do filtro e convertê-los para uma string estável
  const filterParamsHash = useMemo(() => {
    const params = {
      flowType: flowType.sort(),
      contractValue,
      paymentValue,
      dueDate,
      customStart,
      customEnd,
      supplierName: supplierName.sort(),
      contractNumber: contractNumber.sort(),
      contractCount,
      customFilterValues
    };
    return JSON.stringify(params);
  }, [flowType, contractValue, paymentValue, dueDate, customStart, customEnd, supplierName, contractNumber, contractCount, customFilterValues]);

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
      dueDate,
      customStart,
      customEnd,
      supplierName,
      contractNumber,
      contractCount,
      customFilterValues,
      customFilters: []
    };

    // Verificar se há filtros ativos
    const hasFilters = currentFilterParams.flowType.length > 0 || 
                      currentFilterParams.contractValue[0] > 0 || currentFilterParams.contractValue[1] < 10000000 ||
                      currentFilterParams.paymentValue[0] > 0 || currentFilterParams.paymentValue[1] < 10000000 ||
                      (currentFilterParams.dueDate && currentFilterParams.dueDate !== 'all' && currentFilterParams.dueDate !== '') ||
                      (treasuryCycle && treasuryCycle !== 'all') ||
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
    setDueDate("all");
    setCustomStart("");
    setCustomEnd("");
    setSupplierName([]);
    setContractNumber([]);
    setContractCount(10);
    setPaymentStatus([]);
    setAlertType([]);
    setRiskLevel([]);
    setTreasuryCycle("all");
    setCustomFilterValues({});
    
    // Resetar estados da tabela
    setHasActiveFilters(false);
    setShowFilteredResults(false);
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados. Mostrando todos os contratos."
    });
  };

  const handleGenerateSample = () => {
    const availableContracts = showFilteredResults ? contracts : allContracts;
    
    if (availableContracts.length === 0) {
      toast({
        title: "Erro",
        description: "Não há pagamentos disponíveis para gerar amostra.",
        variant: "destructive"
      });
      return;
    }

    // Executar o motor selecionado
    const newSelection = executeSamplingMotor(
      samplingMotor,
      availableContracts,
      sampleSize
    );
    
    setSelectedPayments(newSelection);
    
    const motorLabels: Record<SamplingMotorType, string> = {
      'highest-value': 'Maior Valor',
      'top-suppliers': 'Top Fornecedores',
      'random': 'Aleatório',
      'due-date': 'Data de Vencimento'
    };
    
    toast({
      title: "Amostra gerada",
      description: `${newSelection.size} pagamento(s) selecionado(s) usando o motor "${motorLabels[samplingMotor]}".`
    });
  };

  const handleClearSelection = () => {
    setSelectedPayments(new Set());
    
    toast({
      title: "Seleção limpa",
      description: "Todos os contratos foram desmarcados."
    });
  };

  const handleFinalize = () => {
    if (selectedPayments.size === 0) {
      toast({
        title: "Atenção",
        description: "Nenhum pagamento selecionado.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Amostra finalizada",
      description: `${selectedPayments.size} pagamento(s) pronto(s) para análise.`
    });
    // Aqui você pode adicionar a lógica para finalizar a amostra
  };

  // Calcular estatísticas da amostra selecionada
  const sampleStats = useMemo(() => {
    const availableContracts = showFilteredResults ? contracts : allContracts;
    
    // Filtrar apenas os contratos selecionados
    const selectedContractsList = availableContracts.filter(contract => {
      const contractId = contract.id || `${contract.number}-${contract.supplier}`;
      return selectedPayments.has(contractId);
    });

    // Calcular soma dos valores
    const totalValue = selectedContractsList.reduce((sum, contract) => {
      return sum + (contract.paymentValue || contract.value || 0);
    }, 0);

    // Calcular valor total disponível
    const totalAvailableValue = availableContracts.reduce((sum, contract) => {
      return sum + (contract.paymentValue || contract.value || 0);
    }, 0);

    // Calcular percentual
    const percentage = totalAvailableValue > 0 ? (totalValue / totalAvailableValue) * 100 : 0;

    return {
      count: selectedPayments.size,
      totalValue,
      totalAvailableValue,
      percentage,
      totalAvailable: availableContracts.length
    };
  }, [selectedPayments, contracts, allContracts, showFilteredResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Array de filtros para o FilterBar
  const filterItems: FilterItem[] = useMemo(() => [
    {
      id: 'flowType',
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
      id: 'paymentValue',
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
      id: 'contractValue',
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
      id: 'dueDate',
      label: 'Vencimento',
      activeCount: (dueDate && dueDate !== 'all') ? 1 : 0,
      isActive: dueDate !== 'all',
      component: (
        <FilterWrapper>
          <DueDateFilter
            value={dueDate}
            onChange={setDueDate}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'treasuryCycle',
      label: 'Ciclo de Tesouraria',
      activeCount: (treasuryCycle && treasuryCycle !== 'all') ? 1 : 0,
      isActive: treasuryCycle !== 'all',
      component: (
        <FilterWrapper>
          <TreasuryCycleFilter
            value={treasuryCycle}
            onChange={setTreasuryCycle}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'supplier',
      label: 'Fornecedor',
      activeCount: supplierName.length,
      isActive: supplierName.length > 0,
      component: (
        <FilterWrapper>
          <SupplierNameFilter value={supplierName} onChange={setSupplierName} />
        </FilterWrapper>
      )
    },
    {
      id: 'contractNumber',
      label: 'Número do Contrato',
      activeCount: contractNumber.length,
      isActive: contractNumber.length > 0,
      component: (
        <FilterWrapper>
          <ContractNumberFilter value={contractNumber} onChange={setContractNumber} />
        </FilterWrapper>
      )
    }
  ], [flowType, contractValue, paymentValue, dueDate, customStart, customEnd, treasuryCycle, supplierName, contractNumber]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto">
        <Tabs defaultValue="selection" className="w-full">
          <div className="bg-white border-b">
            <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="selection" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Seleção da Amostra
              </TabsTrigger>
              <TabsTrigger 
                value="management" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Gestão de Amostra
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="selection" className="mt-0">
            {/* Contracts Table */}
            <div className="p-6">
              {/* Cabeçalho com controles da amostra */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {showFilteredResults ? 
                      `Pagamentos Filtrados ${isLoading ? "" : `(${contracts.length})`}` : 
                      `Todos os Pagamentos`
                    }
                  </h2>
                  {showFilteredResults && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Filtros ativos
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Motor de Amostragem */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="samplingMotor" className="text-sm whitespace-nowrap text-gray-600">
                      Motor:
                    </Label>
                    <Select value={samplingMotor} onValueChange={(value) => setSamplingMotor(value as SamplingMotorType)}>
                      <SelectTrigger id="samplingMotor" className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highest-value">Maior valor</SelectItem>
                        <SelectItem value="top-suppliers">Top fornecedores</SelectItem>
                        <SelectItem value="random">Aleatório</SelectItem>
                        <SelectItem value="due-date">Data de vencimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Tamanho da Amostra */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sampleSize" className="text-sm whitespace-nowrap text-gray-600">
                      Tamanho:
                    </Label>
                    <Input
                      id="sampleSize"
                      type="number"
                      min="1"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-8 text-sm"
                    />
                  </div>
                  
                  <Button
                    onClick={handleGenerateSample}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                  >
                    <Shuffle className="h-3 w-3 mr-1.5" />
                    Gerar amostra
                  </Button>
                  
                  <Button
                    onClick={handleClearSelection}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs hover:bg-red-500 hover:text-white hover:border-red-500"
                    disabled={selectedPayments.size === 0}
                  >
                    <X className="h-3 w-3 mr-1.5" />
                    Limpar seleção
                  </Button>
                  
                  <Button
                    onClick={handleFinalize}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                  >
                    <Check className="h-3 w-3 mr-1.5" />
                    Finalizar
                  </Button>
                </div>
              </div>

              {/* Cards de Estatísticas da Amostra */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Número de Pagamentos Selecionados */}
                <Card className="hover:shadow-sm transition-shadow bg-white border-vivo-purple/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1.5 bg-vivo-purple/10">
                          <FileText className="h-3.5 w-3.5 text-vivo-purple" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">Pagamentos Selecionados</p>
                          <p className="text-xl font-bold text-vivo-purple">
                            {sampleStats.count}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        de {sampleStats.totalAvailable}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Soma dos Valores */}
                <Card className="hover:shadow-sm transition-shadow bg-white border-blue-200/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1.5 bg-blue-50">
                          <DollarSign className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">Valor Total</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(sampleStats.totalValue)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        de {formatCurrency(sampleStats.totalAvailableValue)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Percentual do Valor Total */}
                <Card className="hover:shadow-sm transition-shadow bg-white border-green-200/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1.5 bg-green-50">
                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">% do Valor Total</p>
                          <p className="text-xl font-bold text-green-600">
                            {sampleStats.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FilterBar - sempre expandido por padrão */}
              <div className="mb-4">
                <FilterBar 
                  filters={filterItems} 
                  onClearAll={resetFilters}
                />
              </div>
              
              <PaginatedContractsTable
                contracts={allContracts}
                filteredContracts={contracts}
                showFilteredResults={showFilteredResults}
                onViewContract={handleViewContract}
                onAnalyzeContract={handleAnalyzeContract}
                isLoading={showFilteredResults ? isLoading : allContractsLoading}
                selectedContracts={selectedPayments}
                onSelectionChange={setSelectedPayments}
              />
            </div>
          </TabsContent>          <TabsContent value="management" className="mt-0">
            <div className="p-6">
              <SampleManagementTab />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
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
