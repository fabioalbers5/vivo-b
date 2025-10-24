import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle, Check, FileText, DollarSign, TrendingUp, AlertCircle, X, Filter, ChevronDown, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import SampleHistoryModal from "./SampleHistoryModal";
import { useContractFilters, LegacyContract } from "@/hooks/useContractFilters";
import { useAllContracts } from "@/hooks/useAllContracts";
import { useAnalysts } from "@/hooks/useAnalysts";
import { executeSamplingMotor, SamplingMotorType } from "@/utils/samplingEngines";
import { PaymentStatus, AlertType, ContractRisk } from "@/core/entities/Contract";
import { supabase } from "@/integrations/supabase/client";

// Tipo para itens de filtro
interface FilterItem {
  id: string;
  label: string;
  activeCount: number;
  isActive: boolean;
  component: React.ReactNode;
}

const PaymentVerificationApp = () => {
  const { toast } = useToast();
  const { contracts, isLoading, applyFilters: originalApplyFilters } = useContractFilters();
  const { allContracts, isLoading: allContractsLoading } = useAllContracts();
  const { analysts, isLoading: analystsLoading } = useAnalysts();
  
  // Estado para armazenar números de contratos já filtrados (em contratos_filtrados)
  const [filteredContractNumbers, setFilteredContractNumbers] = useState<Set<string>>(new Set());
  
  // Estado para mostrar resultados filtrados na tabela
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  // Estado para modals
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [analystModalOpen, setAnalystModalOpen] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  
  // Estado para sidebar de filtros
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());
  
  // Estado para seleção da amostra
  const [sampleSize, setSampleSize] = useState<number>(10);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  
  // Motor de amostragem
  const [samplingMotor, setSamplingMotor] = useState<SamplingMotorType>('highest-value');

  // Buscar contratos que já estão em contratos_filtrados
  useEffect(() => {
    const fetchFilteredContracts = async () => {
      try {
        const { data, error } = await supabase
          .from('contratos_filtrados')
          .select('numero_contrato');

        if (error) {
          console.error('Erro ao buscar contratos filtrados:', error);
          return;
        }

        if (data) {
          const contractNumbers = new Set(data.map(item => item.numero_contrato));
          setFilteredContractNumbers(contractNumbers);
          console.log(`📋 ${contractNumbers.size} contratos já estão em contratos_filtrados`);
        }
      } catch (error) {
        console.error('Erro ao buscar contratos filtrados:', error);
      }
    };

    fetchFilteredContracts();
  }, []);

  // Filtrar contratos disponíveis (excluindo os que já estão em contratos_filtrados)
  const availableContracts = useMemo(() => {
    return allContracts.filter(contract => !filteredContractNumbers.has(contract.number));
  }, [allContracts, filteredContractNumbers]);

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
  const [dueDate, setDueDate] = useState<string>("all"); // Mantido para compatibilidade - representa vencimento do pagamento
  const [contractDueDate, setContractDueDate] = useState<string>("all"); // Novo: vencimento do contrato
  const [paymentDueDate, setPaymentDueDate] = useState<string>("all"); // Novo: vencimento do pagamento (alias mais claro)
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

  // Limpar seleções inválidas quando os contratos disponíveis mudarem
  useEffect(() => {
    if (selectedPayments.size === 0) return; // Sem seleções, nada a fazer

    const availableContracts = showFilteredResults ? contracts : allContracts;
    const availableIds = new Set(
      availableContracts.map(contract => contract.id || `${contract.number}-${contract.supplier}`)
    );

    // Verificar se há seleções que não estão mais disponíveis
    const invalidSelections = Array.from(selectedPayments).filter(id => !availableIds.has(id));
    
    if (invalidSelections.length > 0) {
      // Remover seleções inválidas
      setSelectedPayments(prev => {
        const newSet = new Set(prev);
        invalidSelections.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [contracts, allContracts, showFilteredResults]); // Não incluir selectedPayments para evitar loop





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
    setContractDueDate("all");
    setPaymentDueDate("all");
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

  const handleOpenFilterSidebar = () => {
    setIsFilterSidebarOpen(true);
  };

  const handleCloseFilterSidebar = () => {
    setIsFilterSidebarOpen(false);
  };

  const handleClearFilters = () => {
    resetFilters();
    setIsFilterSidebarOpen(false);
  };

  const toggleFilterExpanded = (filterId: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
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
      'random': 'Personalizado',
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

    // Abrir modal de seleção de analista
    setAnalystModalOpen(true);
  };

  const handleDefineSample = async () => {
    if (!selectedAnalyst) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um analista responsável.",
        variant: "destructive"
      });
      return;
    }

    if (selectedPayments.size === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione pelo menos um contrato para a amostra.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Gerar amostra_id baseado na data atual (formato YYYY-MM-DD)
      const dataAtual = new Date();
      const ano = dataAtual.getFullYear();
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const amostraId = `${ano}-${mes}-${dia}`;

      // Mês de referência (formato YYYY-MM)
      const mesReferencia = `${ano}-${mes}`;

      // Obter contratos selecionados
      const contractsToUse = showFilteredResults ? contracts.filter(c => !filteredContractNumbers.has(c.number)) : availableContracts;
      const selectedIds = Array.from(selectedPayments);
      
      const selectedContractsList = contractsToUse.filter(contract => {
        const contractId = contract.id || `${contract.number}-${contract.supplier}`;
        return selectedIds.includes(contractId);
      });

      // Preparar dados para inserção
      const contractsToInsert = selectedContractsList.map(contract => ({
        numero_contrato: contract.number,
        mes_referencia: mesReferencia,
        usuario: selectedAnalyst,
        amostra_id: amostraId,
        data_analise: null
      }));

      console.log('📋 Inserindo contratos em contratos_filtrados:', {
        quantidade: contractsToInsert.length,
        analista: selectedAnalyst,
        amostraId: amostraId
      });

      // Inserir na tabela contratos_filtrados
      const { data, error } = await supabase
        .from('contratos_filtrados')
        .insert(contractsToInsert);

      if (error) {
        console.error('❌ Erro ao inserir contratos:', error);
        toast({
          title: "Erro",
          description: `Erro ao salvar amostra: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Contratos inseridos com sucesso');

      // Salvar metadados dos filtros usados nesta amostra
      try {
        const filterMetadata = {
          amostra_id: amostraId,
          flow_type: flowType,
          contract_value_min: contractValue[0],
          contract_value_max: contractValue[1],
          payment_value_min: paymentValue[0],
          payment_value_max: paymentValue[1],
          due_date: dueDate,
          custom_start: customStart || null,
          custom_end: customEnd || null,
          treasury_cycle: treasuryCycle,
          payment_status: paymentStatus,
          alert_type: alertType,
          risk_level: riskLevel,
          supplier_name: supplierName,
          contract_number: contractNumber,
          sample_size: sampleSize,
          sampling_motor: samplingMotor,
          contract_count: contractCount
        };

        const { error: metadataError } = await supabase
          .from('amostras_filtros_metadata' as any)
          .insert(filterMetadata);

        if (metadataError) {
          console.warn('⚠️ Erro ao salvar metadados dos filtros:', metadataError);
          // Não bloquear o processo por erro nos metadados
        } else {
          console.log('✅ Metadados dos filtros salvos com sucesso');
        }
      } catch (metadataError) {
        console.warn('⚠️ Erro ao salvar metadados dos filtros:', metadataError);
      }

      toast({
        title: "Amostra definida com sucesso!",
        description: `${selectedPayments.size} contrato(s) atribuído(s) ao analista ${selectedAnalyst}.`
      });
      
      // Atualizar lista de contratos filtrados
      const { data: newFilteredData } = await supabase
        .from('contratos_filtrados')
        .select('numero_contrato');

      if (newFilteredData) {
        const contractNumbers = new Set(newFilteredData.map(item => item.numero_contrato));
        setFilteredContractNumbers(contractNumbers);
      }

      // Fechar modal e resetar seleção
      setAnalystModalOpen(false);
      setSelectedAnalyst('');
      setSelectedPayments(new Set());
      
    } catch (error) {
      console.error('❌ Erro inesperado ao definir amostra:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar amostra. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Calcular estatísticas da amostra selecionada
  const sampleStats = useMemo(() => {
    // Usar availableContracts (que já exclui contratos_filtrados) 
    // ou filtrar ainda mais se houver filtros aplicados
    const contractsToUse = showFilteredResults ? contracts.filter(c => !filteredContractNumbers.has(c.number)) : availableContracts;
    
    // Converter Set para Array ordenado para garantir consistência
    const selectedIds = Array.from(selectedPayments).sort();
    
    // Filtrar apenas os contratos selecionados
    const selectedContractsList = contractsToUse.filter(contract => {
      const contractId = contract.id || `${contract.number}-${contract.supplier}`;
      return selectedIds.includes(contractId);
    });

    // Log para debug (remover depois)
    console.log('=== DEBUG CÁLCULO ===');
    console.log('Contratos selecionados:', selectedContractsList.length);
    console.log('IDs selecionados:', selectedIds);
    
    // Calcular soma dos valores - COM VALIDAÇÃO
    const totalValue = selectedContractsList.reduce((sum, contract, index) => {
      // Priorizar paymentValue, depois value, garantindo sempre o mesmo campo
      const contractValue = contract.paymentValue ?? contract.value ?? 0;
      
      // Validar se o valor é um número válido
      const validValue = typeof contractValue === 'number' && !isNaN(contractValue) ? contractValue : 0;
      
      // Log de cada contrato
      console.log(`Contrato ${index + 1}: ${contract.number}, Valor: ${validValue.toFixed(2)}`);
      
      return sum + validValue;
    }, 0);
    
    console.log('Total calculado:', totalValue.toFixed(2));
    console.log('====================');

    // Calcular valor total disponível - COM VALIDAÇÃO E DEBUG
    console.log('=== DEBUG TOTAL DISPONÍVEL ===');
    console.log('Total de contratos disponíveis:', contractsToUse.length);
    console.log('Fonte:', showFilteredResults ? 'FILTRADOS (excluindo contratos_filtrados)' : 'TODOS (excluindo contratos_filtrados)');
    
    const totalAvailableValue = contractsToUse.reduce((sum, contract, index) => {
      // Usar a mesma lógica para manter consistência
      const contractValue = contract.paymentValue ?? contract.value ?? 0;
      
      // Validar se o valor é um número válido
      const validValue = typeof contractValue === 'number' && !isNaN(contractValue) ? contractValue : 0;
      
      // Log dos primeiros 5 e últimos 5 contratos para debug
      if (index < 5 || index >= contractsToUse.length - 5) {
        console.log(`[${index}] ${contract.number}: paymentValue=${contract.paymentValue}, value=${contract.value}, usado=${validValue.toFixed(2)}`);
      } else if (index === 5) {
        console.log('... (contratos intermediários omitidos) ...');
      }
      
      return sum + validValue;
    }, 0);
    
    console.log('Total Disponível calculado:', totalAvailableValue.toFixed(2));
    console.log('==============================');

    // Calcular percentual
    const percentage = totalAvailableValue > 0 ? (totalValue / totalAvailableValue) * 100 : 0;

    return {
      count: selectedPayments.size,
      totalValue,
      totalAvailableValue,
      percentage,
      totalAvailable: contractsToUse.length
    };
  }, [selectedPayments, contracts, availableContracts, showFilteredResults, filteredContractNumbers]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para carregar e aplicar filtros de uma amostra reutilizada
  const handleReuseFilters = async (amostraId: string) => {
    try {
      console.log('🔄 Carregando filtros da amostra:', amostraId);

      // Buscar metadados dos filtros da amostra
      const { data: metadata, error } = await supabase
        .from('amostras_filtros_metadata' as any)
        .select('*')
        .eq('amostra_id', amostraId)
        .single();

      if (error) {
        console.error('Erro ao buscar metadados:', error);
        toast({
          title: "Aviso",
          description: "Não foi possível carregar os filtros desta amostra. Os metadados podem não estar disponíveis.",
          variant: "default"
        });
        return;
      }

      if (!metadata) {
        toast({
          title: "Aviso",
          description: "Esta amostra não possui metadados de filtros salvos.",
          variant: "default"
        });
        return;
      }

      console.log('✅ Metadados carregados:', metadata);

      // Aplicar os filtros salvos
      setFlowType((metadata as any).flow_type || []);
      setContractValue([
        (metadata as any).contract_value_min || 0,
        (metadata as any).contract_value_max || 10000000
      ]);
      setPaymentValue([
        (metadata as any).payment_value_min || 0,
        (metadata as any).payment_value_max || 10000000
      ]);
      setDueDate((metadata as any).due_date || 'all');
      setCustomStart((metadata as any).custom_start || '');
      setCustomEnd((metadata as any).custom_end || '');
      setTreasuryCycle((metadata as any).treasury_cycle || 'all');
      setPaymentStatus((metadata as any).payment_status || []);
      setAlertType((metadata as any).alert_type || []);
      setRiskLevel((metadata as any).risk_level || []);
      setSupplierName((metadata as any).supplier_name || []);
      setContractNumber((metadata as any).contract_number || []);
      setSampleSize((metadata as any).sample_size || 10);
      setSamplingMotor((metadata as any).sampling_motor || 'highest-value');
      setContractCount((metadata as any).contract_count || 10);

      toast({
        title: "Filtros aplicados!",
        description: "Os filtros da amostra selecionada foram aplicados com sucesso.",
      });

      // Fechar o modal de histórico
      setHistoryModalOpen(false);

    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os filtros da amostra.",
        variant: "destructive"
      });
    }
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
      id: 'paymentDueDate',
      label: 'Vencimento do Pagamento',
      activeCount: (paymentDueDate && paymentDueDate !== 'all') ? 1 : 0,
      isActive: paymentDueDate !== 'all',
      component: (
        <FilterWrapper>
          <DueDateFilter
            value={paymentDueDate}
            onChange={(value) => {
              setPaymentDueDate(value);
              setDueDate(value); // Manter sincronizado para compatibilidade
            }}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </FilterWrapper>
      )
    },
    {
      id: 'contractDueDate',
      label: 'Vencimento do Contrato',
      activeCount: (contractDueDate && contractDueDate !== 'all') ? 1 : 0,
      isActive: contractDueDate !== 'all',
      component: (
        <FilterWrapper>
          <DueDateFilter
            value={contractDueDate}
            onChange={setContractDueDate}
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
    <div className="h-full bg-background overflow-hidden">
      <main className="max-w-7xl mx-auto h-full flex flex-col">
        <Tabs defaultValue="selection" className="w-full flex flex-col h-full">
          <div className="bg-white border-b">
            <div className="flex items-center justify-between">
              <TabsList className="justify-start rounded-none border-b-0 bg-transparent p-0 h-auto">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryModalOpen(true)}
                  className="rounded-none border-b-2 border-transparent hover:border-primary hover:bg-transparent px-6 py-3 h-auto flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </Button>
              </TabsList>
              
              {/* Botões de Filtros */}
              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFilterSidebar}
                  className="h-7 gap-2"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {filterItems.filter(f => f.isActive).length}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 gap-2"
                  disabled={!hasActiveFilters}
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="selection" className="mt-0 flex-1 overflow-auto">
            {/* Contracts Table */}
            <div className="p-3">
              {/* Cabeçalho com controles da amostra */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-base font-semibold">
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
                        <SelectItem value="due-date">Data de vencimento</SelectItem>
                        <SelectItem value="random">Personalizado</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                {/* Número de Pagamentos Selecionados */}
                <Card className="hover:shadow-sm transition-shadow bg-white border-vivo-purple/20">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1 bg-vivo-purple/10">
                          <FileText className="h-3 w-3 text-vivo-purple" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">Pagamentos Selecionados</p>
                          <p className="text-lg font-bold text-vivo-purple">
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
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1 bg-blue-50">
                          <DollarSign className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">Valor Total</p>
                          <p className="text-base font-bold text-blue-600">
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
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1 bg-green-50">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">% do Valor Total</p>
                          <p className="text-lg font-bold text-green-600">
                            {sampleStats.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <PaginatedContractsTable
                contracts={availableContracts}
                filteredContracts={contracts}
                showFilteredResults={showFilteredResults}
                onViewContract={handleViewContract}
                onAnalyzeContract={handleAnalyzeContract}
                isLoading={showFilteredResults ? isLoading : allContractsLoading}
                selectedContracts={selectedPayments}
                onSelectionChange={setSelectedPayments}
              />
            </div>
          </TabsContent>          <TabsContent value="management" className="mt-0 flex-1 overflow-auto">
            <div className="p-3">
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

      {/* Analyst Selection Modal */}
      <Dialog open={analystModalOpen} onOpenChange={setAnalystModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Definir Analista Responsável</DialogTitle>
            <DialogDescription>
              Selecione o analista que ficará responsável pela análise desta amostra de {selectedPayments.size} pagamento(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="analyst">Analista</Label>
              <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
                <SelectTrigger id="analyst">
                  <SelectValue placeholder="Selecione um analista..." />
                </SelectTrigger>
                <SelectContent>
                  {analystsLoading ? (
                    <SelectItem value="loading" disabled>
                      Carregando analistas...
                    </SelectItem>
                  ) : analysts.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum analista encontrado
                    </SelectItem>
                  ) : (
                    analysts.map((analyst) => (
                      <SelectItem key={analyst} value={analyst}>
                        {analyst}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAnalystModalOpen(false);
                setSelectedAnalyst('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDefineSample}
              disabled={!selectedAnalyst || analystsLoading}
              className="bg-vivo-purple hover:bg-vivo-purple/90"
            >
              Definir Amostra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar de Filtros */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-white border-l shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isFilterSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              {hasActiveFilters && (
                <Badge className="bg-blue-500 text-white h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                  {filterItems.filter(f => f.isActive).length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className="text-gray-500 hover:text-gray-700 text-sm h-auto p-0 font-normal"
            >
              Clear all
            </Button>
          </div>

          {/* Filtros - Lista Simples */}
          <div className="flex-1 overflow-y-auto">
            {filterItems.map((filter) => {
              return (
                <div key={filter.id} className="border-b border-gray-100 last:border-0 px-4 py-3">
                  {filter.component}
                </div>
              );
            })}
          </div>

          {/* Footer com Botões */}
          <div className="p-4 border-t bg-gray-50">
            <Button
              onClick={handleCloseFilterSidebar}
              className="w-full bg-vivo-purple hover:bg-vivo-purple/90 text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay quando sidebar está aberta */}
      {isFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleCloseFilterSidebar}
        />
      )}

      {/* Modal de Histórico */}
      <SampleHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        onLoadSample={(amostraId) => {
          // Callback quando uma amostra for carregada
          console.log('Amostra carregada:', amostraId);
        }}
        onReuseFilters={handleReuseFilters}
      />
    </div>
  );
};

export default PaymentVerificationApp;
