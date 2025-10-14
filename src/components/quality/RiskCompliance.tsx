import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Shield, AlertTriangle, Target, TrendingUp, Building2, Users } from 'lucide-react';
import { useQualityMetrics, useContractRiskAnalysis, useInconsistencyDistribution } from '@/hooks/useQualityMetrics';

// Cores do tema Vivo para heatmap
const RISK_COLORS = {
  low: 'hsl(120, 100%, 25%)',     // Verde
  medium: 'hsl(45, 100%, 50%)',   // Laranja
  high: 'hsl(0, 84%, 60%)',       // Vermelho
  critical: 'hsl(280, 100%, 30%)', // Roxo Vivo
};

const RiskCompliance: React.FC = () => {
  const { data: metrics, isLoading: loadingMetrics, error: errorMetrics } = useQualityMetrics();
  const { data: riskAnalysis, isLoading: loadingRisk, error: errorRisk } = useContractRiskAnalysis();
  const { data: distribution, isLoading: loadingDistribution, error: errorDistribution } = useInconsistencyDistribution();

  if (loadingMetrics || loadingRisk || loadingDistribution) {
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

  if (errorMetrics || errorRisk || errorDistribution) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de risco e compliance. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics || !riskAnalysis || !distribution) return null;

  // Preparar dados para heatmap de risco por área de negócio (simulado)
  const businessAreas = ['Engenharia', 'TI', 'Operações', 'Comercial', 'Jurídico', 'Financeiro'];
  const riskLevels = ['BAIXO', 'MÉDIO', 'ALTO', 'CRÍTICO'];

  const heatmapData = businessAreas.flatMap(area => 
    riskLevels.map(risk => {
      // Simular dados baseados nas métricas reais
      const baseValue = Math.floor(Math.random() * 20) + 5;
      const multiplier = risk === 'ALTO' ? 2 : risk === 'CRÍTICO' ? 3 : 1;
      
      return {
        area,
        risk,
        value: baseValue * multiplier,
        criticality: risk === 'CRÍTICO' ? 100 : risk === 'ALTO' ? 75 : risk === 'MÉDIO' ? 50 : 25,
        color: risk === 'CRÍTICO' ? RISK_COLORS.critical : 
               risk === 'ALTO' ? RISK_COLORS.high :
               risk === 'MÉDIO' ? RISK_COLORS.medium : RISK_COLORS.low,
      };
    })
  );

  // Dados para scatter plot - Severidade vs Exposição
  const scatterData = riskAnalysis.map(item => ({
    x: item.financialImpact / 1000000, // Exposição em milhões
    y: item.riskLevel === 'CRÍTICO' ? 100 : 
       item.riskLevel === 'ALTO' ? 75 :
       item.riskLevel === 'MÉDIO' ? 50 : 25, // Severidade
    size: item.count * 2,
    name: item.contractType,
    color: item.riskLevel === 'ALTO' ? RISK_COLORS.high : 
           item.riskLevel === 'MÉDIO' ? RISK_COLORS.medium : RISK_COLORS.low,
  }));

  // Dados de compliance (simulados)
  const complianceMetrics = [
    {
      category: 'Documentação',
      score: 85,
      status: 'good',
      issues: 3,
    },
    {
      category: 'Aprovações',
      score: 92,
      status: 'excellent',
      issues: 1,
    },
    {
      category: 'Prazos',
      score: 68,
      status: 'warning',
      issues: 8,
    },
    {
      category: 'Valores',
      score: 78,
      status: 'good',
      issues: 5,
    },
    {
      category: 'Cláusulas',
      score: 72,
      status: 'warning',
      issues: 6,
    },
  ];

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Excelente</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Bom</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300">Atenção</Badge>;
      default:
        return <Badge variant="destructive">Crítico</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-900">
                  {metrics.highRiskPercentage.toFixed(1)}%
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
                  {metrics.criticalContracts}
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
                  {(100 - metrics.inconsistencyRate).toFixed(1)}%
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
                <div className="text-2xl font-bold text-vivo-purple">
                  {complianceMetrics.reduce((acc, item) => acc + item.score, 0) / complianceMetrics.length}
                </div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matriz de Risco por Área */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Heatmap de Risco por Área
            </CardTitle>
            <CardDescription>
              Distribuição de contratos por nível de criticidade e área de negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1 p-4">
              <div></div>
              {riskLevels.map(level => (
                <div key={level} className="text-xs font-medium text-center p-2">
                  {level}
                </div>
              ))}
              {businessAreas.map(area => (
                <React.Fragment key={area}>
                  <div className="text-xs font-medium p-2 text-right">
                    {area}
                  </div>
                  {riskLevels.map(level => {
                    const cellData = heatmapData.find(d => d.area === area && d.risk === level);
                    return (
                      <div
                        key={`${area}-${level}`}
                        className={`p-2 text-xs text-center font-medium rounded border-2`}
                        style={{ 
                          backgroundColor: cellData?.color + '20',
                          borderColor: cellData?.color,
                          color: cellData?.color,
                        }}
                      >
                        {cellData?.value}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scatter Plot - Risco vs Exposição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Matriz Risco vs Exposição
            </CardTitle>
            <CardDescription>
              Relação entre severidade do risco e exposição financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x"
                  name="Exposição (R$ Mi)"
                  stroke="hsl(var(--foreground))"
                  label={{ value: 'Exposição Financeira (R$ Mi)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y"
                  name="Severidade"
                  stroke="hsl(var(--foreground))"
                  label={{ value: 'Severidade (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [
                    name === 'x' ? `R$ ${value}M` : `${value}%`,
                    name === 'x' ? 'Exposição' : 'Severidade'
                  ]}
                />
                <Scatter data={scatterData} fill="hsl(280, 100%, 30%)">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas de Compliance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Indicadores de Compliance
            </CardTitle>
            <CardDescription>
              Score de conformidade por categoria de requisitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {complianceMetrics.map((metric, index) => (
                <Card key={metric.category} className={`border-2 ${getComplianceColor(metric.score)}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{metric.category}</h4>
                        {getStatusBadge(metric.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {metric.score}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {metric.issues} issues
                          </span>
                        </div>
                        
                        <Progress 
                          value={metric.score} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de áreas críticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Áreas de Maior Risco
            </CardTitle>
            <CardDescription>
              Ranking de áreas por concentração de contratos de alto risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution?.byArea.slice(0, 5).map((area, index) => (
                <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-red-100 text-red-700' :
                      index === 1 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{area.area}</div>
                      <div className="text-sm text-muted-foreground">
                        {area.count} inconsistências ({area.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <Badge variant={index < 2 ? "destructive" : "outline"}>
                    {area.percentage.toFixed(1)}%
                  </Badge>
                </div>
              )) ?? []}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Plano de Ação Recomendado
            </CardTitle>
            <CardDescription>
              Ações prioritárias baseadas na análise de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.highRiskPercentage > 20 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Crítico:</strong> Taxa de alto risco acima de 20%. 
                    Implementar revisão emergencial de contratos.
                  </AlertDescription>
                </Alert>
              )}
              
              {metrics.criticalContracts > 10 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Urgente:</strong> {metrics.criticalContracts} contratos críticos identificados. 
                    Escalar para comitê de risco.
                  </AlertDescription>
                </Alert>
              )}
              
              {complianceMetrics.some(m => m.score < 70) && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Compliance:</strong> Indicadores abaixo de 70%. 
                    Reforçar treinamento em categorias críticas.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskCompliance;