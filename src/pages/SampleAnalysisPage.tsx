import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LegacyContract } from '@/hooks/useContractFilters';
import { useAllContracts } from '@/hooks/useAllContracts';
import { useSample } from '@/contexts/SampleContext';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useAnalysts } from '@/hooks/useAnalysts';
import { useContractsByAnalyst } from '@/hooks/useContractsByAnalyst';
import { calculateRepresentativityScore } from '@/utils/representativityCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Users, Target, Database, History, ChevronDown } from 'lucide-react';
import ContractsTable from '@/components/ContractsTable';

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
  const [selectedSampleId, setSelectedSampleId] = useState<string>('current');
  const [loadingSample, setLoadingSample] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRepresentativityExpanded, setIsRepresentativityExpanded] = useState(false);
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);
  
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
      const amostraIdNumber = parseInt(sampleId);
      console.log(`🔄 Carregando amostra ${amostraIdNumber}...`);
      
      const historicalContracts = await loadSampleById(amostraIdNumber);
      
      // Atualizar contexto com dados históricos
      setSample(historicalContracts, {
        totalCount: historicalContracts.length,
        appliedFilters: { _historicalSample: true },
        lastUpdated: new Date()
      }, amostraIdNumber);
      
      console.log(`✅ Amostra ${amostraIdNumber} carregada com ${historicalContracts.length} contratos`);
      
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
    // Determinar base de contratos (amostra específica ou todos)
    let baseContracts: LegacyContract[] = [];
    if (selectedSampleId !== 'current' && contextContracts && contextContracts.length > 0) {
      baseContracts = contextContracts;
    } else {
      baseContracts = allContracts || [];
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
  }, [selectedSampleId, contextContracts, allContracts, selectedAnalyst, contractsByAnalyst]);

  // Calcular representatividade dinamicamente
  const representativityScore = useMemo(() => {
    if (contracts.length === 0 || allContracts.length === 0) {
      return 0;
    }
    
    return calculateRepresentativityScore(allContracts, contracts);
  }, [contracts, allContracts]);
  
  const isLoading = contractsLoading || loadingSample || contractsByAnalystLoading; // Loading dos contratos ou amostra específica
  


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

  // Verificar se há dados para análise (DESABILITADO PARA MANTER FILTROS SEMPRE VISÍVEIS)
  // eslint-disable-next-line no-constant-condition
  if (false && contracts.length === 0) {
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
              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Nenhum Contrato Disponível</CardTitle>
              <CardDescription>
                Não foram encontrados contratos na base de dados para análise.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline" className="text-xs">
                Última verificação: {new Date().toLocaleString('pt-BR')}
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
        <div className="h-80">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">
              Nenhum dado disponível para {title.toLowerCase()}
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-80">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                fontSize={11}
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
      <div className="p-6 border-b border-gray-100">
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
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecionar amostra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Todos os Contratos Analisados
                  </SelectItem>
                  {sampleHistory.map((sample) => (
                    <SelectItem key={sample.amostra_id} value={sample.amostra_id.toString()}>
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
                <SelectTrigger className="w-64">
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
      
      <div className="p-6 space-y-6">
        {/* Container de Métricas Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-vivo-purple">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                Contratos na amostra selecionada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos com Alerta</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{metrics.withAlert}</div>
              <p className="text-xs text-muted-foreground">
                Contratos que requerem atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Porcentagem de Alerta</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{metrics.alertPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                Percentual de contratos com alerta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Card de Análise de Representatividade Detalhada */}
        <Collapsible 
          open={isRepresentativityExpanded} 
          onOpenChange={setIsRepresentativityExpanded}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Análise de Representatividade da Amostra
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isRepresentativityExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </CardTitle>
                <CardDescription>
                  Métricas que indicam o quão bem esta amostra representa o conjunto total de dados
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Score Geral */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {contractsLoading ? (
                    <div className="text-blue-500 animate-pulse">...</div>
                  ) : (
                    representativityScore !== null && representativityScore !== undefined && !isNaN(representativityScore) && representativityScore > 0 ? 
                      `${(representativityScore * 100).toFixed(1)}%` : 
                      'N/A'
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">Score Geral</div>
                <div className="text-xs text-gray-500 mt-1">
                  Representatividade global
                  {contractsLoading && (
                    <span className="block text-blue-500 text-xs mt-1">
                      Carregando dados...
                    </span>
                  )}
                </div>
              </div>

              {/* Tamanho da Amostra */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {contracts.length}
                </div>
                <div className="text-sm font-medium text-gray-700">Tamanho</div>
                <div className="text-xs text-gray-500 mt-1">Contratos na amostra</div>
              </div>

              {/* Diversidade */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(contracts.map(c => c.type)).size}
                </div>
                <div className="text-sm font-medium text-gray-700">Tipos</div>
                <div className="text-xs text-gray-500 mt-1">Diferentes tipos de fluxo</div>
              </div>

              {/* Cobertura Regional */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {new Set(contracts.map(c => c.region).filter(Boolean)).size}
                </div>
                <div className="text-sm font-medium text-gray-700">Regiões</div>
                <div className="text-xs text-gray-500 mt-1">Cobertura geográfica</div>
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Container de Gráficos com Tabs */}
        <Card>
          <Collapsible open={isChartsExpanded} onOpenChange={setIsChartsExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Análise Detalhada</CardTitle>
                    <CardDescription>
                      Visualizações gráficas dos dados da amostra selecionada
                    </CardDescription>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isChartsExpanded ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <Tabs defaultValue="flow-type" className="w-full" orientation="vertical">
              <div className="flex gap-6">
                {/* Tabs verticais à esquerda */}
                <div className="w-48 flex-shrink-0">
                  <TabsList className="flex flex-col h-auto w-full space-y-1 p-1">
                    <TabsTrigger value="flow-type" className="w-full justify-start text-sm py-3">
                      Tipo Fluxo
                    </TabsTrigger>
                    <TabsTrigger value="contract-value" className="w-full justify-start text-sm py-3">
                      Valor Contrato
                    </TabsTrigger>
                    <TabsTrigger value="payment-value" className="w-full justify-start text-sm py-3">
                      Valor Pagamento
                    </TabsTrigger>
                    <TabsTrigger value="alert-type" className="w-full justify-start text-sm py-3">
                      Tipo Alerta
                    </TabsTrigger>
                    <TabsTrigger value="requesting-area" className="w-full justify-start text-sm py-3">
                      Área Solicitante
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="w-full justify-start text-sm py-3">
                      Risco
                    </TabsTrigger>
                    <TabsTrigger value="fine" className="w-full justify-start text-sm py-3">
                      Multa
                    </TabsTrigger>
                    <TabsTrigger value="region" className="w-full justify-start text-sm py-3">
                      Região
                    </TabsTrigger>
                    <TabsTrigger value="state" className="w-full justify-start text-sm py-3">
                      Estado
                    </TabsTrigger>
                    <TabsTrigger value="payment-status" className="w-full justify-start text-sm py-3">
                      Status Pagamento
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Área dos gráficos à direita */}
                <div className="flex-1 min-h-96">

                  <TabsContent value="flow-type">
                    {renderBarChart(flowTypeData, 'Distribuição por Tipo de Fluxo')}
                  </TabsContent>

                  <TabsContent value="contract-value">
                    {renderBarChart(contractValueData, 'Distribuição por Valor do Contrato')}
                  </TabsContent>

                  <TabsContent value="payment-value">
                    {renderBarChart(paymentValueData, 'Distribuição por Valor do Pagamento')}
                  </TabsContent>

                  <TabsContent value="alert-type">
                    {renderBarChart(alertTypeData, 'Distribuição por Tipo de Alerta')}
                  </TabsContent>

                  <TabsContent value="requesting-area">
                    {renderBarChart(requestingAreaData, 'Distribuição por Área Solicitante')}
                  </TabsContent>

                  <TabsContent value="risk">
                    {renderBarChart(riskData, 'Distribuição por Nível de Risco')}
                  </TabsContent>

                  <TabsContent value="fine">
                    {renderBarChart(fineData, 'Distribuição por Valor da Multa')}
                  </TabsContent>

                  <TabsContent value="region">
                    {renderBarChart(regionData, 'Distribuição por Região')}
                  </TabsContent>

                  <TabsContent value="state">
                    {renderBarChart(stateData, 'Distribuição por Estado')}
                  </TabsContent>

                  <TabsContent value="payment-status">
                    {renderBarChart(paymentStatusData, 'Distribuição por Status do Pagamento')}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tabela de Contratos Detalhada */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Contratos Detalhados
            </CardTitle>
            <CardDescription>
              Lista completa dos contratos incluídos na análise atual
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <ContractsTable 
              contracts={contracts}
              onViewContract={(contractId) => {
                console.log('Visualizar contrato:', contractId);
                // TODO: Implementar modal de visualização do contrato
                alert(`Funcionalidade de visualização do contrato ${contractId} será implementada em breve.`);
              }}
              onAnalyzeContract={(contractId) => {
                console.log('Analisar contrato:', contractId);
                // TODO: Implementar análise de IA específica do contrato
                alert(`Funcionalidade de análise de IA do contrato ${contractId} será implementada em breve.`);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SampleAnalysisPage;
