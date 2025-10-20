import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LegacyContract } from '@/hooks/useContractFilters';
import { useAllContracts } from '@/hooks/useAllContracts';
import { useSample } from '@/contexts/SampleContext';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useAnalysts } from '@/hooks/useAnalysts';
import { useContractsByAnalyst } from '@/hooks/useContractsByAnalyst';
import { useFilteredContractsOnly } from '@/hooks/useFilteredContractsOnly';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Users, Database, History, ChevronDown, BarChart3, FileText } from 'lucide-react';
import ContractsTable from '@/components/ContractsTable';
import PaginatedContractsTable from '@/components/PaginatedContractsTable';
import ContractAnalysisModal from '@/components/ContractAnalysisModal';
import { DollarSign } from 'lucide-react';

const COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', 
  '#EC4899', '#8B5A2B', '#6B7280', '#14B8A6', '#F97316'
];

interface ValueRangeData {
  name: string;
  value: number;
  count: number;
}

const SampleAnalysisPage: React.FC = () => {
  const { sampleContracts: contextContracts, sampleMetadata, setSample, selectedAnalyst, setSelectedAnalyst } = useSample();
  const { sampleHistory, isLoading: historyLoading, loadSampleById } = useSampleHistory();
  const { allContracts, isLoading: contractsLoading } = useAllContracts(); // Para calcular representatividade
  const { analysts, isLoading: analystsLoading } = useAnalysts(); // Lista dinâmica de analistas
  const { contractsByAnalyst, isLoading: contractsByAnalystLoading } = useContractsByAnalyst(
    selectedAnalyst && selectedAnalyst !== 'all' ? selectedAnalyst : null
  );
  const { contracts: allFilteredContracts, isLoading: allFilteredLoading } = useFilteredContractsOnly(); // TODOS os contratos em contratos_filtrados
  const [selectedSampleId, setSelectedSampleId] = useState<string>('current');
  const [loadingSample, setLoadingSample] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);
  
  // Estados para modal de análise
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  
  // Definir "Todos os analistas" como padrão quando não há analista selecionado
  useEffect(() => {
    if (!selectedAnalyst && !analystsLoading) {
      setSelectedAnalyst('all');
    }
  }, [selectedAnalyst, analystsLoading, setSelectedAnalyst]);
  
  // Função para lidar com mudança de amostra
  const handleSampleChange = async (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setLoadError(null);
    
    if (sampleId === 'current') {
      // Voltar para amostra atual do contexto
      return;
    }
    
    // Carregar amostra específica
    setLoadingSample(true);
    try {
      console.log(`🔄 Carregando amostra ${sampleId}...`);
      
      const historicalContracts = await loadSampleById(sampleId);
      
      // Atualizar contexto com dados históricos
      setSample(historicalContracts, {
        totalCount: historicalContracts.length,
        appliedFilters: { _historicalSample: true },
        lastUpdated: new Date()
      }, sampleId);
      
      console.log(`✅ Amostra ${sampleId} carregada com ${historicalContracts.length} contratos`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar amostra:', error);
      setLoadError(error instanceof Error ? error.message : 'Erro ao carregar amostra');
      setSelectedSampleId('current'); // Voltar para amostra atual em caso de erro
    } finally {
      setLoadingSample(false);
    }
  };
  
  // ✅ Combinar filtros de amostra e analista
  const contracts = useMemo(() => {
    // Determinar base de contratos
    let baseContracts: LegacyContract[] = [];
    
    if (selectedSampleId === 'current') {
      // "Todos os Contratos Analisados" - buscar TODOS da tabela contratos_filtrados
      baseContracts = allFilteredContracts;
    } else if (contextContracts && contextContracts.length > 0) {
      // Amostra histórica específica - usar contratos do contexto
      baseContracts = contextContracts;
    } else {
      // Sem amostra selecionada
      baseContracts = [];
    }
    
    // Se não há analista selecionado ou é "todos os analistas", retornar base
    if (!selectedAnalyst || selectedAnalyst === 'all') {
      return baseContracts;
    }
    
    // Se há analista específico selecionado, fazer intersecção
    if (contractsByAnalyst && contractsByAnalyst.length > 0) {
      // Criar set dos números de contratos analisados pelo analista para busca rápida
      const analystContractNumbers = new Set(
        contractsByAnalyst.map(contract => contract.number)
      );
      
      // Filtrar base de contratos para mostrar apenas os que foram analisados pelo analista
      return baseContracts.filter(contract => 
        analystContractNumbers.has(contract.number)
      );
    }
    
    // Se não há contratos do analista, retornar array vazio
    return [];
  }, [selectedSampleId, allFilteredContracts, contextContracts, selectedAnalyst, contractsByAnalyst]);
  
  const isLoading = contractsLoading || loadingSample || contractsByAnalystLoading || allFilteredLoading; // Loading dos contratos ou amostra específica
  
  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular estatísticas da amostra (igual à tela de Gestão)
  const sampleStats = useMemo(() => {
    // Soma do valor de PAGAMENTO dos contratos exibidos na tabela
    // Prioriza paymentValue, mas usa value como fallback
    const totalValue = contracts.reduce((sum, c) => {
      const contractValue = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof contractValue === 'number' && !isNaN(contractValue) ? contractValue : 0;
      return sum + validValue;
    }, 0);
    const count = contracts.length;
    
    // Calcular valor total disponível (TODOS os contratos em amostra) - depende do filtro selecionado
    const baseContracts = selectedSampleId === 'current' ? allFilteredContracts : contextContracts;
    const totalAvailableValue = baseContracts.reduce((sum, c) => {
      const contractValue = c.paymentValue ?? c.value ?? 0;
      const validValue = typeof contractValue === 'number' && !isNaN(contractValue) ? contractValue : 0;
      return sum + validValue;
    }, 0);
    const totalAvailable = baseContracts.length;
    
    const percentage = totalAvailableValue > 0 ? (totalValue / totalAvailableValue) * 100 : 0;

    return {
      count,
      totalValue,
      percentage,
      totalAvailable,
      totalAvailableValue
    };
  }, [contracts, selectedSampleId, allFilteredContracts, contextContracts]);

  // Métricas superiores
  const metrics = useMemo(() => {
    const totalContracts = contracts.length;
    const contractsWithAlert = contracts.filter(
      contract => contract.alertType && contract.alertType !== 'Contrato aprovado'
    ).length;
    const alertPercentage = totalContracts > 0 ? Math.round((contractsWithAlert / totalContracts) * 100) : 0;

    return {
      total: totalContracts,
      withAlert: contractsWithAlert,
      alertPercentage
    };
  }, [contracts]);

  // Função auxiliar para criar dados de gráfico simples
  const createSimpleChartData = (field: keyof LegacyContract) => {
    const counts: Record<string, number> = {};
    contracts.forEach(contract => {
      const value = contract[field];
      if (value) {
        const key = String(value);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    
    const result = Object.entries(counts).map(([name, value]) => ({ name, value }));

    return result;
  };

  // Função para criar dados de faixas de valores
  const createValueRangeData = (field: keyof LegacyContract, ranges: { min: number; max: number; label: string }[]): ValueRangeData[] => {
    const rangeCounts = ranges.map(range => ({ ...range, count: 0 }));
    
    contracts.forEach(contract => {
      const value = contract[field] as number;
      if (typeof value === 'number' && value > 0) {
        const rangeIndex = ranges.findIndex(range => 
          value >= range.min && (range.max === Infinity ? true : value < range.max)
        );
        if (rangeIndex !== -1) {
          rangeCounts[rangeIndex].count++;
        }
      }
    });

    return rangeCounts.map(range => ({
      name: range.label,
      value: range.count,
      count: range.count
    }));
  };

  // Definir faixas de valores
  const contractValueRanges = [
    { min: 0, max: 100000, label: 'Menor que R$100k' },
    { min: 100000, max: 500000, label: 'R$100k - R$500k' },
    { min: 500000, max: 1000000, label: 'R$500k - R$1M' },
    { min: 1000000, max: 3000000, label: 'R$1M - R$3M' },
    { min: 3000000, max: 5000000, label: 'R$3M - R$5M' },
    { min: 5000000, max: 8000000, label: 'R$5M - R$8M' },
    { min: 8000000, max: Infinity, label: 'Maior que R$8M' }
  ];

  const fineRanges = [
    { min: 0, max: 1000, label: 'Menor que R$1k' },
    { min: 1000, max: 50000, label: 'R$1k - R$50k' },
    { min: 50000, max: 100000, label: 'R$50k - R$100k' },
    { min: 100000, max: 300000, label: 'R$100k - R$300k' },
    { min: 300000, max: 500000, label: 'R$300k - R$500k' },
    { min: 500000, max: 800000, label: 'R$500k - R$800k' },
    { min: 800000, max: Infinity, label: 'Maior que R$800k' }
  ];

  // Dados dos gráficos
  const flowTypeData = createSimpleChartData('type');
  const contractValueData = createValueRangeData('value', contractValueRanges);
  const paymentValueData = createValueRangeData('paymentValue', contractValueRanges);
  const alertTypeData = createSimpleChartData('alertType');
  const requestingAreaData = createSimpleChartData('requestingArea');
  const riskData = createSimpleChartData('risk');
  const fineData = createValueRangeData('fine', fineRanges);
  
  // Novos dados para região, estado e status do pagamento
  const regionData = createSimpleChartData('region');
  const stateData = createSimpleChartData('state');
  const paymentStatusData = createSimpleChartData('paymentStatus');
  
  // Debug: verificar dados da amostra
  // console.log('� Total de contratos na amostra:', contracts.length);
  // console.log('� Exemplo de contrato:', contracts[0]);
  // console.log('� Regiões disponíveis:', contracts.map(c => c.region).filter(Boolean));
  // console.log('� Estados disponíveis:', contracts.map(c => c.state).filter(Boolean));
  // console.log('� Status pagamento disponíveis:', contracts.map(c => c.paymentStatus).filter(Boolean));

  // ✅ Estados de loading e erro removidos - usamos apenas dados do contexto

  // Mostrar estado de loading
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Análise dos Contratos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboards e métricas dos contratos filtrados
          </p>
        </div>
        
        <div className="p-6 flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <CardTitle>Carregando Dados...</CardTitle>
              <CardDescription>
                Aguarde enquanto carregamos os contratos para análise.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar se há contratos disponíveis
  if (!isLoading && allFilteredContracts.length === 0 && contextContracts.length === 0) {
    return (
      <div className="h-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Análise da Amostra
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize e analise os contratos da amostra selecionada
          </p>
        </div>
        
        <div className="p-6 flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Nenhuma Amostra Disponível</CardTitle>
              <CardDescription>
                Não há contratos analisados. Vá para "Gestão da Amostra" para selecionar e finalizar contratos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline" className="text-xs">
                {allFilteredContracts.length} contratos disponíveis
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-vivo-purple">
            Contratos: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = (data: Array<{ name: string; value: number }>, title: string) => {

    
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-full">
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">
              Nenhum dado disponível
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full">
        <div className="bg-white rounded-lg border p-2 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={10}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                fontSize={10}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="pl-8 pb-3 pt-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-6">
            {/* Dropdown de seleção de amostras */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 min-w-fit">
                Amostra:
              </label>
              <Select
                value={selectedSampleId}
                onValueChange={handleSampleChange}
                disabled={historyLoading || loadingSample}
              >
                <SelectTrigger className="w-64 h-5">
                  <SelectValue placeholder="Selecionar amostra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Todos os Contratos Analisados
                  </SelectItem>
                  {sampleHistory.map((sample) => (
                    <SelectItem key={sample.amostra_id} value={sample.amostra_id}>
                      Amostra {sample.amostra_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Dropdown de seleção de analista */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 min-w-fit">
                Analista:
              </label>
              <Select
                value={selectedAnalyst}
                onValueChange={setSelectedAnalyst}
                disabled={analystsLoading || analysts.length === 0}
              >
                <SelectTrigger className="w-64 h-5">
                  <SelectValue placeholder={
                    analystsLoading 
                      ? "Carregando analistas..." 
                      : analysts.length === 0 
                        ? "Nenhum analista encontrado" 
                        : "Selecionar analista"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos os analistas
                  </SelectItem>
                  {analysts.filter(analyst => analyst !== 'all').map((analyst) => (
                    <SelectItem key={analyst} value={analyst}>
                      {analyst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {analystsLoading && (
                <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            
            {loadingSample && (
              <div className="text-sm text-blue-600 animate-pulse flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Carregando...
              </div>
            )}
            
            {loadError && (
              <p className="text-sm text-red-600">
                ⚠️ {loadError}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4 h-full flex flex-col">
        {/* Cards de Estatísticas da Amostra */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Número de Pagamentos na Amostra */}
          <Card className="hover:shadow-sm transition-shadow bg-white border-vivo-purple/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg p-1.5 bg-vivo-purple/10">
                    <FileText className="h-3.5 w-3.5 text-vivo-purple" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Pagamentos na Amostra</p>
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

          {/* Valor Total da Amostra */}
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

        {/* Container Principal com Abas */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <Card className="h-full flex flex-col">
            <Tabs defaultValue="contracts" className="h-full flex flex-col">
              <CardHeader className="pb-2 pt-3">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="contracts" className="flex items-center gap-2 text-xs">
                    <Database className="h-3 w-3" />
                    Contratos Detalhados
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2 text-xs">
                    <BarChart3 className="h-3 w-3" />
                    Análise Detalhada
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-3">
                {/* Aba Contratos Detalhados */}
                <TabsContent value="contracts" className="h-full overflow-auto m-0">
                  <PaginatedContractsTable
                    contracts={contracts}
                    filteredContracts={contracts}
                    showFilteredResults={false}
                    onViewContract={(contractId) => {
                      console.log('Visualizar contrato:', contractId);
                    }}
                    onAnalyzeContract={(contractId) => {
                      setSelectedContractId(contractId);
                      setAnalysisModalOpen(true);
                      console.log('Analisar contrato:', contractId);
                    }}
                    isLoading={isLoading}
                    selectedContracts={new Set()}
                    onSelectionChange={() => {}}
                  />
                </TabsContent>

                {/* Aba Gráficos */}
                <TabsContent value="charts" className="h-full overflow-hidden">
                  <div className="h-full">
                    <Tabs defaultValue="flow-type" className="h-full flex flex-col" orientation="vertical">
                      <div className="flex gap-4 flex-1 overflow-hidden">
                        {/* Tabs verticais à esquerda */}
                        <div className="w-40 flex-shrink-0">
                          <TabsList className="flex flex-col h-auto w-full space-y-1 p-1">
                            <TabsTrigger value="flow-type" className="w-full justify-start text-xs py-2">
                              Tipo Fluxo
                            </TabsTrigger>
                            <TabsTrigger value="contract-value" className="w-full justify-start text-xs py-2">
                              Valor Contrato
                            </TabsTrigger>
                            <TabsTrigger value="payment-value" className="w-full justify-start text-xs py-2">
                              Valor Pagamento
                            </TabsTrigger>
                            <TabsTrigger value="alert-type" className="w-full justify-start text-xs py-2">
                              Tipo Alerta
                            </TabsTrigger>
                            <TabsTrigger value="requesting-area" className="w-full justify-start text-xs py-2">
                              Área Solicitante
                            </TabsTrigger>
                            <TabsTrigger value="risk" className="w-full justify-start text-xs py-2">
                              Risco
                            </TabsTrigger>
                            <TabsTrigger value="fine" className="w-full justify-start text-xs py-2">
                              Multa
                            </TabsTrigger>
                            <TabsTrigger value="region" className="w-full justify-start text-xs py-2">
                              Região
                            </TabsTrigger>
                            <TabsTrigger value="state" className="w-full justify-start text-xs py-2">
                              Estado
                            </TabsTrigger>
                            <TabsTrigger value="payment-status" className="w-full justify-start text-xs py-2">
                              Status Pagamento
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Área dos gráficos à direita */}
                        <div className="flex-1 h-full overflow-hidden">
                          <TabsContent value="flow-type" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(flowTypeData, 'Distribuição por Tipo de Fluxo')}
                            </div>
                          </TabsContent>

                          <TabsContent value="contract-value" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(contractValueData, 'Distribuição por Valor do Contrato')}
                            </div>
                          </TabsContent>

                          <TabsContent value="payment-value" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(paymentValueData, 'Distribuição por Valor do Pagamento')}
                            </div>
                          </TabsContent>

                          <TabsContent value="alert-type" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(alertTypeData, 'Distribuição por Tipo de Alerta')}
                            </div>
                          </TabsContent>

                          <TabsContent value="requesting-area" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(requestingAreaData, 'Distribuição por Área Solicitante')}
                            </div>
                          </TabsContent>

                          <TabsContent value="risk" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(riskData, 'Distribuição por Nível de Risco')}
                            </div>
                          </TabsContent>

                          <TabsContent value="fine" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(fineData, 'Distribuição por Valor da Multa')}
                            </div>
                          </TabsContent>

                          <TabsContent value="region" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(regionData, 'Distribuição por Região')}
                            </div>
                          </TabsContent>

                          <TabsContent value="state" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(stateData, 'Distribuição por Estado')}
                            </div>
                          </TabsContent>

                          <TabsContent value="payment-status" className="h-full">
                            <div className="w-full h-full">
                              {renderBarChart(paymentStatusData, 'Distribuição por Status do Pagamento')}
                            </div>
                          </TabsContent>
                        </div>
                      </div>
                    </Tabs>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Contract Analysis Modal */}
      <ContractAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        contractId={selectedContractId}
      />
    </div>
  );
};

export default SampleAnalysisPage;
