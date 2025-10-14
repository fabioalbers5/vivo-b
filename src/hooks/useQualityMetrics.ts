import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipos para os dados de qualidade
export interface QualityMetrics {
  totalContracts: number;
  inconsistencyRate: number;
  criticalContracts: number;
  averageResolutionTime: number;
  totalFinancialExposure: number;
  projectedPenalties: number;
  contractsExpiring30Days: number;
  contractsExpiring60Days: number;
  contractsExpiring90Days: number;
  autoRenewedContracts: number;
  highRiskContracts: number;
  highRiskPercentage: number;
}

export interface InconsistencyByType {
  type: string;
  count: number;
  percentage: number;
}

export interface InconsistencyByArea {
  area: string;
  count: number;
  percentage: number;
}

export interface SupplierRanking {
  supplier: string;
  inconsistencies: number;
  totalContracts: number;
  riskScore: number;
  totalValue: number;
}

export interface ContractRisk {
  contractType: string;
  riskLevel: string;
  count: number;
  financialImpact: number;
}

// Hook principal para métricas de qualidade
export const useQualityMetrics = () => {
  return useQuery({
    queryKey: ['quality-metrics'],
    queryFn: async (): Promise<QualityMetrics> => {
      // Buscar todos os contratos da tabela contratos_vivo
      const { data: contracts, error } = await supabase
        .from('contratos_vivo')
        .select('*');

      if (error) throw error;
      if (!contracts) throw new Error('Nenhum contrato encontrado');

      const totalContracts = contracts.length;
      const today = new Date();
      
      // Debug DETALHADO para identificar o problema
      console.log('=== DEBUG DETALHADO ===');
      console.log('Total contratos:', totalContracts);
      console.log('Todos os tipos de alerta únicos:', [...new Set(contracts.map(c => c.tipo_alerta))]);
      console.log('Valores únicos da coluna multa:', [...new Set(contracts.map(c => c.multa))]);
      console.log('Contratos com multa > 0:',contracts.filter(c => c.multa && parseFloat(String(c.multa)) > 0).length);
      
      // Contar quantos de cada tipo
      const alertCounts = {};
      contracts.forEach(contract => {
        const alert = contract.tipo_alerta || 'NULL';
        alertCounts[alert] = (alertCounts[alert] || 0) + 1;
      });
      console.log('Contagem por tipo de alerta:', alertCounts);

      // Contratos SEM inconsistências: verificar variações possíveis de "Contrato aprovado"
      const contractsWithoutInconsistencies = contracts.filter(contract => {
        const tipoAlerta = contract.tipo_alerta;
        if (!tipoAlerta) return false;
        
        // Verificar diferentes variações (case insensitive e trim)
        const normalizedAlert = tipoAlerta.toLowerCase().trim();
        return normalizedAlert === 'contrato aprovado' || 
               normalizedAlert === 'aprovado' ||
               normalizedAlert.includes('aprovado');
      });
      
      // Contratos COM inconsistências: todos os outros
      const contractsWithInconsistencies = contracts.filter(contract => {
        const tipoAlerta = contract.tipo_alerta;
        if (!tipoAlerta) return true; // null/undefined = inconsistência
        
        const normalizedAlert = tipoAlerta.toLowerCase().trim();
        return !(normalizedAlert === 'contrato aprovado' || 
                 normalizedAlert === 'aprovado' ||
                 normalizedAlert.includes('aprovado'));
      });

      console.log('Contratos SEM inconsistência (aprovados):', contractsWithoutInconsistencies.length);
      console.log('Contratos COM inconsistência:', contractsWithInconsistencies.length);
      console.log('Exemplos de contratos aprovados:', contractsWithoutInconsistencies.slice(0, 3).map(c => c.tipo_alerta));
      console.log('Exemplos de contratos com inconsistência:', contractsWithInconsistencies.slice(0, 3).map(c => c.tipo_alerta));
      
      const inconsistencyRate = totalContracts > 0 ? (contractsWithInconsistencies.length / totalContracts) * 100 : 0;
      console.log('Taxa de inconsistência calculada:', inconsistencyRate.toFixed(2) + '%');
      console.log('========================');

      // Contratos críticos (baseado na coluna 'risco')
      const criticalContracts = contracts.filter(contract => {
        const risco = contract.risco;
        if (!risco) return false;
        
        const normalizedRisk = risco.toLowerCase().trim();
        return normalizedRisk === 'alto' || 
               normalizedRisk === 'crítico' ||
               normalizedRisk === 'critico' ||
               normalizedRisk.includes('alto') ||
               normalizedRisk.includes('crítico') ||
               normalizedRisk.includes('critico');
      }).length;

      console.log('Contratos críticos encontrados:', criticalContracts);
      console.log('Valores únicos da coluna risco:', [...new Set(contracts.map(c => c.risco))]);

      // Calcular exposição financeira total (soma dos valores dos contratos COM INCONSISTÊNCIAS)
      const totalFinancialExposure = contracts
        .filter(contract => {
          // Excluir contratos aprovados da exposição financeira
          const tipoAlerta = contract.tipo_alerta;
          if (!tipoAlerta) return true; // null/undefined = inconsistência
          
          const normalizedAlert = tipoAlerta.toLowerCase().trim();
          return !(normalizedAlert === 'contrato aprovado' || 
                   normalizedAlert === 'aprovado' ||
                   normalizedAlert.includes('aprovado'));
        })
        .reduce((sum, contract) => {
          const valor = parseFloat(String(contract.valor_contrato || 0)) || 0;
          return sum + valor;
        }, 0);

      // Multas Projetadas (soma da coluna 'multa' dos contratos com inconsistências)
      const projectedPenalties = contracts
        .filter(contract => {
          // Filtrar apenas contratos com inconsistências
          const tipoAlerta = contract.tipo_alerta;
          if (!tipoAlerta) return true; // null/undefined = inconsistência
          
          const normalizedAlert = tipoAlerta.toLowerCase().trim();
          return !(normalizedAlert === 'contrato aprovado' || 
                   normalizedAlert === 'aprovado' ||
                   normalizedAlert.includes('aprovado'));
        })
        .reduce((sum, contract) => {
          // Usar o valor real da coluna 'multa' da base de dados
          const multaValue = parseFloat(String(contract.multa || 0)) || 0;
          return sum + multaValue;
        }, 0);

      // Contratos vencendo em diferentes períodos
      const contractsExpiring30Days = contracts.filter(contract => {
        if (!contract.data_vencimento) return false;
        const expiryDate = new Date(contract.data_vencimento);
        const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDifference <= 30 && daysDifference > 0;
      }).length;

      const contractsExpiring60Days = contracts.filter(contract => {
        if (!contract.data_vencimento) return false;
        const expiryDate = new Date(contract.data_vencimento);
        const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDifference <= 60 && daysDifference > 30;
      }).length;

      const contractsExpiring90Days = contracts.filter(contract => {
        if (!contract.data_vencimento) return false;
        const expiryDate = new Date(contract.data_vencimento);
        const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDifference <= 90 && daysDifference > 60;
      }).length;

      // Contratos com renovação automática (baseado no tipo de alerta)
      const autoRenewedContracts = contracts.filter(contract => 
        contract.tipo_alerta && contract.tipo_alerta.toLowerCase().includes('renovação')
      ).length;

      // Contratos de alto risco (baseado na coluna 'risco')
      const highRiskContracts = contracts.filter(contract => {
        const risco = contract.risco;
        if (!risco) return false;
        
        const normalizedRisk = risco.toLowerCase().trim();
        return normalizedRisk === 'alto' || 
               normalizedRisk === 'crítico' ||
               normalizedRisk === 'critico' ||
               normalizedRisk.includes('alto') ||
               normalizedRisk.includes('crítico') ||
               normalizedRisk.includes('critico') ||
               (contract.tipo_alerta && contract.tipo_alerta.toLowerCase().includes('vencido'));
      }).length;

      console.log('Contratos de alto risco encontrados:', highRiskContracts);

      // Calcular tempo médio para resolução baseado nos dados disponíveis
      const resolvedContracts = contracts.filter(contract => 
        contract.data_assinatura && contract.data_vencimento
      );
      
      let averageResolutionTime = 15; // Valor padrão
      if (resolvedContracts.length > 0) {
        const totalDays = resolvedContracts.reduce((sum, contract) => {
          const start = new Date(contract.data_assinatura);
          const end = new Date(contract.data_vencimento);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
          return sum + Math.abs(days);
        }, 0);
        averageResolutionTime = Math.round(totalDays / resolvedContracts.length);
      }

      return {
        totalContracts,
        inconsistencyRate: totalContracts > 0 ? (contractsWithInconsistencies.length / totalContracts) * 100 : 0,
        criticalContracts,
        averageResolutionTime,
        totalFinancialExposure,
        projectedPenalties,
        contractsExpiring30Days,
        contractsExpiring60Days,
        contractsExpiring90Days,
        autoRenewedContracts,
        highRiskContracts,
        highRiskPercentage: (highRiskContracts / totalContracts) * 100,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para distribuição de inconsistências por tipo
export const useInconsistencyDistribution = () => {
  return useQuery({
    queryKey: ['inconsistency-distribution'],
    queryFn: async () => {
      const { data: contracts, error } = await supabase
        .from('contratos_vivo')
        .select('*');

      if (error) throw error;
      if (!contracts) return { byType: [], byArea: [] };

      // Filtrar apenas contratos com inconsistências
      const contractsWithInconsistencies = contracts.filter(contract => {
        const tipoAlerta = contract.tipo_alerta;
        if (!tipoAlerta) return true; // null/undefined = inconsistência
        
        const normalizedAlert = tipoAlerta.toLowerCase().trim();
        return !(normalizedAlert === 'contrato aprovado' || 
                 normalizedAlert === 'aprovado' ||
                 normalizedAlert.includes('aprovado'));
      });

      const totalInconsistencies = contractsWithInconsistencies.length;

      // Distribuição por tipo de alerta (inconsistência)
      const typeDistribution: { [key: string]: number } = {};
      
      contractsWithInconsistencies.forEach(contract => {
        const tipoAlerta = contract.tipo_alerta || 'Outros';
        typeDistribution[tipoAlerta] = (typeDistribution[tipoAlerta] || 0) + 1;
      });

      // Mapear para nomes mais amigáveis se necessário
      const friendlyNames: { [key: string]: string } = {
        'Multa por descumprimento de prazo': 'Multa por Prazo',
        'Contrato vencido sem renovação': 'Contrato Vencido',
        'Valor fora do orçamento aprovado': 'Valor Inadequado',
        'Cláusula ausente ou inadequada': 'Cláusula Ausente',
        'Fornecedor não cadastrado': 'Fornecedor Irregular'
      };

      const byType: InconsistencyByType[] = Object.entries(typeDistribution).map(([type, count]) => ({
        type: friendlyNames[type] || type,
        count,
        percentage: totalInconsistencies > 0 ? (count / totalInconsistencies) * 100 : 0,
      }));

      // Distribuição por área solicitante (apenas contratos com inconsistências)
      const areaDistribution: { [key: string]: number } = {};
      contractsWithInconsistencies.forEach(contract => {
        if (contract.area_solicitante) {
          areaDistribution[contract.area_solicitante] = (areaDistribution[contract.area_solicitante] || 0) + 1;
        }
      });

      const byArea: InconsistencyByArea[] = Object.entries(areaDistribution).map(([area, count]) => ({
        area,
        count,
        percentage: totalInconsistencies > 0 ? (count / totalInconsistencies) * 100 : 0,
      }));

      return { byType, byArea };
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para ranking de fornecedores mais problemáticos
export const useSupplierRanking = () => {
  return useQuery({
    queryKey: ['supplier-ranking'],
    queryFn: async (): Promise<SupplierRanking[]> => {
      const { data: contracts, error } = await supabase
        .from('contratos_vivo')
        .select('*');

      if (error) throw error;
      if (!contracts) return [];

      const supplierStats: { [key: string]: { inconsistencies: number; totalContracts: number; totalValue: number; riskScore: number } } = {};

      contracts.forEach(contract => {
        if (contract.fornecedor) {
          if (!supplierStats[contract.fornecedor]) {
            supplierStats[contract.fornecedor] = { inconsistencies: 0, totalContracts: 0, totalValue: 0, riskScore: 0 };
          }

          // Contar o total de contratos para este fornecedor
          supplierStats[contract.fornecedor].totalContracts++;

          // Contar inconsistências baseado no tipo_alerta
          let inconsistencies = 0;
          let riskMultiplier = 1;

          // Verificar se é um contrato aprovado (sem inconsistência)
          const tipoAlerta = contract.tipo_alerta;
          let isApproved = false;
          
          if (tipoAlerta) {
            const normalizedAlert = tipoAlerta.toLowerCase().trim();
            isApproved = normalizedAlert === 'contrato aprovado' || 
                        normalizedAlert === 'aprovado' ||
                        normalizedAlert.includes('aprovado');
          }

          if (!isApproved) {
            inconsistencies = 1;
            
            // Definir multiplicador de risco baseado no tipo de alerta
            const criticalAlerts = [
              'Multa por descumprimento de prazo',
              'Contrato vencido sem renovação',
              'Valor fora do orçamento aprovado',
              'Cláusula ausente ou inadequada'
            ];
            
            if (criticalAlerts.includes(contract.tipo_alerta)) {
              riskMultiplier = 3; // Alertas críticos
            } else {
              riskMultiplier = 1.5; // Outros alertas
            }
          }

          const contractValue = parseFloat(String(contract.valor_contrato || 0)) || 0;
          
          supplierStats[contract.fornecedor].inconsistencies += inconsistencies;
          
          // APENAS adicionar valor financeiro se há inconsistência (não aprovado)
          if (!isApproved) {
            supplierStats[contract.fornecedor].totalValue += contractValue;
            supplierStats[contract.fornecedor].riskScore += inconsistencies * riskMultiplier * (contractValue / 1000000);
          }
        }
      });

      return Object.entries(supplierStats)
        .map(([supplier, stats]) => ({
          supplier,
          inconsistencies: stats.inconsistencies,
          totalContracts: stats.totalContracts,
          riskScore: stats.riskScore,
          totalValue: stats.totalValue,
        }))
        .sort((a, b) => b.inconsistencies - a.inconsistencies) // Ordenar por número de inconsistências
        .slice(0, 5); // Top 5
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para análise de risco por tipo de contrato
export const useContractRiskAnalysis = () => {
  return useQuery({
    queryKey: ['contract-risk-analysis'],
    queryFn: async (): Promise<ContractRisk[]> => {
      const { data: contracts, error } = await supabase
        .from('contratos_vivo')
        .select('*');

      if (error) throw error;
      if (!contracts) return [];

      const riskAnalysis: { [key: string]: { [risk: string]: { count: number; financialImpact: number } } } = {};

      contracts.forEach(contract => {
        // Determinar tipo de contrato baseado em área ou fornecedor
        const contractType = contract.area_solicitante || contract.fornecedor || 'Não Definido';
        
        // Determinar nível de risco baseado no tipo_alerta
        let riskLevel = 'BAIXO';
        
        // Verificar se é um contrato aprovado (case-insensitive)
        const tipoAlerta = contract.tipo_alerta;
        let isApproved = false;
        
        if (tipoAlerta) {
          const normalizedAlert = tipoAlerta.toLowerCase().trim();
          isApproved = normalizedAlert === 'contrato aprovado' || 
                      normalizedAlert === 'aprovado' ||
                      normalizedAlert.includes('aprovado');
        }
        
        // APENAS processar contratos com inconsistências (não aprovados)
        if (!isApproved) {
          const criticalAlerts = [
            'Multa por descumprimento de prazo',
            'Contrato vencido sem renovação',
            'Valor fora do orçamento aprovado',
            'Cláusula ausente ou inadequada'
          ];
          
          if (criticalAlerts.includes(contract.tipo_alerta)) {
            riskLevel = 'ALTO';
          } else {
            riskLevel = 'MÉDIO';
          }

          if (!riskAnalysis[contractType]) {
            riskAnalysis[contractType] = {};
          }
          if (!riskAnalysis[contractType][riskLevel]) {
            riskAnalysis[contractType][riskLevel] = { count: 0, financialImpact: 0 };
          }

          const contractValue = parseFloat(String(contract.valor_contrato || 0)) || 0;
          riskAnalysis[contractType][riskLevel].count++;
          riskAnalysis[contractType][riskLevel].financialImpact += contractValue;
        }
        // Contratos aprovados são completamente ignorados na análise de risco
      });

      const result: ContractRisk[] = [];
      Object.entries(riskAnalysis).forEach(([contractType, risks]) => {
        Object.entries(risks).forEach(([riskLevel, data]) => {
          result.push({
            contractType,
            riskLevel,
            count: data.count,
            financialImpact: data.financialImpact,
          });
        });
      });

      return result.sort((a, b) => b.financialImpact - a.financialImpact);
    },
    staleTime: 5 * 60 * 1000,
  });
};