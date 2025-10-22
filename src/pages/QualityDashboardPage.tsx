import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { TrendingUp, AlertTriangle, DollarSign, FileText, Database, CheckCircle, UserCheck, BarChart3, Eye, ArrowUp, ArrowDown, ArrowUpDown, RefreshCw, ChevronsUpDown, Check } from 'lucide-react';
import { useFilteredContractsOnly } from '@/hooks/useFilteredContractsOnly';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useToast } from '@/hooks/use-toast';
import { LegacyContract } from '@/hooks/useContractFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const QualityDashboardPage: React.FC = () => {
  // Estados para filtros
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedAnalysisStatus, setSelectedAnalysisStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [openSupplierCombo, setOpenSupplierCombo] = useState(false);
  const [openContractCombo, setOpenContractCombo] = useState(false);
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('quantity');
  
  // Estados para modal de alertas
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [selectedForNextSample, setSelectedForNextSample] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { toast } = useToast();

  // Hooks para dados
  const { contracts: allContracts, isLoading: contractsLoading } = useFilteredContractsOnly({ 
    sampleId: 'all' 
  });
  const { sampleHistory, isLoading: historyLoading } = useSampleHistory();

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar valores abreviados
  const formatAbbreviatedValue = (value: number): string => {
    if (value >= 1000000000) {
      return `R$ ${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(2)}k`;
    }
    return `R$ ${value.toFixed(2)}`;
  };

  // Função para formatar data
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Handlers do modal
  const handleOpenAlertsModal = () => {
    setIsAlertsModalOpen(true);
  };

  const handleCloseAlertsModal = () => {
    setIsAlertsModalOpen(false);
  };

  const handleToggleSelection = (contractId: string) => {
    const newSelection = new Set(selectedForNextSample);
    if (newSelection.has(contractId)) {
      newSelection.delete(contractId);
    } else {
      newSelection.add(contractId);
    }
    setSelectedForNextSample(newSelection);
  };

  const handleSelectAll = (contracts: LegacyContract[]) => {
    if (selectedForNextSample.size === contracts.length) {
      setSelectedForNextSample(new Set());
    } else {
      setSelectedForNextSample(new Set(contracts.map(c => c.id || c.number)));
    }
  };

  const handleSaveToNextSample = () => {
    if (selectedForNextSample.size === 0) {
      toast({
        title: "Nenhum pagamento selecionado",
        description: "Selecione pelo menos um pagamento para adicionar à próxima amostragem.",
        variant: "destructive"
      });
      return;
    }

    // Aqui você pode implementar a lógica de salvar no banco de dados
    console.log('Pagamentos selecionados para próxima amostragem:', Array.from(selectedForNextSample));
    
    toast({
      title: "Sucesso!",
      description: `${selectedForNextSample.size} pagamento(s) marcado(s) para próxima amostragem.`,
    });

    setSelectedForNextSample(new Set());
    setIsAlertsModalOpen(false);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Obter lista única de fornecedores
  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set(
      allContracts
        .map(c => c.supplier)
        .filter(s => s && s.trim() !== '')
    );
    return Array.from(suppliers).sort();
  }, [allContracts]);

  // Obter lista única de contratos
  const uniqueContracts = useMemo(() => {
    const contracts = new Set(
      allContracts
        .map(c => c.number)
        .filter(n => n && n.trim() !== '')
    );
    return Array.from(contracts).sort();
  }, [allContracts]);

  // Filtrar contratos baseado nos filtros selecionados
  const filteredContracts = useMemo(() => {
    let filtered = [...allContracts];

    // Filtro por data de vencimento
    if (selectedDateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(c => {
        if (!c.dueDate) return false;
        
        const dueDate = new Date(c.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (selectedDateRange) {
          case '7d':
            return diffDays >= 0 && diffDays <= 7;
          case '30d':
            return diffDays >= 0 && diffDays <= 30;
          case '90d':
            return diffDays >= 0 && diffDays <= 90;
          default:
            return true;
        }
      });
    }

    // Filtro por status de análise
    if (selectedAnalysisStatus !== 'all') {
      filtered = filtered.filter(c => c.analysisStatus === selectedAnalysisStatus);
    }

    // Filtro por fornecedor
    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(c => c.supplier === selectedSupplier);
    }

    // Filtro por contrato
    if (selectedContract !== 'all') {
      filtered = filtered.filter(c => c.number === selectedContract);
    }

    return filtered;
  }, [allContracts, selectedDateRange, selectedAnalysisStatus, selectedSupplier, selectedContract]);

  // Calcular métricas gerais
  const generalMetrics = useMemo(() => {
    const totalContracts = filteredContracts.length;
    const contractsWithAlert = filteredContracts.filter(
      c => c.alertType && c.alertType !== 'Contrato aprovado'
    ).length;
    const totalPaymentValue = filteredContracts.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);
    const alertPaymentValue = filteredContracts
      .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
      .reduce((sum, c) => {
        const value = c.paymentValue ?? c.value ?? 0;
        return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
      }, 0);
    
    // Contratos auditáveis (sem alerta ou aprovados)
    const auditableContracts = filteredContracts.filter(
      c => !c.alertType || c.alertType === 'Contrato aprovado'
    ).length;
    const auditablePaymentValue = filteredContracts
      .filter(c => !c.alertType || c.alertType === 'Contrato aprovado')
      .reduce((sum, c) => {
        const value = c.paymentValue ?? c.value ?? 0;
        return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
      }, 0);

    return {
      totalContracts,
      contractsWithAlert,
      totalPaymentValue,
      alertPaymentValue,
      auditableContracts,
      auditablePaymentValue
    };
  }, [filteredContracts]);

  // Obter contratos com alerta para o modal
  const contractsWithAlerts = useMemo(() => {
    return filteredContracts.filter(
      c => c.alertType && c.alertType !== 'Contrato aprovado'
    );
  }, [filteredContracts]);

  // Calcular dados para "Todas as Amostras"
  const allSamplesData = useMemo(() => {
    // Contar amostras únicas baseado nos contratos filtrados
    const uniqueSampleIds = new Set(
      filteredContracts
        .map(c => c.sampleId)
        .filter(id => id && id !== '')
    );
    
    const totalPaymentValue = filteredContracts.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);

    // Agrupar por tipo de fluxo - quantidade
    const flowTypeCounts: Record<string, number> = {};
    filteredContracts.forEach(c => {
      const type = c.type || 'Não especificado';
      flowTypeCounts[type] = (flowTypeCounts[type] || 0) + 1;
    });

    // Agrupar por tipo de fluxo - valor
    const flowTypeValues: Record<string, number> = {};
    filteredContracts.forEach(c => {
      const type = c.type || 'Não especificado';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      flowTypeValues[type] = (flowTypeValues[type] || 0) + validValue;
    });

    return {
      sampleCount: uniqueSampleIds.size,
      paymentCount: filteredContracts.length, // Total de pagamentos
      totalPaymentValue,
      flowTypeCountsData: Object.entries(flowTypeCounts).map(([name, value]) => ({ name, value })),
      flowTypeValuesData: Object.entries(flowTypeValues).map(([name, value]) => ({ name, value }))
    };
  }, [filteredContracts]);

  // Calcular dados para "Aprovados em Checagem Básica"
  const basicCheckData = useMemo(() => {
    const basicApproved = filteredContracts.filter(c => 
      c.alertType === 'Contrato aprovado' || !c.alertType
    );
    
    const uniqueSampleIds = new Set(
      basicApproved
        .map(c => c.sampleId)
        .filter(id => id && id !== '')
    );
    
    const totalPaymentValue = basicApproved.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);

    const flowTypeCounts: Record<string, number> = {};
    basicApproved.forEach(c => {
      const type = c.type || 'Não especificado';
      flowTypeCounts[type] = (flowTypeCounts[type] || 0) + 1;
    });

    const flowTypeValues: Record<string, number> = {};
    basicApproved.forEach(c => {
      const type = c.type || 'Não especificado';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      flowTypeValues[type] = (flowTypeValues[type] || 0) + validValue;
    });

    // Calcular alertas na checagem básica
    const contractsWithAlerts = filteredContracts.filter(c => 
      c.alertType && c.alertType !== 'Contrato aprovado'
    );
    
    const alertsCount = contractsWithAlerts.length;
    const alertsValue = contractsWithAlerts.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);

    // Agrupar alertas por tipo
    const alertTypeCounts: Record<string, number> = {};
    contractsWithAlerts.forEach(c => {
      const alertType = c.alertType || 'Sem tipo';
      alertTypeCounts[alertType] = (alertTypeCounts[alertType] || 0) + 1;
    });

    const alertTypeValues: Record<string, number> = {};
    contractsWithAlerts.forEach(c => {
      const alertType = c.alertType || 'Sem tipo';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      alertTypeValues[alertType] = (alertTypeValues[alertType] || 0) + validValue;
    });

    return {
      sampleCount: uniqueSampleIds.size,
      paymentCount: basicApproved.length, // Total de pagamentos aprovados
      totalPaymentValue,
      flowTypeCountsData: Object.entries(flowTypeCounts).map(([name, value]) => ({ name, value })),
      flowTypeValuesData: Object.entries(flowTypeValues).map(([name, value]) => ({ name, value })),
      alertsCount,
      alertsValue,
      alertTypeCountsData: Object.entries(alertTypeCounts).map(([name, value]) => ({ name, value })),
      alertTypeValuesData: Object.entries(alertTypeValues).map(([name, value]) => ({ name, value }))
    };
  }, [filteredContracts]);

  // Calcular dados para "Aprovados em Análise Humana"
  const humanAnalysisData = useMemo(() => {
    const humanApproved = filteredContracts.filter(c => 
      c.analysisStatus === 'completed'
    );
    
    const uniqueSampleIds = new Set(
      humanApproved
        .map(c => c.sampleId)
        .filter(id => id && id !== '')
    );
    
    const totalPaymentValue = humanApproved.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);

    const flowTypeCounts: Record<string, number> = {};
    humanApproved.forEach(c => {
      const type = c.type || 'Não especificado';
      flowTypeCounts[type] = (flowTypeCounts[type] || 0) + 1;
    });

    const flowTypeValues: Record<string, number> = {};
    humanApproved.forEach(c => {
      const type = c.type || 'Não especificado';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      flowTypeValues[type] = (flowTypeValues[type] || 0) + validValue;
    });

    return {
      sampleCount: uniqueSampleIds.size,
      paymentCount: humanApproved.length, // Total de pagamentos aprovados por humanos
      totalPaymentValue,
      flowTypeCountsData: Object.entries(flowTypeCounts).map(([name, value]) => ({ name, value })),
      flowTypeValuesData: Object.entries(flowTypeValues).map(([name, value]) => ({ name, value }))
    };
  }, [filteredContracts]);

  // Calcular dados para gráficos empilhados de análise básica e humana
  const analysisStackedData = useMemo(() => {
    // Análise Básica - Aprovados vs Rejeitados por fluxo
    const basicApprovedByFlow: Record<string, number> = {};
    const basicApprovedValueByFlow: Record<string, number> = {};
    const basicRejectedByFlow: Record<string, number> = {};
    const basicRejectedValueByFlow: Record<string, number> = {};

    filteredContracts.forEach(c => {
      const type = c.type || 'Não especificado';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      
      if (c.alertType === 'Contrato aprovado' || !c.alertType) {
        basicApprovedByFlow[type] = (basicApprovedByFlow[type] || 0) + 1;
        basicApprovedValueByFlow[type] = (basicApprovedValueByFlow[type] || 0) + validValue;
      } else {
        basicRejectedByFlow[type] = (basicRejectedByFlow[type] || 0) + 1;
        basicRejectedValueByFlow[type] = (basicRejectedValueByFlow[type] || 0) + validValue;
      }
    });

    // Análise Humana - Aprovados, Rejeitados e Devolvidos por fluxo
    const humanApprovedByFlow: Record<string, number> = {};
    const humanApprovedValueByFlow: Record<string, number> = {};
    const humanRejectedByFlow: Record<string, number> = {};
    const humanRejectedValueByFlow: Record<string, number> = {};
    const humanReturnedByFlow: Record<string, number> = {};
    const humanReturnedValueByFlow: Record<string, number> = {};

    filteredContracts.forEach(c => {
      const type = c.type || 'Não especificado';
      const value = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      
      if (c.analysisStatus === 'completed') {
        humanApprovedByFlow[type] = (humanApprovedByFlow[type] || 0) + 1;
        humanApprovedValueByFlow[type] = (humanApprovedValueByFlow[type] || 0) + validValue;
      } else if (c.analysisStatus === 'rejected') {
        humanRejectedByFlow[type] = (humanRejectedByFlow[type] || 0) + 1;
        humanRejectedValueByFlow[type] = (humanRejectedValueByFlow[type] || 0) + validValue;
      } else if (c.analysisStatus === 'pending' || c.analysisStatus === 'in_progress') {
        humanReturnedByFlow[type] = (humanReturnedByFlow[type] || 0) + 1;
        humanReturnedValueByFlow[type] = (humanReturnedValueByFlow[type] || 0) + validValue;
      }
    });

    // Combinar todos os tipos de fluxo
    const allFlowTypes = new Set([
      ...Object.keys(basicApprovedByFlow),
      ...Object.keys(basicRejectedByFlow),
      ...Object.keys(humanApprovedByFlow),
      ...Object.keys(humanRejectedByFlow),
      ...Object.keys(humanReturnedByFlow)
    ]);

    const basicAnalysisCountData = Array.from(allFlowTypes).map(name => ({
      name,
      aprovados: basicApprovedByFlow[name] || 0,
      rejeitados: basicRejectedByFlow[name] || 0
    }));

    const basicAnalysisValueData = Array.from(allFlowTypes).map(name => ({
      name,
      aprovados: basicApprovedValueByFlow[name] || 0,
      rejeitados: basicRejectedValueByFlow[name] || 0
    }));

    const humanAnalysisCountData = Array.from(allFlowTypes).map(name => ({
      name,
      aprovados: humanApprovedByFlow[name] || 0,
      rejeitados: humanRejectedByFlow[name] || 0,
      devolvidos: humanReturnedByFlow[name] || 0
    }));

    const humanAnalysisValueData = Array.from(allFlowTypes).map(name => ({
      name,
      aprovados: humanApprovedValueByFlow[name] || 0,
      rejeitados: humanRejectedValueByFlow[name] || 0,
      devolvidos: humanReturnedValueByFlow[name] || 0
    }));

    // Calcular totais para legendas
    const basicApprovedTotal = Object.values(basicApprovedByFlow).reduce((a, b) => a + b, 0);
    const basicApprovedValueTotal = Object.values(basicApprovedValueByFlow).reduce((a, b) => a + b, 0);
    const basicRejectedTotal = Object.values(basicRejectedByFlow).reduce((a, b) => a + b, 0);
    const basicRejectedValueTotal = Object.values(basicRejectedValueByFlow).reduce((a, b) => a + b, 0);

    const humanApprovedTotal = Object.values(humanApprovedByFlow).reduce((a, b) => a + b, 0);
    const humanApprovedValueTotal = Object.values(humanApprovedValueByFlow).reduce((a, b) => a + b, 0);
    const humanRejectedTotal = Object.values(humanRejectedByFlow).reduce((a, b) => a + b, 0);
    const humanRejectedValueTotal = Object.values(humanRejectedValueByFlow).reduce((a, b) => a + b, 0);
    const humanReturnedTotal = Object.values(humanReturnedByFlow).reduce((a, b) => a + b, 0);
    const humanReturnedValueTotal = Object.values(humanReturnedValueByFlow).reduce((a, b) => a + b, 0);

    return {
      basicAnalysisCountData,
      basicAnalysisValueData,
      humanAnalysisCountData,
      humanAnalysisValueData,
      basicTotals: {
        aprovados: basicApprovedTotal,
        aprovadosValue: basicApprovedValueTotal,
        rejeitados: basicRejectedTotal,
        rejeitadosValue: basicRejectedValueTotal
      },
      humanTotals: {
        aprovados: humanApprovedTotal,
        aprovadosValue: humanApprovedValueTotal,
        rejeitados: humanRejectedTotal,
        rejeitadosValue: humanRejectedValueTotal,
        devolvidos: humanReturnedTotal,
        devolvidosValue: humanReturnedValueTotal
      }
    };
  }, [filteredContracts]);

  const isLoading = contractsLoading || historyLoading;

  return (
    <div className="h-full flex flex-col">
      {/* Filtros */}
      <div className="pl-8 pr-8 pb-2 pt-2 border-b border-gray-100">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            {/* Filtro Data */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                Período:
              </label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Status */}
            <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <Select value={selectedAnalysisStatus} onValueChange={setSelectedAnalysisStatus}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Fornecedor */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Fornecedor:
            </label>
            <Popover open={openSupplierCombo} onOpenChange={setOpenSupplierCombo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSupplierCombo}
                  className="w-48 h-8 justify-between text-xs"
                >
                  {selectedSupplier === 'all'
                    ? "Todos os fornecedores"
                    : uniqueSuppliers.find((supplier) => supplier === selectedSupplier) || "Selecionar..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-0">
                <Command>
                  <CommandInput placeholder="Buscar fornecedor..." className="h-8" />
                  <CommandList>
                    <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedSupplier('all');
                          setOpenSupplierCombo(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSupplier === 'all' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todos os Fornecedores
                      </CommandItem>
                      {uniqueSuppliers.map((supplier) => (
                        <CommandItem
                          key={supplier}
                          value={supplier}
                          onSelect={(currentValue) => {
                            setSelectedSupplier(currentValue);
                            setOpenSupplierCombo(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSupplier === supplier ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {supplier}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Contrato */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Contrato:
            </label>
            <Popover open={openContractCombo} onOpenChange={setOpenContractCombo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openContractCombo}
                  className="w-40 h-8 justify-between text-xs"
                >
                  {selectedContract === 'all'
                    ? "Todos os contratos"
                    : uniqueContracts.find((contract) => contract === selectedContract) || "Selecionar..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Buscar contrato..." className="h-8" />
                  <CommandList>
                    <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedContract('all');
                          setOpenContractCombo(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedContract === 'all' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Todos os Contratos
                      </CommandItem>
                      {uniqueContracts.map((contract) => (
                        <CommandItem
                          key={contract}
                          value={contract}
                          onSelect={(currentValue) => {
                            setSelectedContract(currentValue);
                            setOpenContractCombo(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedContract === contract ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {contract}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          </div>

          {/* Toggle Quantidade/Valor */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Visualizar:
            </label>
            <div className="flex rounded-md border border-gray-200 overflow-hidden h-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('quantity')}
                className={`h-full rounded-none px-3 text-xs ${
                  viewMode === 'quantity'
                    ? 'bg-vivo-purple text-white hover:bg-vivo-purple/90'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Quantidade
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('value')}
                className={`h-full rounded-none px-3 text-xs border-l ${
                  viewMode === 'value'
                    ? 'bg-vivo-purple text-white hover:bg-vivo-purple/90'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Valor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Análise */}
      <div className="p-3 flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-2 h-9">
            <TabsTrigger value="all" className="flex items-center gap-1.5 text-xs py-1">
              <Database className="h-3.5 w-3.5" />
              Todos os Pagamentos
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-1.5 text-xs py-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Aprovados em Checagem Básica
            </TabsTrigger>
            <TabsTrigger value="human" className="flex items-center gap-1.5 text-xs py-1">
              <UserCheck className="h-3.5 w-3.5" />
              Aprovados em Análise Humana
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1.5 text-xs py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alertas
            </TabsTrigger>
          </TabsList>

          {/* Todas as Amostras */}
          <TabsContent value="all" className="space-y-2">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-4 gap-2">
              {/* Card: Todos os Pagamentos */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Todos os Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold text-vivo-purple">
                    {viewMode === 'quantity' 
                      ? allSamplesData.paymentCount 
                      : formatCurrency(allSamplesData.totalPaymentValue)
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Card: Aprovados em Verificação Básica */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Aprovados em Verificação Básica</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {viewMode === 'quantity' 
                        ? basicCheckData.paymentCount 
                        : formatCurrency(basicCheckData.totalPaymentValue)
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      ({allSamplesData.paymentCount > 0 
                        ? `${((basicCheckData.paymentCount / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'})
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Pagamentos na Amostra */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Pagamentos na Amostra</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {allSamplesData.sampleCount}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({allSamplesData.paymentCount > 0 
                        ? `${((allSamplesData.sampleCount / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'})
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Pagamentos com Alerta */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Pagamentos com Alerta</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {viewMode === 'quantity' 
                        ? generalMetrics.contractsWithAlert 
                        : formatCurrency(generalMetrics.alertPaymentValue)
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      ({allSamplesData.paymentCount > 0 
                        ? `${((generalMetrics.contractsWithAlert / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'})
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Layout: Gráfico Principal à Esquerda e Gráficos Empilhados à Direita */}
            <div className="grid grid-cols-2 gap-2">
              {/* Gráfico: Pagamentos por Fluxo - Esquerda */}
              <div className="border rounded-lg bg-white h-[380px] flex flex-col">
                <div className="p-1.5 text-center border-b">
                  <h3 className="text-xs font-semibold">
                    {viewMode === 'quantity' 
                      ? 'Quantidade de Pagamentos por Fluxo' 
                      : 'Valor de Pagamentos por Fluxo'
                    }
                  </h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <BarChart 
                    width={520}
                    height={320}
                    data={viewMode === 'quantity' ? allSamplesData.flowTypeCountsData : allSamplesData.flowTypeValuesData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={50} 
                      tick={{ fontSize: 10 }} 
                    />
                    <Tooltip 
                      formatter={(value) => viewMode === 'value' ? formatCurrency(Number(value)) : value}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#8B5CF6" 
                      radius={[6, 6, 0, 0]}
                      name={viewMode === 'quantity' ? 'Quantidade' : 'Valor Total'}
                      label={{
                        position: 'top',
                        fill: '#374151',
                        fontSize: 10,
                        fontWeight: 600,
                        formatter: (value: number) => viewMode === 'value' ? formatAbbreviatedValue(value) : value
                      }}
                    />
                  </BarChart>
                </div>
              </div>

              {/* Gráficos Empilhados: Análise Básica e Humana - Direita */}
              <div className="space-y-2">
                {/* Gráfico: Análise Básica */}
                <div className="border rounded-lg bg-white h-[187px] flex flex-col">
                  <div className="p-1 text-center border-b">
                    <h3 className="text-xs font-semibold">
                      {viewMode === 'quantity' 
                        ? 'Análise Básica - Quantidade por Fluxo' 
                        : 'Análise Básica - Valor por Fluxo'
                      }
                    </h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <BarChart 
                      width={520}
                      height={155}
                      data={viewMode === 'quantity' ? analysisStackedData.basicAnalysisCountData : analysisStackedData.basicAnalysisValueData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={45} 
                        tick={{ fontSize: 9 }} 
                      />
                      <Tooltip 
                        formatter={(value) => viewMode === 'value' ? formatCurrency(Number(value)) : value}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '10px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingLeft: '20px', paddingTop: '10px' }}
                        iconType="rect"
                        iconSize={10}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry) => {
                          const totals = analysisStackedData.basicTotals;
                          if (value === 'Aprovados') {
                            return viewMode === 'quantity' 
                              ? `Aprovados (${totals.aprovados})`
                              : `Aprovados (${formatAbbreviatedValue(totals.aprovadosValue)})`;
                          }
                          if (value === 'Rejeitados') {
                            return viewMode === 'quantity'
                              ? `Rejeitados (${totals.rejeitados})`
                              : `Rejeitados (${formatAbbreviatedValue(totals.rejeitadosValue)})`;
                          }
                          return value;
                        }}
                      />
                      <Bar 
                        dataKey="aprovados" 
                        stackId="a" 
                        fill="#10b981" 
                        name="Aprovados"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar 
                        dataKey="rejeitados" 
                        stackId="a" 
                        fill="#ef4444" 
                        name="Rejeitados"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </div>
                </div>

                {/* Gráfico: Análise Humana */}
                <div className="border rounded-lg bg-white h-[187px] flex flex-col">
                  <div className="p-1 text-center border-b">
                    <h3 className="text-xs font-semibold">
                      {viewMode === 'quantity' 
                        ? 'Análise Humana - Quantidade por Fluxo' 
                        : 'Análise Humana - Valor por Fluxo'
                      }
                    </h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <BarChart 
                      width={520}
                      height={155}
                      data={viewMode === 'quantity' ? analysisStackedData.humanAnalysisCountData : analysisStackedData.humanAnalysisValueData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={45} 
                        tick={{ fontSize: 9 }} 
                      />
                      <Tooltip 
                        formatter={(value) => viewMode === 'value' ? formatCurrency(Number(value)) : value}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '10px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingLeft: '20px', paddingTop: '10px' }}
                        iconType="rect"
                        iconSize={10}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry) => {
                          const totals = analysisStackedData.humanTotals;
                          if (value === 'Aprovados') {
                            return viewMode === 'quantity' 
                              ? `Aprovados (${totals.aprovados})`
                              : `Aprovados (${formatAbbreviatedValue(totals.aprovadosValue)})`;
                          }
                          if (value === 'Rejeitados') {
                            return viewMode === 'quantity'
                              ? `Rejeitados (${totals.rejeitados})`
                              : `Rejeitados (${formatAbbreviatedValue(totals.rejeitadosValue)})`;
                          }
                          if (value === 'Devolvidos') {
                            return viewMode === 'quantity'
                              ? `Devolvidos (${totals.devolvidos})`
                              : `Devolvidos (${formatAbbreviatedValue(totals.devolvidosValue)})`;
                          }
                          return value;
                        }}
                      />
                      <Bar 
                        dataKey="aprovados" 
                        stackId="a" 
                        fill="#10b981" 
                        name="Aprovados"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar 
                        dataKey="rejeitados" 
                        stackId="a" 
                        fill="#ef4444" 
                        name="Rejeitados"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar 
                        dataKey="devolvidos" 
                        stackId="a" 
                        fill="#f59e0b" 
                        name="Devolvidos"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aprovados em Checagem Básica */}
          <TabsContent value="basic" className="space-y-2">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-3 gap-2">
              {/* Card: Total de Pagamentos */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Total de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold text-green-600">
                    {viewMode === 'quantity' 
                      ? basicCheckData.paymentCount 
                      : formatCurrency(basicCheckData.totalPaymentValue)
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Card: Representatividade */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Representatividade</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {allSamplesData.paymentCount > 0 
                        ? `${((basicCheckData.paymentCount / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                    <span className="text-xs text-gray-500">
                      do total
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Pagamentos com Alerta */}
              <Card>
                <CardHeader className="p-2 pb-1 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs text-gray-600">Pagamentos com Alerta</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsAlertsModalOpen(true)}
                  >
                    <Eye className="h-4 w-4 text-vivo-purple" />
                  </Button>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {viewMode === 'quantity' 
                        ? basicCheckData.alertsCount 
                        : formatCurrency(basicCheckData.alertsValue)
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      ({allSamplesData.paymentCount > 0 
                        ? `${((basicCheckData.alertsCount / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'})
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Alertas por Tipo */}
            <div className="border rounded-lg bg-white h-[380px] flex flex-col">
              <div className="p-1.5 text-center border-b">
                <h3 className="text-xs font-semibold">
                  {viewMode === 'quantity' 
                    ? 'Quantidade de Alertas por Tipo' 
                    : 'Valor de Alertas por Tipo'
                  }
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <BarChart 
                  width={1100}
                  height={320}
                  data={viewMode === 'quantity' ? basicCheckData.alertTypeCountsData : basicCheckData.alertTypeValuesData} 
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={50} 
                    tick={{ fontSize: 10 }} 
                  />
                  <Tooltip 
                    formatter={(value) => viewMode === 'value' ? formatCurrency(Number(value)) : value}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#8B5CF6" 
                    radius={[6, 6, 0, 0]}
                    name={viewMode === 'quantity' ? 'Quantidade' : 'Valor Total'}
                    label={{
                      position: 'top',
                      fill: '#374151',
                      fontSize: 10,
                      fontWeight: 600,
                      formatter: (value: number) => viewMode === 'value' ? formatAbbreviatedValue(value) : value
                    }}
                  />
                </BarChart>
              </div>
            </div>
          </TabsContent>

          {/* Aprovados em Análise Humana */}
          <TabsContent value="human" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">
                    {viewMode === 'quantity' ? 'Quantidade de Pagamentos' : 'Valor Total de Pagamentos'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-2xl font-bold ${viewMode === 'quantity' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {viewMode === 'quantity' 
                      ? humanAnalysisData.paymentCount 
                      : formatCurrency(humanAnalysisData.totalPaymentValue)
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">
                    {viewMode === 'quantity' ? 'Quantidade de Pagamentos por Fluxo' : 'Valor de Pagamentos por Fluxo'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart 
                      data={viewMode === 'quantity' ? humanAnalysisData.flowTypeCountsData : humanAnalysisData.flowTypeValuesData} 
                      margin={{ top: 5, right: 5, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value) => viewMode === 'value' ? formatCurrency(Number(value)) : value}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6" 
                        radius={[6, 6, 0, 0]}
                        name={viewMode === 'quantity' ? 'Quantidade' : 'Valor Total'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba de Alertas */}
          <TabsContent value="alerts" className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Gráfico de Alertas por Tipo */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Distribuição de Alertas por Tipo</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={(() => {
                        const alertCounts: Record<string, number> = {};
                        filteredContracts
                          .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                          .forEach(c => {
                            const alertType = c.alertType || 'Sem alerta';
                            alertCounts[alertType] = (alertCounts[alertType] || 0) + 1;
                          });
                        return Object.entries(alertCounts)
                          .map(([name, count]) => ({ name, count }))
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 10);
                      })()} 
                      margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8B5CF6" 
                        radius={[6, 6, 0, 0]}
                        name="Quantidade"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cards de Métricas */}
              <div className="space-y-3">
                {/* Total de Alertas */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-600">Total de Alertas</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {filteredContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado').length}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatCurrency(
                            filteredContracts
                              .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                              .reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0)
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg p-2 bg-purple-50">
                        <AlertTriangle className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alertas Críticos */}
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-600">Alertas Críticos</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                          {filteredContracts.filter(c => c.isUrgent || (c.alertType && c.alertType !== 'Contrato aprovado')).length}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Requerem atenção imediata
                        </p>
                      </div>
                      <div className="rounded-lg p-2 bg-red-50">
                        <RefreshCw className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tipos de Alertas */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-600">Tipos Diferentes</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {new Set(
                            filteredContracts
                              .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                              .map(c => c.alertType)
                          ).size}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Categorias únicas
                        </p>
                      </div>
                      <div className="rounded-lg p-2 bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Pagamentos com Alerta */}
      <Dialog open={isAlertsModalOpen} onOpenChange={setIsAlertsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pagamentos com Alerta ({contractsWithAlerts.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <Table className="w-full relative" style={{ tableLayout: 'fixed' }}>
              <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
                <TableRow style={{ height: '32px' }}>
                  <TableHead className="w-[50px] bg-gray-50 text-xs text-center" style={{ height: '32px' }}>
                    <Checkbox
                      checked={selectedForNextSample.size === contractsWithAlerts.length && contractsWithAlerts.length > 0}
                      onCheckedChange={() => handleSelectAll(contractsWithAlerts)}
                    />
                  </TableHead>
                  <TableHead 
                    className="min-w-[140px] cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleSort('number')}
                  >
                    <div className="flex items-center gap-1">
                      Nº Pagamento
                      {sortColumn === 'number' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[200px] cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleSort('supplier')}
                  >
                    <div className="flex items-center gap-1">
                      Fornecedor
                      {sortColumn === 'supplier' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[180px] cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleSort('alertType')}
                  >
                    <div className="flex items-center gap-1">
                      Tipo de Alerta
                      {sortColumn === 'alertType' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[130px] cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-1">
                      Valor
                      {sortColumn === 'value' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[120px] cursor-pointer hover:bg-gray-100 text-xs"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center gap-1">
                      Vencimento
                      {sortColumn === 'dueDate' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px] text-xs">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractsWithAlerts
                  .sort((a, b) => {
                    if (!sortColumn) return 0;
                    
                    let aVal: any = a[sortColumn as keyof LegacyContract];
                    let bVal: any = b[sortColumn as keyof LegacyContract];

                    if (sortColumn === 'value') {
                      aVal = a.paymentValue ?? a.value ?? 0;
                      bVal = b.paymentValue ?? b.value ?? 0;
                    }

                    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                  })
                  .map((contract) => {
                    const contractId = contract.id || contract.number;
                    const isSelected = selectedForNextSample.has(contractId);
                    
                    return (
                      <TableRow 
                        key={contractId}
                        className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-orange-50/30' : ''}`}
                        style={{ height: '32px' }}
                      >
                        <TableCell className="text-center" style={{ height: '32px', padding: '4px' }}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelection(contractId)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono" style={{ height: '32px', padding: '4px 8px' }}>
                          {contract.number}
                        </TableCell>
                        <TableCell className="text-xs truncate" title={contract.supplier} style={{ height: '32px', padding: '4px 8px' }}>
                          {contract.supplier}
                        </TableCell>
                        <TableCell className="text-xs" style={{ height: '32px', padding: '4px 8px' }}>
                          <Badge variant="destructive" className="text-[10px] px-2 py-0">
                            {contract.alertType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-purple-600" style={{ height: '32px', padding: '4px 8px' }}>
                          {formatCurrency(contract.paymentValue ?? contract.value ?? 0)}
                        </TableCell>
                        <TableCell className="text-xs" style={{ height: '32px', padding: '4px 8px' }}>
                          {formatDate(contract.dueDate)}
                        </TableCell>
                        <TableCell className="text-xs" style={{ height: '32px', padding: '4px 8px' }}>
                          {contract.type || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-slate-600">
              {selectedForNextSample.size > 0 && (
                <span className="font-medium text-orange-600">
                  {selectedForNextSample.size} pagamento(s) selecionado(s)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseAlertsModal}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveToNextSample}
                disabled={selectedForNextSample.size === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Adicionar à Próxima Amostragem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualityDashboardPage;