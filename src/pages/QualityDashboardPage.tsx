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
import { TrendingUp, AlertTriangle, DollarSign, FileText, Database, CheckCircle, UserCheck, BarChart3, Eye, ArrowUp, ArrowDown, ArrowUpDown, RefreshCw, ChevronsUpDown, Check, Filter, X, Brain } from 'lucide-react';
import { useAllContracts } from '@/hooks/useAllContracts';
import { useFilteredContractsOnly } from '@/hooks/useFilteredContractsOnly';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useToast } from '@/hooks/use-toast';
import { LegacyContract } from '@/hooks/useContractFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const QualityDashboardPage: React.FC = () => {
  // Estado da sidebar de filtros
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  
  // Estados para filtros (temporários na sidebar)
  const [tempDateRange, setTempDateRange] = useState<string>('all');
  const [tempAnalysisStatus, setTempAnalysisStatus] = useState<string>('all');
  const [tempSupplier, setTempSupplier] = useState<string>('all');
  const [tempContract, setTempContract] = useState<string>('all');
  const [tempFlowType, setTempFlowType] = useState<string>('all');
  const [tempAnalyst, setTempAnalyst] = useState<string>('all');
  
  // Estados para filtros aplicados (ativos)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedAnalysisStatus, setSelectedAnalysisStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [selectedFlowType, setSelectedFlowType] = useState<string>('all');
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('all');
  const [openSupplierCombo, setOpenSupplierCombo] = useState(false);
  const [openContractCombo, setOpenContractCombo] = useState(false);
  const [openFlowTypeCombo, setOpenFlowTypeCombo] = useState(false);
  const [openAnalystCombo, setOpenAnalystCombo] = useState(false);
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('quantity');
  
  // Estado para rastrear a aba ativa
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Estados para modal de alertas
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [selectedForNextSample, setSelectedForNextSample] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Estados para modais de ações da tabela
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  const [selectedContractForModal, setSelectedContractForModal] = useState<LegacyContract | null>(null);

  const { toast } = useToast();

  // Hooks para dados
  // useAllContracts: busca TODOS os contratos da tabela contratos_vivo (para aba "Todos os Pagamentos")
  const { allContracts: allPaymentsFromVivo, isLoading: vivoLoading } = useAllContracts();
  
  // useFilteredContractsOnly: busca apenas contratos da tabela contratos_filtrados (para abas de amostra)
  const { contracts: sampleContracts, isLoading: sampleLoading } = useFilteredContractsOnly({ 
    sampleId: 'all' 
  });
  
  const { sampleHistory, isLoading: historyLoading } = useSampleHistory();

  // Selecionar fonte de dados baseada na aba ativa
  // Aba "all" (Todos os Pagamentos) → dados de contratos_vivo
  // Outras abas → dados de contratos_filtrados
  const allContracts = activeTab === 'all' ? allPaymentsFromVivo : sampleContracts;
  const contractsLoading = activeTab === 'all' ? vivoLoading : sampleLoading;

  // Funções para gerenciar filtros
  const handleApplyFilters = () => {
    setSelectedDateRange(tempDateRange);
    setSelectedAnalysisStatus(tempAnalysisStatus);
    setSelectedSupplier(tempSupplier);
    setSelectedContract(tempContract);
    setSelectedFlowType(tempFlowType);
    setSelectedAnalyst(tempAnalyst);
    setIsFilterSidebarOpen(false);
    toast({
      title: "Filtros aplicados",
      description: "Os filtros foram aplicados com sucesso.",
    });
  };

  const handleClearFilters = () => {
    setTempDateRange('all');
    setTempAnalysisStatus('all');
    setTempSupplier('all');
    setTempContract('all');
    setTempFlowType('all');
    setTempAnalyst('all');
    setSelectedDateRange('all');
    setSelectedAnalysisStatus('all');
    setSelectedSupplier('all');
    setSelectedContract('all');
    setSelectedFlowType('all');
    setSelectedAnalyst('all');
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  const handleOpenFilterSidebar = () => {
    // Sincroniza valores temporários com os aplicados ao abrir
    setTempDateRange(selectedDateRange);
    setTempAnalysisStatus(selectedAnalysisStatus);
    setTempSupplier(selectedSupplier);
    setTempContract(selectedContract);
    setTempFlowType(selectedFlowType);
    setTempAnalyst(selectedAnalyst);
    setIsFilterSidebarOpen(true);
  };



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

  // Função para renderizar custom tick com quebra de linha automática
  const renderCustomTick = ({ x, y, payload }: any) => {
    const value = payload.value;
    const maxCharsPerLine = 15;
    let lines: string[] = [];

    // Palavras que devem forçar quebra de linha
    const breakWords = ['Aguardando', 'documentação', 'aprovado', 'após', 'devolução', 'Análise', 'Humana'];
    
    // Verifica se contém palavras específicas que precisam de quebra
    if (value.includes('Aguardando documentação')) {
      lines = ['Aguardando', 'documentação'];
    } else if (value.includes('Aprovado após devolução')) {
      lines = ['Aprovado após', 'devolução'];
    } else if (value.includes('Análise Humana')) {
      lines = ['Análise', 'Humana'];
    } else if (value.length > maxCharsPerLine) {
      // Quebra automática por tamanho
      const words = value.split(' ');
      let currentLine = '';
      
      words.forEach((word: string) => {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
    } else {
      lines = [value];
    }

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={0}
            dy={index * 12 + 10}
            textAnchor="middle"
            fill="#666"
            fontSize={9}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  // Handlers do modal
  const handleOpenAlertsModal = () => {
    setIsAlertsModalOpen(true);
  };

  const handleCloseAlertsModal = () => {
    setIsAlertsModalOpen(false);
  };
  
  // Handlers para visualizar documento e análise da IA
  const handleViewDocument = (contract: LegacyContract) => {
    setSelectedContractForModal(contract);
    setIsDocumentModalOpen(true);
  };
  
  const handleViewAIAnalysis = (contract: LegacyContract) => {
    setSelectedContractForModal(contract);
    setIsAIAnalysisModalOpen(true);
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

  // Obter lista única de tipos de fluxo
  const uniqueFlowTypes = useMemo(() => {
    const flowTypes = new Set(
      allContracts
        .map(c => c.type)
        .filter(t => t && t.trim() !== '')
    );
    return Array.from(flowTypes).sort();
  }, [allContracts]);

  // Obter lista única de analistas
  const uniqueAnalysts = useMemo(() => {
    const analysts = new Set(
      allContracts
        .map(c => c.analyst)
        .filter(a => a && a.trim() !== '')
    );
    return Array.from(analysts).sort();
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

    // Filtro por tipo de fluxo
    if (selectedFlowType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedFlowType);
    }

    // Filtro por analista
    if (selectedAnalyst !== 'all') {
      filtered = filtered.filter(c => c.analyst === selectedAnalyst);
    }

    return filtered;
  }, [allContracts, selectedDateRange, selectedAnalysisStatus, selectedSupplier, selectedContract, selectedFlowType, selectedAnalyst]);

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
    // Pegar contratos aprovados na checagem básica (que passaram para análise humana)
    const humanApproved = filteredContracts.filter(c => 
      c.alertType === 'Contrato aprovado' || !c.alertType
    );
    
    const uniqueSampleIds = new Set(
      humanApproved
        .map(c => c.sampleId)
        .filter(id => id && id !== '')
    );
    
    // Valor total real dos contratos
    const totalPaymentValue = humanApproved.reduce((sum, c) => {
      const value = c.paymentValue ?? c.value ?? 0;
      return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
    }, 0);

    // Usar valor fictício se não houver valor real
    const mockTotalValue = totalPaymentValue > 0 ? totalPaymentValue : 50000000; // R$ 50 milhões

    // DADOS FICTÍCIOS PARA DEMONSTRAÇÃO
    // Status Operacional da Análise
    const operationalStatus: Record<string, number> = {
      'Não iniciada': Math.floor(humanApproved.length * 0.15), // 15%
      'Em andamento': Math.floor(humanApproved.length * 0.25), // 25%
      'Aguardando documentação': Math.floor(humanApproved.length * 0.10), // 10%
      'Finalizada': Math.floor(humanApproved.length * 0.50) // 50%
    };

    // Resultado Técnico da Análise
    const technicalResult: Record<string, number> = {
      'Aprovado': Math.floor(humanApproved.length * 0.45), // 45%
      'Aprovado após devolução': Math.floor(humanApproved.length * 0.12), // 12%
      'Rejeitado': Math.floor(humanApproved.length * 0.08), // 8%
      'Em análise': Math.floor(humanApproved.length * 0.20), // 20%
      'Aguardando documentação': Math.floor(humanApproved.length * 0.10), // 10%
      'Não iniciada': Math.floor(humanApproved.length * 0.05) // 5%
    };

    // Pagamentos não finalizados por status
    const totalPending = Math.floor(humanApproved.length * 0.35); // 35% pendentes
    const pendingByStatus: Record<string, number> = {
      'Não iniciada': Math.floor(totalPending * 0.30), // 30% dos pendentes
      'Em andamento': Math.floor(totalPending * 0.50), // 50% dos pendentes
      'Aguardando documentação': Math.floor(totalPending * 0.20) // 20% dos pendentes
    };

    // VALORES FICTÍCIOS (baseados no total)
    const operationalStatusValues: Record<string, number> = {
      'Não iniciada': mockTotalValue * 0.15,
      'Em andamento': mockTotalValue * 0.25,
      'Aguardando documentação': mockTotalValue * 0.10,
      'Finalizada': mockTotalValue * 0.50
    };

    const technicalResultValues: Record<string, number> = {
      'Aprovado': mockTotalValue * 0.45,
      'Aprovado após devolução': mockTotalValue * 0.12,
      'Rejeitado': mockTotalValue * 0.08,
      'Em análise': mockTotalValue * 0.20,
      'Aguardando documentação': mockTotalValue * 0.10,
      'Não iniciada': mockTotalValue * 0.05
    };

    const totalPendingValue = mockTotalValue * 0.35;
    const pendingByStatusValues: Record<string, number> = {
      'Não iniciada': totalPendingValue * 0.30,
      'Em andamento': totalPendingValue * 0.50,
      'Aguardando documentação': totalPendingValue * 0.20
    };

    // Cálculo de SLA (fictício: 87.5% dentro do prazo)
    const slaPercentage = '87.5';

    return {
      sampleCount: uniqueSampleIds.size,
      paymentCount: humanApproved.length,
      totalPaymentValue: mockTotalValue,
      // Dados para visualização de QUANTIDADE
      operationalStatusData: Object.entries(operationalStatus)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      technicalResultData: Object.entries(technicalResult)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      pendingByStatusData: Object.entries(pendingByStatus)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      // Dados para visualização de VALOR
      operationalStatusValuesData: Object.entries(operationalStatusValues)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      technicalResultValuesData: Object.entries(technicalResultValues)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      pendingByStatusValuesData: Object.entries(pendingByStatusValues)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0),
      slaPercentage
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
    <div className="h-full flex flex-col relative">
      {/* Barra de Controles */}
      <div className="pl-8 pr-8 pb-2 pt-2 border-b border-gray-100">
        <div className="flex justify-between items-center">
          {/* Botões de Filtros */}
          <div className="flex items-center gap-2">
            {/* Botão Selecionar Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFilterSidebar}
              className="h-9 gap-2"
            >
              <Filter className="h-4 w-4" />
              Selecionar Filtros
              {(selectedDateRange !== 'all' || selectedAnalysisStatus !== 'all' || selectedSupplier !== 'all' || 
                selectedContract !== 'all' || selectedFlowType !== 'all' || selectedAnalyst !== 'all') && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {[selectedDateRange, selectedAnalysisStatus, selectedSupplier, selectedContract, selectedFlowType, selectedAnalyst].filter(f => f !== 'all').length}
                </Badge>
              )}
            </Button>

            {/* Botão Limpar Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 gap-2"
              disabled={selectedDateRange === 'all' && selectedAnalysisStatus === 'all' && selectedSupplier === 'all' && 
                selectedContract === 'all' && selectedFlowType === 'all' && selectedAnalyst === 'all'}
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
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

      {/* Sidebar de Filtros */}
      {isFilterSidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsFilterSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l z-50 flex flex-col">
            {/* Header da Sidebar */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                {(selectedDateRange !== 'all' || selectedAnalysisStatus !== 'all' || selectedSupplier !== 'all' || 
                  selectedContract !== 'all' || selectedFlowType !== 'all' || selectedAnalyst !== 'all') && (
                  <Badge className="bg-blue-500 text-white h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                    {[selectedDateRange, selectedAnalysisStatus, selectedSupplier, selectedContract, selectedFlowType, selectedAnalyst].filter(f => f !== 'all').length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                disabled={selectedDateRange === 'all' && selectedAnalysisStatus === 'all' && selectedSupplier === 'all' && 
                  selectedContract === 'all' && selectedFlowType === 'all' && selectedAnalyst === 'all'}
                className="text-gray-500 hover:text-gray-700 text-sm h-auto p-0 font-normal"
              >
                Clear all
              </Button>
            </div>

            {/* Conteúdo da Sidebar */}
            <div className="flex-1 overflow-y-auto">
              {/* Filtro Período */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Período</label>
                  <Select value={tempDateRange} onValueChange={setTempDateRange}>
                    <SelectTrigger className="w-full font-semibold">
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
              </div>

              {/* Filtro Status */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={tempAnalysisStatus} onValueChange={setTempAnalysisStatus}>
                    <SelectTrigger className="w-full font-semibold">
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
              </div>

              {/* Filtro Fornecedor */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fornecedor</label>
                  <Popover open={openSupplierCombo} onOpenChange={setOpenSupplierCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSupplierCombo}
                        className="w-full justify-between"
                      >
                        {tempSupplier === 'all'
                          ? "Todos os fornecedores"
                          : uniqueSuppliers.find((supplier) => supplier === tempSupplier) || "Selecionar..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar fornecedor..." />
                        <CommandList>
                          <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setTempSupplier('all');
                                setOpenSupplierCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tempSupplier === 'all' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Todos os Fornecedores
                            </CommandItem>
                            {uniqueSuppliers.map((supplier) => (
                              <CommandItem
                                key={supplier}
                                value={supplier}
                                onSelect={(currentValue) => {
                                  setTempSupplier(currentValue);
                                  setOpenSupplierCombo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    tempSupplier === supplier ? "opacity-100" : "opacity-0"
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
              </div>

              {/* Filtro Contrato */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contrato</label>
                  <Popover open={openContractCombo} onOpenChange={setOpenContractCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openContractCombo}
                        className="w-full justify-between"
                      >
                        {tempContract === 'all'
                          ? "Todos os contratos"
                          : uniqueContracts.find((contract) => contract === tempContract) || "Selecionar..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar contrato..." />
                        <CommandList>
                          <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setTempContract('all');
                                setOpenContractCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tempContract === 'all' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Todos os Contratos
                            </CommandItem>
                            {uniqueContracts.map((contract) => (
                              <CommandItem
                                key={contract}
                                value={contract}
                                onSelect={(currentValue) => {
                                  setTempContract(currentValue);
                                  setOpenContractCombo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    tempContract === contract ? "opacity-100" : "opacity-0"
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

              {/* Filtro Tipo de Fluxo */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Fluxo</label>
                  <Popover open={openFlowTypeCombo} onOpenChange={setOpenFlowTypeCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openFlowTypeCombo}
                        className="w-full justify-between"
                      >
                        {tempFlowType === 'all'
                          ? "Todos os fluxos"
                          : uniqueFlowTypes.find((flow) => flow === tempFlowType) || "Selecionar..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar fluxo..." />
                        <CommandList>
                          <CommandEmpty>Nenhum fluxo encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setTempFlowType('all');
                                setOpenFlowTypeCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tempFlowType === 'all' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Todos os Fluxos
                            </CommandItem>
                            {uniqueFlowTypes.map((flowType) => (
                              <CommandItem
                                key={flowType}
                                value={flowType}
                                onSelect={(currentValue) => {
                                  setTempFlowType(currentValue);
                                  setOpenFlowTypeCombo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    tempFlowType === flowType ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {flowType}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filtro Analista */}
              <div className="border-b border-gray-100 last:border-0 px-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Analista</label>
                  <Popover open={openAnalystCombo} onOpenChange={setOpenAnalystCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAnalystCombo}
                        className="w-full justify-between"
                      >
                        {tempAnalyst === 'all'
                          ? "Todos os analistas"
                          : uniqueAnalysts.find((analyst) => analyst === tempAnalyst) || "Selecionar..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar analista..." />
                        <CommandList>
                          <CommandEmpty>Nenhum analista encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setTempAnalyst('all');
                                setOpenAnalystCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  tempAnalyst === 'all' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Todos os Analistas
                            </CommandItem>
                            {uniqueAnalysts.map((analyst) => (
                              <CommandItem
                                key={analyst}
                                value={analyst}
                                onSelect={(currentValue) => {
                                  setTempAnalyst(currentValue);
                                  setOpenAnalystCombo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    tempAnalyst === analyst ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {analyst}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Footer da Sidebar com Botões */}
            <div className="p-4 border-t bg-gray-50">
              <Button
                onClick={handleApplyFilters}
                className="w-full bg-vivo-purple hover:bg-vivo-purple/90"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Tabs de Análise */}
      <div className="p-3 flex-1 overflow-hidden">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
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
                      {sampleContracts.length}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({allSamplesData.paymentCount > 0 
                        ? `${((sampleContracts.length / allSamplesData.paymentCount) * 100).toFixed(1)}%`
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
                    height={360}
                    data={viewMode === 'quantity' ? allSamplesData.flowTypeCountsData : allSamplesData.flowTypeValuesData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={0}
                      textAnchor="middle" 
                      height={70}
                      interval={0}
                      tick={renderCustomTick}
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
                      height={172}
                      data={viewMode === 'quantity' ? analysisStackedData.basicAnalysisCountData : analysisStackedData.basicAnalysisValueData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle" 
                        height={60}
                        interval={0}
                        tick={renderCustomTick}
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
                      height={172}
                      data={viewMode === 'quantity' ? analysisStackedData.humanAnalysisCountData : analysisStackedData.humanAnalysisValueData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle" 
                        height={60}
                        interval={0}
                        tick={renderCustomTick}
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
                  height={360}
                  data={viewMode === 'quantity' ? basicCheckData.alertTypeCountsData : basicCheckData.alertTypeValuesData} 
                  margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={0}
                    textAnchor="middle" 
                    height={70}
                    interval={0}
                    tick={renderCustomTick}
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
            {/* Cards de Métricas */}
            <div className="grid grid-cols-3 gap-2">
              {/* Card: Total de Pagamentos */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">Total de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-lg font-bold text-emerald-600">
                    {viewMode === 'quantity' 
                      ? humanAnalysisData.paymentCount 
                      : formatCurrency(humanAnalysisData.totalPaymentValue)
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
                        ? `${((humanAnalysisData.paymentCount / allSamplesData.paymentCount) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                    <span className="text-xs text-gray-500">do total</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card: SLA de Análise */}
              <Card>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs text-gray-600">SLA de Análise</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {humanAnalysisData.slaPercentage}%
                    </span>
                    <span className="text-xs text-gray-500">no prazo</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Layout: Gráficos de Status à Esquerda e Pagamentos Não Finalizados à Direita */}
            <div className="grid grid-cols-2 gap-2">
              {/* Coluna Esquerda: 2 Gráficos Empilhados */}
              <div className="space-y-2">
                {/* Gráfico: Status Operacional */}
                <div className="border rounded-lg bg-white h-[190px] flex flex-col">
                  <div className="p-1 text-center border-b">
                    <h3 className="text-xs font-semibold">Status Operacional da Análise</h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <BarChart 
                      width={520}
                      height={175}
                      data={viewMode === 'quantity' ? humanAnalysisData.operationalStatusData : humanAnalysisData.operationalStatusValuesData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle" 
                        height={60}
                        interval={0}
                        tick={renderCustomTick}
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
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6" 
                        radius={[6, 6, 0, 0]}
                        name={viewMode === 'quantity' ? 'Quantidade' : 'Valor'}
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

                {/* Gráfico: Resultado Técnico */}
                <div className="border rounded-lg bg-white h-[190px] flex flex-col">
                  <div className="p-1 text-center border-b">
                    <h3 className="text-xs font-semibold">Resultado Técnico da Análise</h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <BarChart 
                      width={520}
                      height={175}
                      data={viewMode === 'quantity' ? humanAnalysisData.technicalResultData : humanAnalysisData.technicalResultValuesData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle" 
                        height={60}
                        interval={0}
                        tick={renderCustomTick}
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
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6" 
                        radius={[6, 6, 0, 0]}
                        name={viewMode === 'quantity' ? 'Quantidade' : 'Valor'}
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
              </div>

              {/* Coluna Direita: Pagamentos Não Finalizados */}
              <div className="border rounded-lg bg-white h-[385px] flex flex-col">
                <div className="p-1.5 text-center border-b">
                  <h3 className="text-xs font-semibold">Pagamentos Não Finalizados por Status</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <BarChart 
                    width={520}
                    height={370}
                    data={viewMode === 'quantity' ? humanAnalysisData.pendingByStatusData : humanAnalysisData.pendingByStatusValuesData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={0}
                      textAnchor="middle" 
                      height={60}
                      interval={0}
                      tick={renderCustomTick}
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
                      name={viewMode === 'quantity' ? 'Pagamentos Não Finalizados' : 'Valor Não Finalizado'}
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
            </div>
          </TabsContent>

          {/* Aba de Alertas */}
          <TabsContent value="alerts" className="space-y-2 flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Gráfico de Alertas por Tipo */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">
                    {viewMode === 'quantity' 
                      ? 'Distribuição de Alertas por Tipo (Quantidade)' 
                      : 'Distribuição de Alertas por Tipo (Valor)'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart 
                      data={(() => {
                        if (viewMode === 'quantity') {
                          const alertCounts: Record<string, number> = {};
                          filteredContracts
                            .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                            .forEach(c => {
                              const alertType = c.alertType || 'Sem alerta';
                              alertCounts[alertType] = (alertCounts[alertType] || 0) + 1;
                            });
                          return Object.entries(alertCounts)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10);
                        } else {
                          const alertValues: Record<string, number> = {};
                          filteredContracts
                            .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                            .forEach(c => {
                              const alertType = c.alertType || 'Sem alerta';
                              const value = c.paymentValue ?? c.value ?? 0;
                              const validValue = typeof value === 'number' && !isNaN(value) ? value : 0;
                              alertValues[alertType] = (alertValues[alertType] || 0) + validValue;
                            });
                          return Object.entries(alertValues)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 10);
                        }
                      })()} 
                      margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle" 
                        height={50}
                        interval={0}
                        tick={renderCustomTick}
                      />
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
                        label={{
                          position: 'top',
                          fill: '#374151',
                          fontSize: 10,
                          fontWeight: 600,
                          formatter: (value: number) => viewMode === 'value' ? formatAbbreviatedValue(value) : value
                        }}
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
                          {viewMode === 'quantity'
                            ? filteredContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado').length
                            : formatCurrency(
                                filteredContracts
                                  .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                                  .reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0)
                              )
                          }
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(() => {
                            const alertCount = filteredContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado').length;
                            const totalPayments = filteredContracts.length;
                            const percentage = totalPayments > 0 ? ((alertCount / totalPayments) * 100).toFixed(1) : '0.0';
                            return `${percentage}% do total de pagamentos`;
                          })()}
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
                          {viewMode === 'quantity'
                            ? filteredContracts.filter(c => c.risk === 'Alto' && c.alertType && c.alertType !== 'Contrato aprovado').length
                            : formatCurrency(
                                filteredContracts
                                  .filter(c => c.risk === 'Alto' && c.alertType && c.alertType !== 'Contrato aprovado')
                                  .reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0)
                              )
                          }
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(() => {
                            const criticalCount = filteredContracts.filter(c => c.risk === 'Alto' && c.alertType && c.alertType !== 'Contrato aprovado').length;
                            const totalAlerts = filteredContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado').length;
                            const percentage = totalAlerts > 0 ? ((criticalCount / totalAlerts) * 100).toFixed(1) : '0.0';
                            return `${percentage}% dos alertas`;
                          })()}
                        </p>
                      </div>
                      <div className="rounded-lg p-2 bg-red-50">
                        <RefreshCw className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tabela de Alertas */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="p-3 flex-shrink-0">
                <CardTitle className="text-sm">Detalhamento de Pagamentos com Alerta</CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold bg-gray-50 w-24">Ações</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Id do Pagamento</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Fornecedor</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Valor</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Fluxo</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Alerta</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Data de Vencimento</TableHead>
                        <TableHead className="text-xs font-semibold bg-gray-50">Risco</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts
                        .filter(c => c.alertType && c.alertType !== 'Contrato aprovado')
                        .map((contract, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => handleViewDocument(contract)}
                                  title="Visualizar Documento"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
                                  onClick={() => handleViewAIAnalysis(contract)}
                                  title="Visualizar Análise da IA"
                                >
                                  <Brain className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{contract.number}</TableCell>
                            <TableCell className="text-xs">{contract.supplier}</TableCell>
                            <TableCell className="text-xs font-medium">
                              {formatCurrency(contract.paymentValue ?? contract.value ?? 0)}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-xs">
                                {contract.type || contract.flowType || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-xs">
                                {contract.alertType || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {contract.paymentDueDate 
                                ? new Date(contract.paymentDueDate).toLocaleDateString('pt-BR')
                                : contract.dueDate 
                                ? new Date(contract.dueDate).toLocaleDateString('pt-BR')
                                : 'N/A'
                              }
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge 
                                variant={
                                  contract.risk === 'Alto' ? 'destructive' : 
                                  contract.risk === 'Médio' ? 'default' : 
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {contract.risk || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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

      {/* Modal de Visualizar Documento */}
      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Documentos do Contrato {selectedContractForModal?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Fornecedor</p>
                <p className="text-sm">{selectedContractForModal?.supplier}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Valor</p>
                <p className="text-sm font-semibold">{selectedContractForModal && formatCurrency(selectedContractForModal.paymentValue ?? selectedContractForModal.value ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo de Fluxo</p>
                <p className="text-sm">{selectedContractForModal?.type || selectedContractForModal?.flowType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Data de Vencimento</p>
                <p className="text-sm">
                  {selectedContractForModal?.paymentDueDate 
                    ? new Date(selectedContractForModal.paymentDueDate).toLocaleDateString('pt-BR')
                    : selectedContractForModal?.dueDate 
                    ? new Date(selectedContractForModal.dueDate).toLocaleDateString('pt-BR')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Documentos Anexados</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Contrato.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Nota_Fiscal.pdf</p>
                      <p className="text-xs text-gray-500">1.8 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Análise da IA */}
      <Dialog open={isAIAnalysisModalOpen} onOpenChange={setIsAIAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Análise da IA - Contrato {selectedContractForModal?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alerta Identificado
              </h3>
              <p className="text-sm text-purple-800">
                <strong>{selectedContractForModal?.alertType || 'N/A'}</strong>
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Análise Detalhada</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Nível de Risco:</p>
                  <Badge 
                    variant={
                      selectedContractForModal?.risk === 'Alto' ? 'destructive' : 
                      selectedContractForModal?.risk === 'Médio' ? 'default' : 
                      'secondary'
                    }
                    className="mt-1"
                  >
                    {selectedContractForModal?.risk || 'N/A'}
                  </Badge>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Observações da IA:</p>
                  <p className="text-gray-600 mt-1">
                    Este contrato foi sinalizado devido a {selectedContractForModal?.alertType?.toLowerCase()}. 
                    A análise automática identificou que este caso requer atenção manual devido à 
                    complexidade das condições contratuais e ao valor envolvido de {selectedContractForModal && formatCurrency(selectedContractForModal.paymentValue ?? selectedContractForModal.value ?? 0)}.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Recomendações:</p>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li>Verificar documentação complementar</li>
                    <li>Validar condições de pagamento com o fornecedor</li>
                    <li>Confirmar data de vencimento e prazos</li>
                    <li>Revisar cláusulas contratuais específicas</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Confiança da Análise:</p>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualityDashboardPage;