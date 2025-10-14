import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { useQualityMetrics } from '@/hooks/useQualityMetrics';

// Cores do tema Vivo
const DEADLINE_COLORS = [
  'hsl(0, 84%, 60%)',    // Vermelho para crítico (30 dias)
  'hsl(45, 100%, 50%)',  // Laranja para atenção (60 dias)
  'hsl(120, 100%, 25%)', // Verde para normal (90+ dias)
  'hsl(280, 100%, 30%)', // Roxo Vivo
];

const DeadlineIndicators: React.FC = () => {
  const { data: metrics, isLoading, error } = useQualityMetrics();

  if (isLoading) {
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

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar indicadores de prazo. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) return null;

  // Dados para gráfico de barras - contratos por período de vencimento
  const deadlineData = [
    {
      period: 'Vencidos',
      count: Math.floor(metrics.totalContracts * 0.02), // 2% vencidos (simulado)
      urgency: 'critical',
      color: DEADLINE_COLORS[0],
    },
    {
      period: '0-30 dias',
      count: metrics.contractsExpiring30Days,
      urgency: 'critical',
      color: DEADLINE_COLORS[0],
    },
    {
      period: '31-60 dias',
      count: metrics.contractsExpiring60Days,
      urgency: 'warning',
      color: DEADLINE_COLORS[1],
    },
    {
      period: '61-90 dias',
      count: metrics.contractsExpiring90Days,
      urgency: 'normal',
      color: DEADLINE_COLORS[2],
    },
    {
      period: '90+ dias',
      count: metrics.totalContracts - metrics.contractsExpiring30Days - metrics.contractsExpiring60Days - metrics.contractsExpiring90Days - Math.floor(metrics.totalContracts * 0.02),
      urgency: 'safe',
      color: DEADLINE_COLORS[3],
    },
  ];

  // Dados para pie chart
  const pieData = deadlineData.map(item => ({
    name: item.period,
    value: item.count,
    color: item.color,
  }));

  // Dados simulados para tendência temporal
  const timelineData = [
    { month: 'Jan', expiring30: 15, expiring60: 22, expiring90: 18, renewed: 8 },
    { month: 'Fev', expiring30: 18, expiring60: 20, expiring90: 25, renewed: 12 },
    { month: 'Mar', expiring30: 22, expiring60: 28, expiring90: 20, renewed: 15 },
    { month: 'Abr', expiring30: 20, expiring60: 25, expiring90: 30, renewed: 18 },
    { month: 'Mai', expiring30: 25, expiring60: 30, expiring90: 22, renewed: 20 },
    { month: 'Jun', expiring30: metrics.contractsExpiring30Days, expiring60: metrics.contractsExpiring60Days, expiring90: metrics.contractsExpiring90Days, renewed: metrics.autoRenewedContracts },
  ];

  // Dados para ranking de áreas com mais contratos vencendo (simulado)
  const areaDeadlineData = [
    { area: 'Engenharia', count: Math.floor(metrics.contractsExpiring30Days * 0.3), percentage: 30 },
    { area: 'TI', count: Math.floor(metrics.contractsExpiring30Days * 0.25), percentage: 25 },
    { area: 'Operações', count: Math.floor(metrics.contractsExpiring30Days * 0.2), percentage: 20 },
    { area: 'Comercial', count: Math.floor(metrics.contractsExpiring30Days * 0.15), percentage: 15 },
    { area: 'Outros', count: Math.floor(metrics.contractsExpiring30Days * 0.1), percentage: 10 },
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Crítico</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">Atenção</Badge>;
      case 'normal':
        return <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600">Normal</Badge>;
      default:
        return <Badge variant="outline" className="text-xs border-green-400 text-green-600">Seguro</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Cards de métricas de prazo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-900">
                    {metrics.contractsExpiring30Days}
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
                    {metrics.contractsExpiring60Days}
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
                    {metrics.contractsExpiring90Days}
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
                    {metrics.autoRenewedContracts}
                  </div>
                  <div className="text-sm text-blue-700">Renovações Automáticas</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">Revisão</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por período de vencimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Distribuição por Período
            </CardTitle>
            <CardDescription>
              Contratos agrupados por tempo até o vencimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deadlineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                >
                  {deadlineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart - proporção de vencimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Proporção de Vencimentos
            </CardTitle>
            <CardDescription>
              Distribuição proporcional dos contratos por urgência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
            <CardDescription>
              Evolução dos vencimentos ao longo dos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="expiring30" 
                  stroke={DEADLINE_COLORS[0]} 
                  strokeWidth={3}
                  name="30 dias"
                />
                <Line 
                  type="monotone" 
                  dataKey="expiring60" 
                  stroke={DEADLINE_COLORS[1]} 
                  strokeWidth={3}
                  name="60 dias"
                />
                <Line 
                  type="monotone" 
                  dataKey="expiring90" 
                  stroke={DEADLINE_COLORS[2]} 
                  strokeWidth={3}
                  name="90 dias"
                />
                <Line 
                  type="monotone" 
                  dataKey="renewed" 
                  stroke={DEADLINE_COLORS[3]} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Renovados"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking de áreas por vencimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Áreas com Mais Vencimentos
            </CardTitle>
            <CardDescription>
              Ranking de áreas com contratos vencendo em 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {areaDeadlineData.map((area, index) => (
                <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-red-100 text-red-700' :
                      index === 1 ? 'bg-orange-100 text-orange-700' :
                      index === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{area.area}</div>
                      <div className="text-sm text-muted-foreground">
                        {area.count} contratos ({area.percentage}%)
                      </div>
                    </div>
                  </div>
                  {getUrgencyBadge(index < 2 ? 'critical' : index < 4 ? 'warning' : 'normal')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.contractsExpiring30Days > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Ação Urgente:</strong> {metrics.contractsExpiring30Days} contratos vencendo em 30 dias. 
              Iniciar processo de renovação imediatamente.
            </AlertDescription>
          </Alert>
        )}
        
        {metrics.autoRenewedContracts > 5 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Revisão Necessária:</strong> {metrics.autoRenewedContracts} contratos renovados automaticamente. 
              Agendar revisão para validar termos e condições.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DeadlineIndicators;