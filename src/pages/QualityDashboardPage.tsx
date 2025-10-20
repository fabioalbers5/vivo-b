import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, DollarSign, FileText, Database, CheckCircle, UserCheck, BarChart3 } from 'lucide-react';
import { useFilteredContractsOnly } from '@/hooks/useFilteredContractsOnly';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useAnalysts } from '@/hooks/useAnalysts';
import { LegacyContract } from '@/hooks/useContractFilters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const QualityDashboardPage: React.FC = () => {
  // Estados para filtros
  const [selectedSampleId, setSelectedSampleId] = useState<string>('all');
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedAnalysisStatus, setSelectedAnalysisStatus] = useState<string>('all');

  // Hooks para dados - passar sampleId para o hook
  const { contracts: allContracts, isLoading: contractsLoading } = useFilteredContractsOnly({ 
    sampleId: selectedSampleId 
  });
  const { sampleHistory, isLoading: historyLoading } = useSampleHistory();
  const { analysts, isLoading: analystsLoading } = useAnalysts();

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar contratos baseado nos filtros selecionados
  const filteredContracts = useMemo(() => {
    let filtered = [...allContracts];

    // Filtro por analista
    if (selectedAnalyst !== 'all') {
      filtered = filtered.filter(c => c.analyst === selectedAnalyst);
    }

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

    return filtered;
  }, [allContracts, selectedAnalyst, selectedDateRange, selectedAnalysisStatus]);

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

    return {
      totalContracts,
      contractsWithAlert,
      totalPaymentValue
    };
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

    return {
      sampleCount: uniqueSampleIds.size,
      totalPaymentValue,
      flowTypeCountsData: Object.entries(flowTypeCounts).map(([name, value]) => ({ name, value })),
      flowTypeValuesData: Object.entries(flowTypeValues).map(([name, value]) => ({ name, value }))
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
      totalPaymentValue,
      flowTypeCountsData: Object.entries(flowTypeCounts).map(([name, value]) => ({ name, value })),
      flowTypeValuesData: Object.entries(flowTypeValues).map(([name, value]) => ({ name, value }))
    };
  }, [filteredContracts]);

  const isLoading = contractsLoading || historyLoading || analystsLoading;

  return (
    <div className="h-full flex flex-col">
      {/* Filtros */}
      <div className="pl-8 pb-3 pt-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* Filtro Amostra */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Amostra:
            </label>
            <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Selecionar amostra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pagamentos</SelectItem>
                {sampleHistory.map((sample) => (
                  <SelectItem key={sample.amostra_id} value={sample.amostra_id}>
                    Amostra {sample.amostra_id}
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
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Selecionar analista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Analistas</SelectItem>
                {analysts.filter(a => a !== 'all').map((analyst) => (
                  <SelectItem key={analyst} value={analyst}>
                    {analyst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Data */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Período:
            </label>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-40 h-8">
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <Select value={selectedAnalysisStatus} onValueChange={setSelectedAnalysisStatus}>
              <SelectTrigger className="w-40 h-8">
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
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Total de Contratos */}
          <Card className="hover:shadow-sm transition-shadow bg-white border-vivo-purple/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-vivo-purple/10">
                    <FileText className="h-4 w-4 text-vivo-purple" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Total de Pagamentos</p>
                    <p className="text-xl font-bold text-vivo-purple">
                      {generalMetrics.totalContracts}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contratos com Alerta */}
          <Card className="hover:shadow-sm transition-shadow bg-white border-orange-200/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Pagamentos com Alerta</p>
                    <p className="text-xl font-bold text-orange-600">
                      {generalMetrics.contractsWithAlert}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor Total */}
          <Card className="hover:shadow-sm transition-shadow bg-white border-blue-200/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-blue-50">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Valor Total de Pagamentos</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(generalMetrics.totalPaymentValue)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Análise */}
        <Tabs defaultValue="all" className="space-y-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Todos os Pagamentos
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprovados em Checagem Básica
            </TabsTrigger>
            <TabsTrigger value="human" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Aprovados em Análise Humana
            </TabsTrigger>
          </TabsList>

          {/* Todas as Amostras */}
          <TabsContent value="all" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-vivo-purple">
                    {allSamplesData.sampleCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor Total de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(allSamplesData.totalPaymentValue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={allSamplesData.flowTypeCountsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={allSamplesData.flowTypeValuesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aprovados em Checagem Básica */}
          <TabsContent value="basic" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {basicCheckData.sampleCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor Total de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(basicCheckData.totalPaymentValue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={basicCheckData.flowTypeCountsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={basicCheckData.flowTypeValuesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aprovados em Análise Humana */}
          <TabsContent value="human" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-emerald-600">
                    {humanAnalysisData.sampleCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor Total de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(humanAnalysisData.totalPaymentValue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Quantidade de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={humanAnalysisData.flowTypeCountsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs">Valor de Pagamentos por Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={humanAnalysisData.flowTypeValuesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={9} />
                      <YAxis fontSize={9} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QualityDashboardPage;