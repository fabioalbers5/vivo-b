import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Building } from 'lucide-react';
import { useInconsistencyDistribution, useSupplierRanking } from '@/hooks/useQualityMetrics';

// Cores do tema Vivo
const VIVO_COLORS = [
  'hsl(280, 100%, 30%)', // Vivo Purple
  'hsl(280, 100%, 50%)', // Vivo Purple Light
  'hsl(280, 100%, 20%)', // Vivo Purple Dark
  'hsl(45, 100%, 50%)',  // Orange
  'hsl(0, 84%, 60%)',    // Red
  'hsl(120, 100%, 25%)', // Green
  'hsl(210, 100%, 50%)', // Blue
  'hsl(280, 100%, 85%)', // Vivo Purple Very Light
];

const InconsistencyDistribution: React.FC = () => {
  const { data: distribution, isLoading: loadingDistribution, error: errorDistribution } = useInconsistencyDistribution();
  const { data: supplierRanking, isLoading: loadingSuppliers, error: errorSuppliers } = useSupplierRanking();

  if (loadingDistribution || loadingSuppliers) {
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

  if (errorDistribution || errorSuppliers) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de distribuição. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!distribution || !supplierRanking) return null;

  // Preparar dados para os gráficos
  const typeChartData = distribution.byType.map(item => ({
    name: item.type,
    count: item.count,
    percentage: item.percentage,
  }));

  const areaChartData = distribution.byArea.map(item => ({
    name: item.area,
    count: item.count,
    percentage: item.percentage,
  }));

  const supplierChartData = supplierRanking.slice(0, 10).map(item => ({
    name: item.supplier.length > 20 ? item.supplier.substring(0, 17) + '...' : item.supplier,
    fullName: item.supplier,
    inconsistencies: item.inconsistencies,
    riskScore: item.riskScore,
    totalValue: item.totalValue,
  }));

  // Dados para pie chart de tipos
  const pieChartData = distribution.byType.map((item, index) => ({
    name: item.type,
    value: item.count,
    percentage: item.percentage,
    color: VIVO_COLORS[index % VIVO_COLORS.length],
  }));



  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Por Tipo de Inconsistência
            </CardTitle>
            <CardDescription>
              Distribuição das inconsistências encontradas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="hsl(280, 100%, 30%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Proporção por Tipo
            </CardTitle>
            <CardDescription>
              Visualização proporcional das inconsistências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Por área */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Por Área Solicitante
            </CardTitle>
            <CardDescription>
              Inconsistências agrupadas por área de negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="hsl(210, 100%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking de fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Top 10 Fornecedores Críticos
            </CardTitle>
            <CardDescription>
              Ranking dos fornecedores com mais inconsistências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip />
                <Bar 
                  dataKey="inconsistencies" 
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo em cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {distribution.byType.reduce((acc, item) => acc + item.count, 0)}
                </div>
                <div className="text-sm text-orange-700">Total de Inconsistências</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {distribution.byArea.length}
                </div>
                <div className="text-sm text-blue-700">Áreas Afetadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-900">
                  {supplierRanking.length}
                </div>
                <div className="text-sm text-red-700">Fornecedores com Problemas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InconsistencyDistribution;