import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useQualityMetrics, useContractRiskAnalysis } from '@/hooks/useQualityMetrics';

const FinancialExposure: React.FC = () => {
  const { data: metrics, isLoading: loadingMetrics, error: errorMetrics } = useQualityMetrics();
  const { data: riskAnalysis, isLoading: loadingRisk, error: errorRisk } = useContractRiskAnalysis();

  if (loadingMetrics || loadingRisk) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (errorMetrics || errorRisk) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados financeiros. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics || !riskAnalysis) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Dados para o gráfico de área - projeção de multas por mês (mock)
  const monthlyPenaltiesData = [
    { month: 'Jan', penalties: metrics.projectedPenalties * 0.1, exposure: metrics.totalFinancialExposure * 0.8 },
    { month: 'Fev', penalties: metrics.projectedPenalties * 0.15, exposure: metrics.totalFinancialExposure * 0.82 },
    { month: 'Mar', penalties: metrics.projectedPenalties * 0.2, exposure: metrics.totalFinancialExposure * 0.85 },
    { month: 'Abr', penalties: metrics.projectedPenalties * 0.3, exposure: metrics.totalFinancialExposure * 0.87 },
    { month: 'Mai', penalties: metrics.projectedPenalties * 0.45, exposure: metrics.totalFinancialExposure * 0.9 },
    { month: 'Jun', penalties: metrics.projectedPenalties * 0.6, exposure: metrics.totalFinancialExposure * 0.95 },
    { month: 'Jul', penalties: metrics.projectedPenalties * 0.75, exposure: metrics.totalFinancialExposure },
    { month: 'Ago', penalties: metrics.projectedPenalties * 0.85, exposure: metrics.totalFinancialExposure * 1.05 },
    { month: 'Set', penalties: metrics.projectedPenalties * 0.9, exposure: metrics.totalFinancialExposure * 1.1 },
    { month: 'Out', penalties: metrics.projectedPenalties * 0.95, exposure: metrics.totalFinancialExposure * 1.15 },
    { month: 'Nov', penalties: metrics.projectedPenalties, exposure: metrics.totalFinancialExposure * 1.2 },
    { month: 'Dez', penalties: metrics.projectedPenalties * 1.1, exposure: metrics.totalFinancialExposure * 1.25 },
  ];

  // Dados para gráfico de barras - impacto por tipo de contrato
  const contractTypeData = riskAnalysis
    .reduce((acc: Array<{name: string; value: number; count: number}>, curr) => {
      const existing = acc.find(item => item.name === curr.contractType);
      if (existing) {
        existing.value += curr.financialImpact;
        existing.count += curr.count;
      } else {
        acc.push({
          name: curr.contractType,
          value: curr.financialImpact,
          count: curr.count,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Dados para gráfico de riscos
  const riskLevelData = riskAnalysis
    .reduce((acc: Array<{name: string; value: number; contracts: number}>, curr) => {
      const existing = acc.find(item => item.name === curr.riskLevel);
      if (existing) {
        existing.value += curr.financialImpact;
        existing.contracts += curr.count;
      } else {
        acc.push({
          name: curr.riskLevel,
          value: curr.financialImpact,
          contracts: curr.count,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-vivo-purple/20 bg-vivo-purple/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-vivo-purple" />
              <div>
                <div className="text-2xl font-bold text-vivo-purple">
                  {formatCurrency(metrics.totalFinancialExposure)}
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
                  {formatCurrency(metrics.projectedPenalties)}
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
                  {formatCurrency(metrics.totalFinancialExposure + metrics.projectedPenalties)}
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
                  {((metrics.projectedPenalties / metrics.totalFinancialExposure) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Taxa de Risco</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projeção temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Projeção Temporal
            </CardTitle>
            <CardDescription>
              Evolução da exposição financeira e multas ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyPenaltiesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'penalties' ? 'Multas' : 'Exposição'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="penalties"
                  stackId="1"
                  stroke="hsl(0, 84%, 60%)"
                  fill="hsl(0, 84%, 60%)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="exposure"
                  stackId="2"
                  stroke="hsl(280, 100%, 30%)"
                  fill="hsl(280, 100%, 30%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impacto por tipo de contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Impacto por Tipo de Contrato
            </CardTitle>
            <CardDescription>
              Valor financeiro em risco agrupado por categoria de contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contractTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor em Risco']}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(120, 100%, 25%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por nível de risco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Distribuição por Nível de Risco
            </CardTitle>
            <CardDescription>
              Impacto financeiro segmentado por classificação de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskLevelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'value' ? formatCurrency(value) : value, 
                    name === 'value' ? 'Valor em Risco' : 'Contratos'
                  ]}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução de contratos críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-vivo-purple" />
              Tendência de Risco
            </CardTitle>
            <CardDescription>
              Evolução do número de contratos críticos por mês (simulado)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPenaltiesData.map((item, index) => ({
                month: item.month,
                criticalContracts: Math.max(1, Math.floor(metrics.criticalContracts * (0.7 + index * 0.05))),
                highRiskContracts: Math.max(1, Math.floor(metrics.highRiskContracts * (0.8 + index * 0.03))),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="criticalContracts" 
                  stroke="hsl(0, 84%, 60%)" 
                  strokeWidth={3}
                  name="Contratos Críticos"
                />
                <Line 
                  type="monotone" 
                  dataKey="highRiskContracts" 
                  stroke="hsl(45, 100%, 50%)" 
                  strokeWidth={3}
                  name="Alto Risco"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.totalFinancialExposure > 10000000 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Alto Risco Financeiro:</strong> Exposição financeira acima de R$ 10M. 
              Revisar contratos de alto valor imediatamente.
            </AlertDescription>
          </Alert>
        )}
        
        {metrics.projectedPenalties > 1000000 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Multas Elevadas:</strong> Projeção de multas acima de R$ 1M. 
              Implementar plano de mitigação urgente.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default FinancialExposure;