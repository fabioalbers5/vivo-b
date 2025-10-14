import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Shield, 
  Clock,
  FileX,
  Target
} from 'lucide-react';
import { useQualityMetrics } from '@/hooks/useQualityMetrics';

const OverviewKPIs: React.FC = () => {
  const { data: metrics, isLoading, error } = useQualityMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar métricas de qualidade. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) return null;

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

  const kpiCards = [
    {
      title: 'Taxa de Inconsistência',
      value: formatPercentage(metrics.inconsistencyRate),
      description: `${metrics.inconsistencyRate > 25 ? 'Acima' : 'Dentro'} da meta de 25%`,
      icon: AlertTriangle,
      trend: metrics.inconsistencyRate > 25 ? 'up' : 'down',
      color: metrics.inconsistencyRate > 25 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.inconsistencyRate > 25 ? 'bg-red-50' : 'bg-green-50',
      progress: Math.min(metrics.inconsistencyRate, 100),
      progressColor: metrics.inconsistencyRate > 25 ? 'bg-red-500' : 'bg-green-500',
    },
    {
      title: 'Contratos Críticos',
      value: `${metrics.criticalContracts}`,
      description: `${formatPercentage((metrics.criticalContracts / metrics.totalContracts) * 100)} do total`,
      icon: Shield,
      trend: metrics.criticalContracts > 0 ? 'up' : 'down',
      color: metrics.criticalContracts > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.criticalContracts > 0 ? 'bg-red-50' : 'bg-green-50',
      progress: (metrics.criticalContracts / metrics.totalContracts) * 100,
      progressColor: metrics.criticalContracts > 0 ? 'bg-red-500' : 'bg-green-500',
    },
    {
      title: 'Tempo Médio Resolução',
      value: `${metrics.averageResolutionTime} dias`,
      description: 'Tempo para resolver inconsistências',
      icon: Clock,
      trend: metrics.averageResolutionTime > 30 ? 'up' : 'down',
      color: metrics.averageResolutionTime > 30 ? 'text-orange-600' : 'text-green-600',
      bgColor: metrics.averageResolutionTime > 30 ? 'bg-orange-50' : 'bg-green-50',
      progress: Math.min((metrics.averageResolutionTime / 60) * 100, 100),
      progressColor: metrics.averageResolutionTime > 30 ? 'bg-orange-500' : 'bg-green-500',
    },
    {
      title: 'Exposição Financeira',
      value: formatCurrency(metrics.totalFinancialExposure),
      description: 'Valor total em risco',
      icon: DollarSign,
      trend: 'neutral',
      color: 'text-vivo-purple',
      bgColor: 'bg-vivo-purple/5',
      progress: Math.min((metrics.totalFinancialExposure / 10000000) * 100, 100), // Base de 10M
      progressColor: 'bg-vivo-purple',
    },
    {
      title: 'Projeção de Multas',
      value: formatCurrency(metrics.projectedPenalties),
      description: 'Multas acumuladas projetadas',
      icon: FileX,
      trend: metrics.projectedPenalties > 0 ? 'up' : 'down',
      color: metrics.projectedPenalties > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.projectedPenalties > 0 ? 'bg-red-50' : 'bg-green-50',
      progress: Math.min((metrics.projectedPenalties / 1000000) * 100, 100), // Base de 1M
      progressColor: metrics.projectedPenalties > 0 ? 'bg-red-500' : 'bg-green-500',
    },
    {
      title: 'Contratos Vencendo (30d)',
      value: `${metrics.contractsExpiring30Days}`,
      description: `${formatPercentage((metrics.contractsExpiring30Days / metrics.totalContracts) * 100)} do total`,
      icon: Calendar,
      trend: metrics.contractsExpiring30Days > 0 ? 'up' : 'down',
      color: metrics.contractsExpiring30Days > 10 ? 'text-orange-600' : 'text-green-600',
      bgColor: metrics.contractsExpiring30Days > 10 ? 'bg-orange-50' : 'bg-green-50',
      progress: (metrics.contractsExpiring30Days / metrics.totalContracts) * 100,
      progressColor: metrics.contractsExpiring30Days > 10 ? 'bg-orange-500' : 'bg-green-500',
    },
    {
      title: 'Alto Risco',
      value: `${metrics.highRiskContracts}`,
      description: `${formatPercentage(metrics.highRiskPercentage)} classificados como alto risco`,
      icon: Target,
      trend: metrics.highRiskContracts > 0 ? 'up' : 'down',
      color: metrics.highRiskContracts > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.highRiskContracts > 0 ? 'bg-red-50' : 'bg-green-50',
      progress: metrics.highRiskPercentage,
      progressColor: metrics.highRiskContracts > 0 ? 'bg-red-500' : 'bg-green-500',
    },
    {
      title: 'Renovações Automáticas',
      value: `${metrics.autoRenewedContracts}`,
      description: 'Contratos renovados sem revisão',
      icon: TrendingUp,
      trend: metrics.autoRenewedContracts > 0 ? 'up' : 'down',
      color: metrics.autoRenewedContracts > 5 ? 'text-orange-600' : 'text-green-600',
      bgColor: metrics.autoRenewedContracts > 5 ? 'bg-orange-50' : 'bg-green-50',
      progress: (metrics.autoRenewedContracts / metrics.totalContracts) * 100,
      progressColor: metrics.autoRenewedContracts > 5 ? 'bg-orange-500' : 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header com resumo geral */}
      <Card className="border-vivo-purple/20">
        <CardHeader>
          <CardTitle className="text-vivo-purple flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Visão Geral de Qualidade
          </CardTitle>
          <CardDescription>
            Acompanhe os principais indicadores de qualidade dos {metrics.totalContracts} contratos ativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-vivo-purple">{metrics.totalContracts}</div>
              <div className="text-sm text-muted-foreground">Contratos Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(100 - metrics.inconsistencyRate)}
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Conformidade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.totalFinancialExposure + metrics.projectedPenalties)}
              </div>
              <div className="text-sm text-muted-foreground">Impacto Financeiro Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    {TrendIcon && (
                      <TrendIcon className={`h-4 w-4 ${kpi.color}`} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">{kpi.description}</div>
                    <Progress 
                      value={kpi.progress} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas de ação recomendada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.inconsistencyRate > 25 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Ação Recomendada:</strong> Taxa de inconsistência alta. 
              Revise os processos de validação de contratos.
            </AlertDescription>
          </Alert>
        )}
        
        {metrics.contractsExpiring30Days > 10 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Atenção:</strong> {metrics.contractsExpiring30Days} contratos vencendo em 30 dias. 
              Programe as renovações necessárias.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default OverviewKPIs;