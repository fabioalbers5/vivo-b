import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { SampleProvider } from '@/contexts/SampleContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useQualityMetrics } from '@/hooks/useQualityMetrics';

const HomeWithLayout = () => {
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useQualityMetrics();

  const handlePageChange = (page: string) => {
    setActivePage(page);
    if (page !== 'home') {
      // Navegar para a página principal se não for home
      navigate('/');
    }
  };

  // Dados simulados para quando metrics não estiver disponível
  const mockMetrics = {
    totalContracts: 245,
    inconsistencyRate: 18.5,
    criticalContracts: 12,
    totalFinancialExposure: 2500000,
    contractsExpiring30Days: 28,
  };

  const currentMetrics = metrics || mockMetrics;

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

  return (
    <SampleProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header Principal */}
        <Header />
        
        {/* Conteúdo com Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar activePage={activePage} onPageChange={handlePageChange} />
          </div>
          
          {/* Área de conteúdo principal */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="flex flex-col h-full bg-background">
                {/* Seção de Boas-vindas (centralizada) */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                      Seja bem-vindo
                    </h1>
                    <p className="text-slate-600 text-lg mb-8">
                      Sistema de Gerenciamento de Contratos Vivo
                    </p>
                    <p className="text-slate-500 text-sm">
                      Use o menu lateral para navegar pelas funcionalidades do sistema
                    </p>
                  </div>
                </div>

                {/* Seção de Métricas (parte inferior) */}
                <div className="p-2 bg-slate-50/50 border-t border-slate-200">
                  <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-700">
                        Resumo das Análises
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        Atualizado agora
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Taxa de Inconsistência */}
                      <Card className="hover:shadow-sm transition-shadow bg-white/80">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg p-2 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-600">Taxa de Inconsistência</p>
                                <p className="text-lg font-bold text-red-600">
                                  {isLoading ? "..." : formatPercentage(currentMetrics.inconsistencyRate)}
                                </p>
                              </div>
                            </div>
                            <TrendingUp className="h-3 w-3 text-red-400" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contratos Críticos */}
                      <Card className="hover:shadow-sm transition-shadow bg-white/80">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg p-2 bg-orange-50">
                                <Shield className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-600">Contratos Críticos</p>
                                <p className="text-lg font-bold text-orange-600">
                                  {isLoading ? "..." : currentMetrics.criticalContracts}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              de {currentMetrics.totalContracts}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Exposição Financeira */}
                      <Card className="hover:shadow-sm transition-shadow bg-white/80">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg p-2 bg-blue-50">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-600">Exposição Financeira</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {isLoading ? "..." : formatCurrency(currentMetrics.totalFinancialExposure)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contratos Vencendo */}
                      <Card className="hover:shadow-sm transition-shadow bg-white/80">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg p-2 bg-yellow-50">
                                <Calendar className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-600">Vencendo (30 dias)</p>
                                <p className="text-lg font-bold text-yellow-600">
                                  {isLoading ? "..." : currentMetrics.contractsExpiring30Days}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600">
                              Atenção
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Texto informativo */}
                    <p className="text-xs text-slate-500 text-center mt-4">
                      Para análises detalhadas, acesse "Dashboards de qualidade" no menu lateral
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SampleProvider>
  );
};

export default HomeWithLayout;