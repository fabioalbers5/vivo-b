import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import SampleSelectionPage from '@/pages/SampleSelectionPage';
import SampleAnalysisPage from '@/pages/SampleAnalysisPage';
import { SampleProvider } from '@/contexts/SampleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line } from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock,
  FileX,
  Target,
  Users,
  Building,
  Eye,
  RefreshCw,
  MousePointer
} from 'lucide-react';
import { useQualityMetrics, useSupplierRanking, useInconsistencyDistribution } from '@/hooks/useQualityMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Cores do tema Vivo - Padrão #A27DF8
const VIVO_COLORS = [
  '#A27DF8', // Cor padrão principal
  '#B48FFA', // Variação mais clara
  '#9267F6', // Variação mais escura
  '#C4A3FC', // Variação bem clara
  '#8255F4', // Variação bem escura
  '#D1B5FE', // Variação muito clara
  '#7044F2', // Variação muito escura
  '#E0C9FF', // Variação ultra clara
];

const QualityDashboardPageInline: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<{
    tipoAlerta?: string;
    fornecedor?: string;
    risco?: string;
    areasolicitante?: string;
    periodo?: string;
  }>({});

  const { data: metrics, isLoading, error } = useQualityMetrics();
  const { data: supplierRanking, isLoading: suppliersLoading } = useSupplierRanking();
  const { data: inconsistencyDistribution, isLoading: distributionLoading } = useInconsistencyDistribution();

  // Hook para buscar contratos com inconsistências para a tabela
  const { data: allContractsWithInconsistencies, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts-with-inconsistencies'],
    queryFn: async () => {
      const { data: contracts, error } = await supabase
        .from('contratos_vivo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!contracts) return [];

      // Filtrar apenas contratos com inconsistências
      return contracts.filter(contract => {
        const tipoAlerta = contract.tipo_alerta;
        if (!tipoAlerta) return true; // null/undefined = inconsistência
        
        const normalizedAlert = tipoAlerta.toLowerCase().trim();
        return !(normalizedAlert === 'contrato aprovado' || 
                 normalizedAlert === 'aprovado' ||
                 normalizedAlert.includes('aprovado'));
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  // Função auxiliar para determinar o período de vencimento
  const getContractPeriod = (dataVencimento: string | null) => {
    if (!dataVencimento) return null;
    
    const today = new Date();
    const expiryDate = new Date(dataVencimento);
    const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference <= 30 && daysDifference > 0) return '0-30 dias';
    if (daysDifference <= 60 && daysDifference > 30) return '31-60 dias';
    if (daysDifference <= 90 && daysDifference > 60) return '61-90 dias';
    if (daysDifference > 90) return '90+ dias';
    return null; // Contratos já vencidos ou com data inválida
  };

  // Aplicar filtros dinâmicos aos contratos
  const contractsWithInconsistencies = useMemo(() => {
    if (!allContractsWithInconsistencies) return [];

    console.log('Active filters:', activeFilters);
    console.log('Total contracts before filtering:', allContractsWithInconsistencies.length);

    const filtered = allContractsWithInconsistencies.filter(contract => {
      // Filtro por tipo de alerta
      if (activeFilters.tipoAlerta && contract.tipo_alerta !== activeFilters.tipoAlerta) {
        return false;
      }

      // Filtro por fornecedor
      if (activeFilters.fornecedor && contract.fornecedor !== activeFilters.fornecedor) {
        return false;
      }

      // Filtro por risco
      if (activeFilters.risco && contract.risco !== activeFilters.risco) {
        return false;
      }

      // Filtro por área solicitante
      if (activeFilters.areasolicitante && contract.area_solicitante !== activeFilters.areasolicitante) {
        return false;
      }

      // Filtro por período de vencimento
      if (activeFilters.periodo) {
        const contractPeriod = getContractPeriod(contract.data_vencimento);
        if (contractPeriod !== activeFilters.periodo) {
          return false;
        }
      }

      return true;
    });

    console.log('Filtered contracts:', filtered.length);
    return filtered;
  }, [allContractsWithInconsistencies, activeFilters]);

  // Funções para lidar com cliques nos gráficos
  const handleBarClick = (data: { type?: string; area?: string; period?: string }, filterType: string) => {
    console.log('Bar clicked:', data, 'filterType:', filterType);
    const filterKey = filterType as keyof typeof activeFilters;
    let filterValue = '';
    
    if (filterType === 'tipoAlerta') {
      filterValue = data.type || '';
    } else if (filterType === 'areasolicitante') {
      filterValue = data.area || '';
    } else if (filterType === 'periodo') {
      filterValue = data.period || '';
    }
    
    console.log('Setting filter:', filterKey, '=', filterValue);
    
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === filterValue ? undefined : filterValue
    }));
  };

  const handleSupplierClick = (supplierName: string) => {
    console.log('Supplier clicked:', supplierName);
    setActiveFilters(prev => ({
      ...prev,
      fornecedor: prev.fornecedor === supplierName ? undefined : supplierName
    }));
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar métricas de qualidade. Verifique a conexão com o Supabase.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Dados simulados para demonstração (quando metrics não estiver disponível)
  const mockMetrics = {
    totalContracts: 245,
    inconsistencyRate: 18.5,
    criticalContracts: 12,
    averageResolutionTime: 15,
    totalFinancialExposure: 2500000,
    projectedPenalties: 125000,
    contractsExpiring30Days: 28,
    contractsExpiring60Days: 45,
    contractsExpiring90Days: 32,
    autoRenewedContracts: 8,
    highRiskContracts: 18,
    highRiskPercentage: 7.3,
  };

  const currentMetrics = metrics || mockMetrics;

  // Dados reais de inconsistências por tipo
  const inconsistencyData = inconsistencyDistribution?.byType || [];

  // Dados reais de inconsistências por área
  const areaData = inconsistencyDistribution?.byArea || [];

  // Dados dos fornecedores virão do hook useSupplierRanking

  const deadlineData = [
    { period: '0-30 dias', count: currentMetrics.contractsExpiring30Days, color: '#A27DF8' },
    { period: '31-60 dias', count: currentMetrics.contractsExpiring60Days, color: '#B48FFA' },
    { period: '61-90 dias', count: currentMetrics.contractsExpiring90Days, color: '#9267F6' },
    { period: '90+ dias', count: 140, color: '#C4A3FC' },
  ];

  const timelineData = [
    { month: 'Jan', expiring30: 15, expiring60: 22, expiring90: 18 },
    { month: 'Fev', expiring30: 18, expiring60: 20, expiring90: 25 },
    { month: 'Mar', expiring30: 22, expiring60: 28, expiring90: 20 },
    { month: 'Abr', expiring30: 20, expiring60: 25, expiring90: 30 },
    { month: 'Mai', expiring30: 25, expiring60: 30, expiring90: 22 },
    { month: 'Jun', expiring30: currentMetrics.contractsExpiring30Days, expiring60: currentMetrics.contractsExpiring60Days, expiring90: currentMetrics.contractsExpiring90Days },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-vivo-purple" />
            Dashboards de Qualidade
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise de qualidade e compliance dos contratos Vivo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-vivo-purple text-vivo-purple">
            <Eye className="h-3 w-3 mr-1" />
            Tempo Real
          </Badge>
        </div>
      </div>

      {/* Filtros Ativos */}
      {(activeFilters.tipoAlerta || activeFilters.fornecedor || activeFilters.risco || activeFilters.areasolicitante || activeFilters.periodo) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">Filtros Ativos:</span>
              {activeFilters.tipoAlerta && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Tipo: {activeFilters.tipoAlerta}
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, tipoAlerta: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {activeFilters.fornecedor && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Fornecedor: {activeFilters.fornecedor}
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, fornecedor: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {activeFilters.risco && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Risco: {activeFilters.risco}
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, risco: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {activeFilters.areasolicitante && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Área: {activeFilters.areasolicitante}
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, areasolicitante: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {activeFilters.periodo && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Período: {activeFilters.periodo}
                  <button 
                    onClick={() => setActiveFilters(prev => ({ ...prev, periodo: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
      </div>

      {/* Tabs de navegação */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Distribuição
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Exposição Financeira
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Prazos
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risco & Compliance
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Header com resumo geral */}
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Visão Geral de Qualidade
              </CardTitle>
              <CardDescription>
                Acompanhe os principais indicadores de qualidade dos {currentMetrics.totalContracts} contratos ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-vivo-purple">{currentMetrics.totalContracts}</div>
                  <div className="text-sm text-muted-foreground">Contratos Totais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(100 - currentMetrics.inconsistencyRate)}
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Conformidade</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(currentMetrics.totalFinancialExposure + currentMetrics.projectedPenalties)}
                  </div>
                  <div className="text-sm text-muted-foreground">Impacto Financeiro Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Inconsistência
                  </CardTitle>
                  <div className="rounded-full p-2 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatPercentage(currentMetrics.inconsistencyRate)}</div>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {currentMetrics.inconsistencyRate > 25 ? 'Acima' : 'Dentro'} da meta de 25%
                    </div>
                    <Progress value={Math.min(currentMetrics.inconsistencyRate, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Contratos Críticos
                  </CardTitle>
                  <div className="rounded-full p-2 bg-red-50">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{currentMetrics.criticalContracts}</div>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((currentMetrics.criticalContracts / currentMetrics.totalContracts) * 100)} do total
                    </div>
                    <Progress value={(currentMetrics.criticalContracts / currentMetrics.totalContracts) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Exposição Financeira
                  </CardTitle>
                  <div className="rounded-full p-2 bg-vivo-purple/5">
                    <DollarSign className="h-4 w-4 text-vivo-purple" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{formatCurrency(currentMetrics.totalFinancialExposure)}</div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Valor total em risco</div>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vencendo (30d)
                  </CardTitle>
                  <div className="rounded-full p-2 bg-orange-50">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{currentMetrics.contractsExpiring30Days}</div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((currentMetrics.contractsExpiring30Days / currentMetrics.totalContracts) * 100)} do total
                    </div>
                    <Progress value={(currentMetrics.contractsExpiring30Days / currentMetrics.totalContracts) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribuição por Inconsistências */}
        <TabsContent value="distribution" className="space-y-6">
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Distribuição de Inconsistências
              </CardTitle>
              <CardDescription>
                Análise detalhada da distribuição de inconsistências por tipo, área e fornecedor
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras - Por tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Por Tipo de Inconsistência
                  </div>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Distribuição de todas as inconsistências encontradas na base de contratos • Clique nas barras para filtrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distributionLoading ? (
                  <div className="h-[300px] bg-muted animate-pulse rounded"></div>
                ) : inconsistencyData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhuma inconsistência encontrada
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inconsistencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="type" 
                        stroke="hsl(var(--foreground))" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const percentage = props.payload?.percentage || 0;
                          return [`${value} (${Number(percentage).toFixed(1)}%)`, 'Quantidade de Contratos'];
                        }}
                        labelFormatter={(label) => `Tipo: ${label}`}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#A27DF8" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => {
                          console.log('Bar clicked - data:', data);
                          handleBarClick({ type: data.type }, 'tipoAlerta');
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>



            {/* Por área */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Por Área Solicitante
                  </div>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Distribuição de inconsistências por todas as áreas presentes na base • Clique nas barras para filtrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distributionLoading ? (
                  <div className="h-[300px] bg-muted animate-pulse rounded"></div>
                ) : areaData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhuma área com inconsistências encontrada
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={areaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="area" 
                        stroke="hsl(var(--foreground))" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const percentage = props.payload?.percentage || 0;
                          return [`${value} (${Number(percentage).toFixed(1)}%)`, 'Quantidade de Contratos'];
                        }}
                        labelFormatter={(label) => `Área: ${label}`}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#A27DF8" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => {
                          console.log('Area bar clicked - data:', data);
                          handleBarClick({ area: data.area }, 'areasolicitante');
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Tabela de fornecedores críticos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Top Fornecedores Críticos
                  </div>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Top 5 fornecedores com maior número de inconsistências contratuais • Clique nas linhas para filtrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suppliersLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead className="text-center">Contratos com Inconsistências</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(supplierRanking || []).map((supplier, index) => (
                        <TableRow 
                          key={supplier.supplier} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            console.log('Supplier row clicked:', supplier.supplier);
                            handleSupplierClick(supplier.supplier);
                          }}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {supplier.supplier || 'Fornecedor não informado'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium text-lg">
                              {supplier.inconsistencies}/{supplier.totalContracts}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!supplierRanking || supplierRanking.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            Nenhum fornecedor encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exposição Financeira */}
        <TabsContent value="financial" className="space-y-6">
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Exposição Financeira
              </CardTitle>
              <CardDescription>
                Análise do impacto financeiro dos riscos e inconsistências contratuais
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-vivo-purple/20 bg-vivo-purple/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-vivo-purple" />
                  <div>
                    <div className="text-2xl font-bold text-vivo-purple">
                      {formatCurrency(currentMetrics.totalFinancialExposure)}
                    </div>
                    <div className="text-sm text-muted-foreground">Exposição Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-900">
                      {formatCurrency(currentMetrics.projectedPenalties)}
                    </div>
                    <div className="text-sm text-red-700">Multas Projetadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(currentMetrics.totalFinancialExposure + currentMetrics.projectedPenalties)}
                    </div>
                    <div className="text-sm text-orange-700">Impacto Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {((currentMetrics.projectedPenalties / currentMetrics.totalFinancialExposure) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-700">Taxa de Risco</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Indicadores de Prazo */}
        <TabsContent value="deadlines" className="space-y-6">
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Indicadores de Prazo
              </CardTitle>
              <CardDescription>
                Monitoramento de vencimentos e renovações contratuais
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-red-900">
                        {currentMetrics.contractsExpiring30Days}
                      </div>
                      <div className="text-sm text-red-700">Vencendo em 30 dias</div>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">Urgente</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {currentMetrics.contractsExpiring60Days}
                      </div>
                      <div className="text-sm text-orange-700">Vencendo em 60 dias</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">Atenção</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {currentMetrics.contractsExpiring90Days}
                      </div>
                      <div className="text-sm text-yellow-700">Vencendo em 90 dias</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600">Normal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {currentMetrics.autoRenewedContracts}
                      </div>
                      <div className="text-sm text-blue-700">Renovações Automáticas</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">Revisão</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Distribuição por Período
                  </div>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Contratos por período de vencimento • Clique nas barras para filtrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deadlineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      onClick={(data) => {
                        console.log('Period bar clicked - data:', data);
                        handleBarClick({ period: data.period }, 'periodo');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {deadlineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendência temporal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tendência Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="expiring30" stroke="#A27DF8" strokeWidth={3} name="30 dias" />
                    <Line type="monotone" dataKey="expiring60" stroke="#B48FFA" strokeWidth={3} name="60 dias" />
                    <Line type="monotone" dataKey="expiring90" stroke="#9267F6" strokeWidth={3} name="90 dias" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMetrics.contractsExpiring30Days > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Ação Urgente:</strong> {currentMetrics.contractsExpiring30Days} contratos vencendo em 30 dias. 
                  Iniciar processo de renovação imediatamente.
                </AlertDescription>
              </Alert>
            )}
            
            {currentMetrics.autoRenewedContracts > 5 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Revisão Necessária:</strong> {currentMetrics.autoRenewedContracts} contratos renovados automaticamente. 
                  Agendar revisão para validar termos e condições.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Risco & Compliance */}
        <TabsContent value="risk" className="space-y-6">
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risco & Compliance
              </CardTitle>
              <CardDescription>
                Análise de risco corporativo e conformidade regulatória
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-900">
                      {currentMetrics.highRiskPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-red-700">Alto Risco</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-900">
                      {currentMetrics.criticalContracts}
                    </div>
                    <div className="text-sm text-orange-700">Contratos Críticos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {(100 - currentMetrics.inconsistencyRate).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-700">Taxa Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-vivo-purple/20 bg-vivo-purple/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-vivo-purple" />
                  <div>
                    <div className="text-2xl font-bold text-vivo-purple">82</div>
                    <div className="text-sm text-muted-foreground">Score Geral</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas críticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMetrics.highRiskPercentage > 5 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Crítico:</strong> Taxa de alto risco em {currentMetrics.highRiskPercentage.toFixed(1)}%. 
                  Implementar revisão emergencial de contratos.
                </AlertDescription>
              </Alert>
            )}
            
            {currentMetrics.criticalContracts > 10 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Urgente:</strong> {currentMetrics.criticalContracts} contratos críticos identificados. 
                  Escalar para comitê de risco.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tabela de Contratos com Inconsistências */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileX className="h-5 w-5 text-red-500" />
                Contratos com Inconsistências
                {contractsWithInconsistencies && (
                  <Badge variant="outline" className="ml-2">
                    {contractsWithInconsistencies.length} contrato(s)
                  </Badge>
                )}
              </div>
              {(activeFilters.tipoAlerta || activeFilters.fornecedor || activeFilters.risco || activeFilters.areasolicitante || activeFilters.periodo) && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Filtrados
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {(activeFilters.tipoAlerta || activeFilters.fornecedor || activeFilters.risco || activeFilters.areasolicitante || activeFilters.periodo) 
                ? "Lista filtrada dos contratos com inconsistências - clique nos gráficos acima para filtrar"
                : "Lista detalhada dos contratos que apresentam inconsistências - clique nos gráficos acima para filtrar"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Carregando contratos...</span>
              </div>
            ) : contractsWithInconsistencies && contractsWithInconsistencies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Contrato</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Área Solicitante</TableHead>
                    <TableHead>Tipo de Alerta</TableHead>
                    <TableHead>Nível de Risco</TableHead>
                    <TableHead>Valor do Contrato</TableHead>
                    <TableHead>Multa</TableHead>
                    <TableHead>Data de Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractsWithInconsistencies.map((contract, index) => (
                    <TableRow key={contract.id || index}>
                      <TableCell className="font-medium">
                        {contract.numero_contrato || 'N/A'}
                      </TableCell>
                      <TableCell>{contract.fornecedor || 'N/A'}</TableCell>
                      <TableCell>{contract.area_solicitante || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="destructive" 
                          className="bg-red-100 text-red-800 border-red-200"
                        >
                          {contract.tipo_alerta || 'Inconsistência não especificada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            contract.risco === 'ALTO' ? 'destructive' :
                            contract.risco === 'MÉDIO' ? 'default' : 'secondary'
                          }
                        >
                          {contract.risco || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contract.valor_contrato ? 
                          formatCurrency(parseFloat(String(contract.valor_contrato))) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <span className={contract.multa && parseFloat(String(contract.multa)) > 0 ? 'text-red-600 font-semibold' : ''}>
                          {contract.multa ? 
                            formatCurrency(parseFloat(String(contract.multa))) : 
                            'R$ 0,00'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        {contract.data_vencimento ? 
                          new Date(contract.data_vencimento).toLocaleDateString('pt-BR') : 
                          'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Excelente! Nenhuma inconsistência encontrada
                </h3>
                <p className="text-muted-foreground">
                  Todos os contratos estão aprovados e em conformidade
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('sample-selection');

  const renderContent = () => {
    switch (activePage) {
      case 'sample-selection':
        return <SampleSelectionPage />;
      case 'sample-analysis':
        return <SampleAnalysisPage />;
      case 'quality-dashboard':
        return <QualityDashboardPageInline />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Página não encontrada
              </h2>
              <p className="text-muted-foreground">
                A página solicitada não foi implementada ainda.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <SampleProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header Principal */}
        <Header />
        
        {/* Conteúdo com Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar activePage={activePage} onPageChange={setActivePage} />
          </div>
          
          {/* Área de conteúdo principal */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </SampleProvider>
  );
};

export default MainLayout;
