import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, DollarSign, Calendar, Shield, Eye } from 'lucide-react';

const QualityDashboardPage: React.FC = () => {
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
          <Card className="border-vivo-purple/20">
            <CardHeader>
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Visão Geral de Qualidade
              </CardTitle>
              <CardDescription>
                Dashboard de qualidade dos contratos está sendo carregado...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-2xl font-bold text-vivo-purple mb-2">
                  Dashboard em Desenvolvimento
                </div>
                <p className="text-muted-foreground">
                  Os componentes de qualidade serão carregados em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras tabs com conteúdo temporário */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Inconsistências</CardTitle>
              <CardDescription>Análise em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráficos de distribuição serão exibidos aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exposição Financeira</CardTitle>
              <CardDescription>Análise em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Análise financeira será exibida aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Prazo</CardTitle>
              <CardDescription>Análise em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Indicadores de prazo serão exibidos aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risco & Compliance</CardTitle>
              <CardDescription>Análise em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Análise de risco será exibida aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityDashboardPage;