import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  DollarSign,
  FileText,
  User,
  ArrowUp,
  ArrowDown,
  Eye,
  ArrowUpDown,
  Brain,
  Edit
} from 'lucide-react';
import { useFilteredContractsOnly } from '@/hooks/useFilteredContractsOnly';
import { useAnalysts } from '@/hooks/useAnalysts';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { LegacyContract } from '@/hooks/useContractFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import EditSampleModal from '@/components/EditSampleModal';

const AlertsDashboardPage: React.FC = () => {
  // Estados para filtros
  const [selectedSampleId, setSelectedSampleId] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('all');
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Estados para modais
  const [selectedContract, setSelectedContract] = useState<LegacyContract | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  // Hooks para dados
  const { contracts: allContracts, isLoading: contractsLoading, refetch } = useFilteredContractsOnly(
    selectedSampleId === 'all' ? undefined : { sampleId: selectedSampleId }
  );
  const { analysts, isLoading: analystsLoading } = useAnalysts();
  const { sampleHistory, isLoading: samplesLoading } = useSampleHistory();
  const { toast } = useToast();

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular dias até vencimento
  const getDaysToExpire = (dueDate: string | undefined): number => {
    if (!dueDate) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expireDate = new Date(dueDate);
    expireDate.setHours(0, 0, 0, 0);
    const diffTime = expireDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcular score de prioridade
  const calculatePriorityScore = (contract: LegacyContract): number => {
    let score = 0;
    
    const daysToExpire = getDaysToExpire(contract.dueDate);
    if (daysToExpire < 0) score += 100; // Vencido
    else if (daysToExpire <= 3) score += 80;
    else if (daysToExpire <= 7) score += 50;
    else if (daysToExpire <= 15) score += 30;
    
    const value = contract.paymentValue ?? contract.value ?? 0;
    if (value > 1000000) score += 40;
    else if (value > 500000) score += 25;
    else if (value > 100000) score += 15;
    
    if (contract.isUrgent) score += 50;
    
    if (contract.alertType && contract.alertType !== 'Contrato aprovado') score += 20;
    
    return score;
  };

  // Função para formatar data
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Função para gerenciar ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Componente para cabeçalho ordenável
  const SortableHeader = ({ column, children, className = "" }: { column: string; children: React.ReactNode; className?: string }) => {
    const isActive = sortColumn === column;
    
    return (
      <TableHead 
        className={`bg-gray-50 py-0 text-xs text-center z-30 cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
        style={{ height: '24px', lineHeight: '1.2' }}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center justify-center gap-1">
          <span>{children}</span>
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-blue-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-blue-600" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          )}
        </div>
      </TableHead>
    );
  };

  // Função para obter badge de risco
  const getRiskBadge = (risk: string | undefined) => {
    if (!risk) return <Badge variant="outline" className="text-xs">N/A</Badge>;
    
    const riskConfig: Record<string, { className: string }> = {
      'Alto': { className: 'bg-red-50 text-red-800 border-red-200' },
      'Médio': { className: 'bg-orange-50 text-orange-800 border-orange-200' },
      'Baixo': { className: 'bg-green-50 text-green-800 border-green-200' }
    };

    const config = riskConfig[risk] || { className: 'bg-gray-50 text-gray-800 border-gray-200' };
    
    return (
      <Badge variant="outline" className={`${config.className} text-xs whitespace-nowrap`}>
        {risk}
      </Badge>
    );
  };

  // Função para obter badge de prioridade
  const getPriorityBadge = (score: number) => {
    if (score >= 150) {
      return <Badge className="bg-red-600 text-white text-xs">Crítica</Badge>;
    } else if (score >= 100) {
      return <Badge className="bg-orange-500 text-white text-xs">Alta</Badge>;
    } else if (score >= 50) {
      return <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>;
    }
  };

  // Handlers para ações
  const handleAnalyzeContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setAnalysisModalOpen(true);
    toast({
      title: "Análise de IA",
      description: `Carregando análise inteligente do contrato ${contractId}...`,
    });
  };

  const handleViewDocument = (contractId: string) => {
    toast({
      title: "Visualizar Documento",
      description: `Abrindo documento do contrato ${contractId}...`,
    });
    // Aqui você pode adicionar a lógica para abrir o documento
    console.log('Visualizar documento:', contractId);
  };

  const handleEditContract = (contract: LegacyContract) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedContract: LegacyContract) => {
    // Atualizar o contrato localmente (você pode adicionar lógica de salvamento no banco)
    toast({
      title: "Contrato Atualizado",
      description: `As alterações do contrato ${updatedContract.number} foram salvas.`,
    });
    setIsEditModalOpen(false);
    setSelectedContract(null);
    refetch(); // Recarregar dados
  };

  // Filtrar e enriquecer contratos
  const enrichedContracts = useMemo(() => {
    return allContracts.map(contract => ({
      ...contract,
      daysToExpire: getDaysToExpire(contract.dueDate),
      priorityScore: calculatePriorityScore(contract)
    }));
  }, [allContracts]);

  // Aplicar filtros
  const filteredContracts = useMemo(() => {
    let filtered = [...enrichedContracts];

    // Filtro por urgência
    if (selectedUrgency !== 'all') {
      switch (selectedUrgency) {
        case 'urgent':
          filtered = filtered.filter(c => c.isUrgent || c.daysToExpire <= 3);
          break;
        case 'high':
          filtered = filtered.filter(c => c.priorityScore >= 60);
          break;
        case 'medium':
          filtered = filtered.filter(c => c.priorityScore >= 30 && c.priorityScore < 60);
          break;
        case 'low':
          filtered = filtered.filter(c => c.priorityScore < 30);
          break;
      }
    }

    // Filtro por tipo de alerta
    if (selectedAlertType !== 'all') {
      if (selectedAlertType === 'no-alert') {
        filtered = filtered.filter(c => !c.alertType || c.alertType === 'Contrato aprovado');
      } else {
        filtered = filtered.filter(c => c.alertType === selectedAlertType);
      }
    }

    // Filtro por analista
    if (selectedAnalyst !== 'all') {
      filtered = filtered.filter(c => c.analyst === selectedAnalyst);
    }

    // Filtro por período de vencimento
    if (selectedPeriod !== 'all') {
      switch (selectedPeriod) {
        case '7d':
          filtered = filtered.filter(c => c.daysToExpire >= 0 && c.daysToExpire <= 7);
          break;
        case '15d':
          filtered = filtered.filter(c => c.daysToExpire >= 0 && c.daysToExpire <= 15);
          break;
        case '30d':
          filtered = filtered.filter(c => c.daysToExpire >= 0 && c.daysToExpire <= 30);
          break;
        case 'overdue':
          filtered = filtered.filter(c => c.daysToExpire < 0);
          break;
      }
    }

    return filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [enrichedContracts, selectedUrgency, selectedAlertType, selectedAnalyst, selectedPeriod]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    const urgentContracts = enrichedContracts.filter(c => c.isUrgent || c.daysToExpire <= 3);
    const urgent = urgentContracts.length;
    const urgentValue = urgentContracts.reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0);
    
    const expiring7DaysContracts = enrichedContracts.filter(c => c.daysToExpire >= 0 && c.daysToExpire <= 7);
    const expiring7Days = expiring7DaysContracts.length;
    const expiring7DaysValue = expiring7DaysContracts.reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0);
    
    const withAlertsContracts = enrichedContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado');
    const withAlerts = withAlertsContracts.length;
    const withAlertsValue = withAlertsContracts.reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0);
    
    const highValue = enrichedContracts.filter(c => (c.paymentValue ?? c.value ?? 0) > 100000);
    const highValueCount = highValue.length;
    const highValueSum = highValue.reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0);

    return {
      urgent,
      urgentValue,
      expiring7Days,
      expiring7DaysValue,
      withAlerts,
      withAlertsValue,
      highValueCount,
      highValueSum
    };
  }, [enrichedContracts]);

  // Dados para gráfico de vencimentos por dia
  const expiringByDayData = useMemo(() => {
    const days: Record<number, number> = {};
    
    enrichedContracts.forEach(c => {
      if (c.daysToExpire >= 0 && c.daysToExpire <= 30) {
        days[c.daysToExpire] = (days[c.daysToExpire] || 0) + 1;
      }
    });

    return Object.entries(days)
      .map(([day, count]) => ({ day: `${day}d`, count }))
      .sort((a, b) => parseInt(a.day) - parseInt(b.day));
  }, [enrichedContracts]);

  // Dados para distribuição de prioridade
  const priorityDistribution = useMemo(() => {
    const critical = enrichedContracts.filter(c => c.priorityScore >= 80).length;
    const high = enrichedContracts.filter(c => c.priorityScore >= 60 && c.priorityScore < 80).length;
    const medium = enrichedContracts.filter(c => c.priorityScore >= 30 && c.priorityScore < 60).length;
    const low = enrichedContracts.filter(c => c.priorityScore < 30).length;

    return [
      { name: 'Crítico', value: critical, color: '#EF4444' },
      { name: 'Alto', value: high, color: '#F97316' },
      { name: 'Médio', value: medium, color: '#EAB308' },
      { name: 'Baixo', value: low, color: '#22C55E' }
    ];
  }, [enrichedContracts]);

  // Tipos de alerta únicos
  const alertTypes = useMemo(() => {
    const types = new Set(
      allContracts
        .map(c => c.alertType)
        .filter(t => t && t !== '')
    );
    return Array.from(types);
  }, [allContracts]);

  // Dados para gráfico de alertas por tipo
  const alertsByTypeData = useMemo(() => {
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
      .slice(0, 10); // Top 10 alertas
  }, [filteredContracts]);

  // Métricas de alertas para cards
  const alertMetrics = useMemo(() => {
    const contractsWithAlerts = filteredContracts.filter(c => c.alertType && c.alertType !== 'Contrato aprovado');
    const totalAlerts = contractsWithAlerts.length;
    const totalValue = contractsWithAlerts.reduce((sum, c) => sum + (c.paymentValue ?? c.value ?? 0), 0);
    const criticalAlerts = contractsWithAlerts.filter(c => c.priorityScore >= 70).length;
    const alertTypes = new Set(contractsWithAlerts.map(c => c.alertType)).size;

    return {
      totalAlerts,
      totalValue,
      criticalAlerts,
      alertTypes
    };
  }, [filteredContracts]);

  // Função para obter cor do badge de urgência
  const getUrgencyBadge = (daysToExpire: number, isUrgent?: boolean) => {
    if (isUrgent || daysToExpire < 0) {
      return <Badge className="bg-red-500">Urgente</Badge>;
    } else if (daysToExpire <= 3) {
      return <Badge className="bg-orange-500">Crítico</Badge>;
    } else if (daysToExpire <= 7) {
      return <Badge className="bg-yellow-500 text-black">Atenção</Badge>;
    } else if (daysToExpire <= 15) {
      return <Badge className="bg-blue-500">Normal</Badge>;
    }
    return <Badge variant="outline">Baixo</Badge>;
  };

  const isLoading = contractsLoading || analystsLoading;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filtros com scroll horizontal */}
      <div className="pl-8 pb-1 pt-1.5 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          {/* Filtro Amostra */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Amostra:
            </label>
            <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Todas as Amostras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Amostras</SelectItem>
                {sampleHistory.map((sample) => (
                  <SelectItem key={sample.amostra_id} value={sample.amostra_id}>
                    Amostra {sample.amostra_id} ({sample.totalContracts} contratos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Urgência */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Urgência:
            </label>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgentes</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Tipo de Alerta */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Tipo de Alerta:
            </label>
            <Select value={selectedAlertType} onValueChange={setSelectedAlertType}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="no-alert">Sem Alertas</SelectItem>
                {alertTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Analista */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Analista:
            </label>
            <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {analysts.filter(a => a !== 'all').map((analyst) => (
                  <SelectItem key={analyst} value={analyst}>
                    {analyst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Período */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Vencimento:
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="15d">15 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - sem scroll vertical */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Contratos Urgentes */}
          <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Urgentes</p>
                    <p className="text-xl font-bold text-red-600">{kpis.urgent}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(kpis.urgentValue)}</p>
                  </div>
                </div>
                <ArrowUp className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Vencendo em 7 Dias */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Vencendo (7d)</p>
                    <p className="text-xl font-bold text-orange-600">{kpis.expiring7Days}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(kpis.expiring7DaysValue)}</p>
                  </div>
                </div>
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Com Alertas */}
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-yellow-50">
                    <RefreshCw className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Com Alertas</p>
                    <p className="text-xl font-bold text-yellow-600">{kpis.withAlerts}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(kpis.withAlertsValue)}</p>
                  </div>
                </div>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          {/* Alto Valor */}
          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-purple-50">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Alto Valor</p>
                    <p className="text-lg font-bold text-purple-600">{kpis.highValueCount}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(kpis.highValueSum)}</p>
                  </div>
                </div>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-2">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgentes
            </TabsTrigger>
            <TabsTrigger value="expiring" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Vencimentos
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="highvalue" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Alto Valor
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Tab: Todos os Contratos */}
          <TabsContent value="all" className="space-y-2">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Todos os Contratos da Amostra</span>
                  <Badge variant="outline">{filteredContracts.length} contratos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[500px]">
                  <Table className="w-full relative min-w-[1400px]" style={{ tableLayout: 'fixed' }}>
                    <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
                      <TableRow className="!h-6" style={{ height: '24px !important' }}>
                        <TableHead className="w-[120px] bg-gray-50 py-0 text-xs text-center sticky left-0 z-40 border-r border-gray-300 shadow-sm" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
                        <SortableHeader column="number" className="min-w-[140px]">Nº Pagamento</SortableHeader>
                        <SortableHeader column="supplier" className="min-w-[180px]">Fornecedor</SortableHeader>
                        <SortableHeader column="daysToExpire" className="min-w-[120px]">Dias p/ Vencer</SortableHeader>
                        <SortableHeader column="priority" className="min-w-[100px]">Prioridade</SortableHeader>
                        <SortableHeader column="dueDate" className="min-w-[120px]">Vencimento</SortableHeader>
                        <SortableHeader column="paymentValue" className="min-w-[130px]">Valor</SortableHeader>
                        <SortableHeader column="alertType" className="min-w-[140px]">Tipo de Alerta</SortableHeader>
                        <SortableHeader column="analyst" className="min-w-[120px]">Analista</SortableHeader>
                        <SortableHeader column="risk" className="min-w-[80px]">Risco</SortableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts
                        .sort((a, b) => {
                          if (sortColumn === 'priority') return sortDirection === 'asc' ? a.priorityScore - b.priorityScore : b.priorityScore - a.priorityScore;
                          if (sortColumn === 'daysToExpire') return sortDirection === 'asc' ? a.daysToExpire - b.daysToExpire : b.daysToExpire - a.daysToExpire;
                          if (sortColumn === 'paymentValue') {
                            const aVal = a.paymentValue ?? a.value ?? 0;
                            const bVal = b.paymentValue ?? b.value ?? 0;
                            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          return 0;
                        })
                        .map((contract) => (
                          <TableRow 
                            key={contract.id} 
                            className={`hover:bg-slate-50 transition-colors ${contract.daysToExpire < 0 ? 'bg-red-50/30' : ''}`}
                            style={{ height: '24px' }}
                          >
                            <TableCell className={`py-0 sticky left-0 z-20 border-r border-gray-200 ${contract.daysToExpire < 0 ? 'bg-red-50/30' : 'bg-white'}`} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeContract(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-green-50 hover:text-green-600"
                                  title="Ver análise de IA"
                                >
                                  <Brain className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDocument(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Visualizar documento"
                                >
                                  <Eye className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContract(contract);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                  title="Editar contrato"
                                >
                                  <Edit className="h-2 w-2" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="py-0 text-xs" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.number}</TableCell>
                            <TableCell className="py-0 text-xs truncate" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.supplier}</TableCell>
                            <TableCell className="py-0 text-xs text-center" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <Badge 
                                variant={contract.daysToExpire < 0 ? 'destructive' : contract.daysToExpire <= 3 ? 'default' : contract.daysToExpire <= 7 ? 'secondary' : 'outline'}
                                className="text-[10px] px-1 py-0 h-4"
                              >
                                {contract.daysToExpire < 0 ? `${Math.abs(contract.daysToExpire)}d atraso` : `${contract.daysToExpire}d`}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-0 text-xs text-center" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <Badge 
                                variant={contract.priorityScore > 70 ? 'destructive' : contract.priorityScore > 50 ? 'default' : 'secondary'}
                                className="text-[10px] px-1 py-0 h-4"
                              >
                                {contract.priorityScore}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-0 text-xs" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.dueDate}</TableCell>
                            <TableCell className="py-0 text-xs" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{formatCurrency(contract.paymentValue ?? contract.value ?? 0)}</TableCell>
                            <TableCell className="py-0 text-xs truncate" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {contract.alertType || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-0 text-xs truncate" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.analyst || '-'}</TableCell>
                            <TableCell className="py-0 text-xs text-center" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <Badge 
                                variant={contract.risk === 'Alto' ? 'destructive' : contract.risk === 'Médio' ? 'default' : 'secondary'}
                                className="text-[10px] px-1 py-0 h-4"
                              >
                                {contract.risk || 'Baixo'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Urgentes */}
          <TabsContent value="urgent" className="space-y-2">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Contratos que Requerem Atenção Imediata</span>
                  <Badge variant="outline">{filteredContracts.filter(c => c.isUrgent || c.daysToExpire <= 3).length} contratos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[500px]">
                  <Table className="w-full relative min-w-[1400px]" style={{ tableLayout: 'fixed' }}>
                    <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
                      <TableRow className="!h-6" style={{ height: '24px !important' }}>
                        <TableHead className="w-[120px] bg-gray-50 py-0 text-xs text-center sticky left-0 z-40 border-r border-gray-300 shadow-sm" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
                        <SortableHeader column="number" className="min-w-[140px]">Nº Pagamento</SortableHeader>
                        <SortableHeader column="supplier" className="min-w-[180px]">Fornecedor</SortableHeader>
                        <SortableHeader column="daysToExpire" className="min-w-[120px]">Dias p/ Vencer</SortableHeader>
                        <SortableHeader column="priority" className="min-w-[100px]">Prioridade</SortableHeader>
                        <SortableHeader column="dueDate" className="min-w-[120px]">Vencimento</SortableHeader>
                        <SortableHeader column="paymentValue" className="min-w-[130px]">Valor</SortableHeader>
                        <SortableHeader column="alertType" className="min-w-[140px]">Tipo de Alerta</SortableHeader>
                        <SortableHeader column="analyst" className="min-w-[120px]">Analista</SortableHeader>
                        <SortableHeader column="risk" className="min-w-[80px]">Risco</SortableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts
                        .filter(c => c.isUrgent || c.daysToExpire <= 3)
                        .sort((a, b) => {
                          if (sortColumn === 'priority') return sortDirection === 'asc' ? a.priorityScore - b.priorityScore : b.priorityScore - a.priorityScore;
                          if (sortColumn === 'daysToExpire') return sortDirection === 'asc' ? a.daysToExpire - b.daysToExpire : b.daysToExpire - a.daysToExpire;
                          if (sortColumn === 'paymentValue') {
                            const aVal = a.paymentValue ?? a.value ?? 0;
                            const bVal = b.paymentValue ?? b.value ?? 0;
                            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          return 0;
                        })
                        .map((contract) => (
                          <TableRow 
                            key={contract.id} 
                            className={`hover:bg-slate-50 transition-colors ${contract.daysToExpire < 0 ? 'bg-red-50/30' : ''}`}
                            style={{ height: '24px' }}
                          >
                            <TableCell className={`py-0 sticky left-0 z-20 border-r border-gray-200 ${contract.daysToExpire < 0 ? 'bg-red-50/30' : 'bg-white'}`} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeContract(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-green-50 hover:text-green-600"
                                  title="Ver análise de IA"
                                >
                                  <Brain className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDocument(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Visualizar documento"
                                >
                                  <Eye className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContract(contract);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                  title="Editar"
                                >
                                  <Edit className="h-2 w-2" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.number}
                            </TableCell>
                            <TableCell className="text-xs py-0 max-w-[180px] truncate" title={contract.supplier} style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.supplier}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getUrgencyBadge(contract.daysToExpire, contract.isUrgent)}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getPriorityBadge(contract.priorityScore)}
                            </TableCell>
                            <TableCell className="text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {formatDate(contract.dueDate)}
                            </TableCell>
                            <TableCell className="text-xs py-0 font-semibold text-vivo-purple" style={{ height: '24px', padding: '2px 8px' }}>
                              {formatCurrency(contract.paymentValue ?? contract.value ?? 0)}
                            </TableCell>
                            <TableCell className="text-xs py-0 max-w-[140px] truncate" title={contract.alertType} style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.alertType || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.analyst || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getRiskBadge(contract.risk)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Vencimentos */}
          <TabsContent value="expiring" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Vencimentos nos Próximos 30 Dias</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={expiringByDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Distribuição por Prioridade</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={priorityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="value">
                        {priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Contratos por Período de Vencimento</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-2xl font-bold text-red-600">
                      {enrichedContracts.filter(c => c.daysToExpire < 0).length}
                    </p>
                    <p className="text-xs text-slate-600">Vencidos</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-2xl font-bold text-orange-600">
                      {enrichedContracts.filter(c => c.daysToExpire >= 0 && c.daysToExpire <= 7).length}
                    </p>
                    <p className="text-xs text-slate-600">0-7 dias</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-2xl font-bold text-yellow-600">
                      {enrichedContracts.filter(c => c.daysToExpire > 7 && c.daysToExpire <= 15).length}
                    </p>
                    <p className="text-xs text-slate-600">8-15 dias</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">
                      {enrichedContracts.filter(c => c.daysToExpire > 15 && c.daysToExpire <= 30).length}
                    </p>
                    <p className="text-xs text-slate-600">16-30 dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Alertas */}
          <TabsContent value="alerts" className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Gráfico de Alertas por Tipo */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Distribuição de Alertas por Tipo</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={alertsByTypeData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
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
                        <p className="text-2xl font-bold text-purple-600 mt-1">{alertMetrics.totalAlerts}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatCurrency(alertMetrics.totalValue)}
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
                        <p className="text-2xl font-bold text-red-600 mt-1">{alertMetrics.criticalAlerts}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Prioridade ≥ 70
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
                        <p className="text-2xl font-bold text-blue-600 mt-1">{alertMetrics.alertTypes}</p>
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

          {/* Tab: Alto Valor */}
          <TabsContent value="highvalue" className="space-y-2">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Contratos de Alto Valor (&gt; R$ 100k)</span>
                  <Badge variant="outline">{filteredContracts.filter(c => (c.paymentValue ?? c.value ?? 0) > 100000).length} contratos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[500px]">
                  <Table className="w-full relative min-w-[1400px]" style={{ tableLayout: 'fixed' }}>
                    <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
                      <TableRow className="!h-6" style={{ height: '24px !important' }}>
                        <TableHead className="w-[120px] bg-gray-50 py-0 text-xs text-center sticky left-0 z-40 border-r border-gray-300 shadow-sm" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
                        <SortableHeader column="number" className="min-w-[140px]">Nº Pagamento</SortableHeader>
                        <SortableHeader column="supplier" className="min-w-[180px]">Fornecedor</SortableHeader>
                        <SortableHeader column="paymentValue" className="min-w-[130px]">Valor</SortableHeader>
                        <SortableHeader column="daysToExpire" className="min-w-[120px]">Dias p/ Vencer</SortableHeader>
                        <SortableHeader column="priority" className="min-w-[100px]">Prioridade</SortableHeader>
                        <SortableHeader column="dueDate" className="min-w-[120px]">Vencimento</SortableHeader>
                        <SortableHeader column="alertType" className="min-w-[140px]">Tipo de Alerta</SortableHeader>
                        <SortableHeader column="analyst" className="min-w-[120px]">Analista</SortableHeader>
                        <SortableHeader column="risk" className="min-w-[80px]">Risco</SortableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts
                        .filter(c => (c.paymentValue ?? c.value ?? 0) > 100000)
                        .sort((a, b) => {
                          if (sortColumn === 'paymentValue') {
                            const aVal = a.paymentValue ?? a.value ?? 0;
                            const bVal = b.paymentValue ?? b.value ?? 0;
                            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                          }
                          if (sortColumn === 'priority') return sortDirection === 'asc' ? a.priorityScore - b.priorityScore : b.priorityScore - a.priorityScore;
                          if (sortColumn === 'daysToExpire') return sortDirection === 'asc' ? a.daysToExpire - b.daysToExpire : b.daysToExpire - a.daysToExpire;
                          return 0;
                        })
                        .map((contract) => (
                          <TableRow 
                            key={contract.id} 
                            className="hover:bg-purple-50/30 transition-colors"
                            style={{ height: '24px' }}
                          >
                            <TableCell className="py-0 sticky left-0 z-20 border-r border-gray-200 bg-white hover:bg-purple-50/30" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeContract(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-green-50 hover:text-green-600"
                                  title="Ver análise de IA"
                                >
                                  <Brain className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDocument(contract.id || contract.number);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Visualizar documento"
                                >
                                  <Eye className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContract(contract);
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                                  title="Editar"
                                >
                                  <Edit className="h-2 w-2" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.number}
                            </TableCell>
                            <TableCell className="text-xs py-0 max-w-[180px] truncate" title={contract.supplier} style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.supplier}
                            </TableCell>
                            <TableCell className="text-xs py-0 font-bold text-purple-600" style={{ height: '24px', padding: '2px 8px' }}>
                              {formatCurrency(contract.paymentValue ?? contract.value ?? 0)}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getUrgencyBadge(contract.daysToExpire, contract.isUrgent)}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getPriorityBadge(contract.priorityScore)}
                            </TableCell>
                            <TableCell className="text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {formatDate(contract.dueDate)}
                            </TableCell>
                            <TableCell className="text-xs py-0 max-w-[140px] truncate" title={contract.alertType} style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.alertType || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs py-0" style={{ height: '24px', padding: '2px 8px' }}>
                              {contract.analyst || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs py-0 text-center" style={{ height: '24px', padding: '2px 8px' }}>
                              {getRiskBadge(contract.risk)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Timeline */}
          <TabsContent value="timeline" className="space-y-2">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Linha do Tempo de Vencimentos</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={expiringByDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={9} />
                    <YAxis fontSize={9} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edição */}
      {selectedContract && (
        <EditSampleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedContract(null);
          }}
          payment={selectedContract}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default AlertsDashboardPage;
