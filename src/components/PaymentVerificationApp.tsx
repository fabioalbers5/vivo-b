import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import FilterContainer from "./FilterContainer";
import FlowTypeFilter from "./filters/FlowTypeFilter";
import ValueRangeFilter from "./filters/ValueRangeFilter";
import LocationFilter from "./filters/LocationFilter";
import DueDateFilter from "./filters/DueDateFilter";
import SupplierFilter from "./filters/SupplierFilter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ContractsTable from "./ContractsTable";
import CreateFilterModal from "./CreateFilterModal";
import CustomFilterRenderer from "./CustomFilterRenderer";
import { useCustomFilters } from "@/hooks/useCustomFilters";
import { useContractFilters, LegacyContract } from "@/hooks/useContractFilters";
import { useSample } from "@/contexts/SampleContext";
import { useContratosFiltrados } from "@/services/contratosFiltradosClient";

/**
 * FUNÇÃO DE SELEÇÃO REPRESENTATIVA
 * 
 * Implementa algoritmo simples de amostragem estratificada para garantir
 * máxima representatividade da amostra em relação ao conjunto original
 */
interface SampleCriteria {
  maxSampleSize: number;
  diversityWeight: number;
}

interface SampleResult {
  sample: LegacyContract[];
  representativityScore: number;
  selectionMetadata: {
    totalOriginal: number;
    sampleSize: number;
    coverageScore: number;
    diversityScore: number;
  };
}

const selectRepresentativeSample = (
  allContracts: LegacyContract[],
  criteria: SampleCriteria
): SampleResult | null => {
  if (allContracts.length === 0) {
    return null;
  }

  // 🎲 SOLUÇÃO: Embaralhar contratos com timestamp para garantir aleatoriedade real
  const timestamp = Date.now();
  const shuffledContracts = [...allContracts].sort(() => {
    // Usar timestamp + índices para criar aleatoriedade verdadeira
    const seed = timestamp + Math.random() * 1000;
    return (seed % 2) - 1;
  });

  // Se o dataset é pequeno, usar todos os contratos (embaralhados)
  if (shuffledContracts.length <= criteria.maxSampleSize) {
    const finalSample = shuffledContracts.slice(0, criteria.maxSampleSize);
    
    return {
      sample: finalSample,
      representativityScore: 1.0,
      selectionMetadata: {
        totalOriginal: allContracts.length,
        sampleSize: finalSample.length,
        coverageScore: 1.0,
        diversityScore: calculateDiversityScore(finalSample)
      }
    };
  }

  // Para datasets maiores, aplicar seleção estratificada nos contratos embaralhados
  const strata = stratifyContracts(shuffledContracts);
  
  // Selecionar proporcionalmente de cada estrato
  const selectedContracts = selectFromStrata(strata, criteria.maxSampleSize, criteria.diversityWeight);
  
  // Calcular métricas de qualidade
  const representativityScore = calculateRepresentativityScore(allContracts, selectedContracts);
  const coverageScore = strata.filter(s => s.selected.length > 0).length / strata.length;
  const diversityScore = calculateDiversityScore(selectedContracts);
  
  return {
    sample: selectedContracts,
    representativityScore,
    selectionMetadata: {
      totalOriginal: allContracts.length,
      sampleSize: selectedContracts.length,
      coverageScore,
      diversityScore
    }
  };
};

/**
 * Estratifica contratos por características principais
 */
const stratifyContracts = (contracts: LegacyContract[]) => {
  const stratumMap = new Map<string, LegacyContract[]>();
  
  contracts.forEach(contract => {
    // Criar chave do estrato baseada em características principais
    const stratumKey = [
      contract.type || 'unknown',
      contract.status || 'unknown',
      getValueRange(contract.value || 0),
      contract.alertType || 'none',
      contract.risk || 'unknown'
    ].join('|');
    
    if (!stratumMap.has(stratumKey)) {
      stratumMap.set(stratumKey, []);
    }
    stratumMap.get(stratumKey)!.push(contract);
  });
  
  return Array.from(stratumMap.entries()).map(([key, stratumContracts]) => ({
    key,
    contracts: stratumContracts,
    selected: [] as LegacyContract[],
    proportion: stratumContracts.length / contracts.length // Proporção correta
  }));
};

/**
 * Converte valor numérico em faixa para estratificação
 */
const getValueRange = (value: number): string => {
  if (value < 100000) return 'low';
  if (value < 500000) return 'medium';
  if (value < 1000000) return 'high';
  return 'very_high';
};

/**
 * Seleciona contratos de cada estrato mantendo proporções
 */
const selectFromStrata = (
  strata: Array<{key: string, contracts: LegacyContract[], selected: LegacyContract[], proportion: number}>,
  maxSampleSize: number,
  diversityWeight: number
): LegacyContract[] => {
  const totalContracts = strata.reduce((sum, s) => sum + s.contracts.length, 0);
  
  // Calcular proporções corretas
  strata.forEach(stratum => {
    stratum.proportion = stratum.contracts.length / totalContracts;
  });
  
  const selectedContracts: LegacyContract[] = [];
  
  strata.forEach(stratum => {
    const targetCount = Math.max(1, Math.round(stratum.proportion * maxSampleSize));
    const actualCount = Math.min(targetCount, stratum.contracts.length);
    
    if (actualCount >= stratum.contracts.length) {
      // Usar todos os contratos do estrato
      stratum.selected = [...stratum.contracts];
    } else {
      // Seleção diversificada dentro do estrato
      stratum.selected = selectDiverseSubset(stratum.contracts, actualCount, diversityWeight);
    }
    
    selectedContracts.push(...stratum.selected);
  });
  
  return selectedContracts;
};

/**
 * Seleciona subconjunto diverso de contratos com aleatoriedade verdadeira
 */
const selectDiverseSubset = (
  contracts: LegacyContract[],
  count: number,
  diversityWeight: number
): LegacyContract[] => {
  // 🎲 Embaralhar com timestamp para aleatoriedade real
  const timestamp = Date.now() + Math.random() * 1000;
  const shuffled = [...contracts].sort(() => {
    const seed = timestamp + Math.random() * 100;
    return (seed % 3) - 1.5; // Mais variação no sorting
  });
  
  // Combinar seleção aleatória com diversidade
  const randomPortion = Math.floor(count * (1 - diversityWeight));
  const diversePortion = count - randomPortion;
  
  // Seleção aleatória dos já embaralhados
  const selected = shuffled.slice(0, randomPortion);
  
  // Seleção por diversidade (evitar contratos muito similares)
  const remaining = shuffled.slice(randomPortion);
  for (let i = 0; i < diversePortion && remaining.length > 0; i++) {
    const mostDifferent = findMostDifferent(remaining, selected);
    selected.push(mostDifferent);
    remaining.splice(remaining.indexOf(mostDifferent), 1);
  }
  
  return selected;
};

/**
 * Encontra contrato mais diferente dos já selecionados
 */
const findMostDifferent = (candidates: LegacyContract[], selected: LegacyContract[]): LegacyContract => {
  if (selected.length === 0) return candidates[0];
  
  let bestCandidate = candidates[0];
  let maxDifference = -1;
  
  candidates.forEach(candidate => {
    let differenceSum = 0;
    selected.forEach(selectedContract => {
      // Calcular diferenças em características principais
      if (candidate.type !== selectedContract.type) differenceSum++;
      if (candidate.status !== selectedContract.status) differenceSum++;
      if (candidate.supplier !== selectedContract.supplier) differenceSum++;
      if (candidate.alertType !== selectedContract.alertType) differenceSum++;
      if (Math.abs((candidate.value || 0) - (selectedContract.value || 0)) > 100000) differenceSum++;
    });
    
    const avgDifference = differenceSum / selected.length;
    if (avgDifference > maxDifference) {
      maxDifference = avgDifference;
      bestCandidate = candidate;
    }
  });
  
  return bestCandidate;
};

/**
 * Calcula score de representatividade comparando distribuições
 */
const calculateRepresentativityScore = (original: LegacyContract[], sample: LegacyContract[]): number => {
  const fields = ['type', 'status', 'alertType', 'risk'];
  let totalScore = 0;
  
  fields.forEach(field => {
    const originalDist = getDistribution(original, field as keyof LegacyContract);
    const sampleDist = getDistribution(sample, field as keyof LegacyContract);
    
    // Calcular similaridade de distribuições (Bhattacharyya coefficient simplificado)
    const similarity = calculateDistributionSimilarity(originalDist, sampleDist);
    totalScore += similarity;
  });
  
  return totalScore / fields.length;
};

/**
 * Calcula distribuição de valores para um campo
 */
const getDistribution = (contracts: LegacyContract[], field: keyof LegacyContract): Record<string, number> => {
  const dist: Record<string, number> = {};
  const total = contracts.length;
  
  contracts.forEach(contract => {
    const value = String(contract[field] || 'unknown');
    dist[value] = (dist[value] || 0) + 1;
  });
  
  // Converter para proporções
  Object.keys(dist).forEach(key => {
    dist[key] = dist[key] / total;
  });
  
  return dist;
};

/**
 * Calcula similaridade entre duas distribuições
 */
const calculateDistributionSimilarity = (dist1: Record<string, number>, dist2: Record<string, number>): number => {
  const allKeys = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
  let similarity = 0;
  
  allKeys.forEach(key => {
    const p1 = dist1[key] || 0;
    const p2 = dist2[key] || 0;
    similarity += Math.sqrt(p1 * p2); // Bhattacharyya coefficient
  });
  
  return similarity;
};

/**
 * Calcula score de diversidade interna da amostra
 */
const calculateDiversityScore = (contracts: LegacyContract[]): number => {
  if (contracts.length <= 1) return 1;
  
  const fields = ['type', 'status', 'supplier', 'alertType', 'risk'];
  let diversitySum = 0;
  
  fields.forEach(field => {
    const uniqueValues = new Set(contracts.map(c => String(c[field as keyof LegacyContract] || 'unknown')));
    const diversity = uniqueValues.size / Math.min(contracts.length, 10); // Normalizado
    diversitySum += diversity;
  });
  
  return Math.min(1, diversitySum / fields.length);
};

const PaymentVerificationApp = () => {
  const { toast } = useToast();
  const { customFilters, addFilter, removeFilter, isLoading: filtersLoading } = useCustomFilters();
  const { contracts, isLoading, applyFilters } = useContractFilters();
  const { sampleContracts, setSample, selectedAnalyst } = useSample();
  const { registrarContratosFiltrados } = useContratosFiltrados();
  
  // Estado para controlar quando aplicar seleção representativa
  const [pendingSampleSelection, setPendingSampleSelection] = useState<{
    filterParams: Record<string, unknown>;
    timestamp: number;
  } | null>(null);
  
  // Default filter states
  const [flowType, setFlowType] = useState<string[]>([]);
  const [contractValue, setContractValue] = useState<[number, number]>([0, 10000000]);
  const [paymentValue, setPaymentValue] = useState<[number, number]>([0, 10000000]);
  const [region, setRegion] = useState<string>("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [contractNumber, setContractNumber] = useState<string>("");
  const [contractCount, setContractCount] = useState<number>(10);
  
  // Custom filter values
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, unknown>>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect para aplicar seleção representativa quando contratos mudarem
  useEffect(() => {
    if (pendingSampleSelection && contracts.length > 0 && !isLoading) {
      const { filterParams } = pendingSampleSelection;
      const contractsToSample = contracts;
      
      // Aplicar seleção representativa
      const sampleResult = selectRepresentativeSample(contractsToSample, {
        maxSampleSize: Math.min(1000, contractsToSample.length),
        diversityWeight: 0.3
      });
      
      // Preparar amostra final
      let finalSample = contractsToSample;
      let representativityScore = 1.0;
      let coverageScore = 1.0;
      let diversityScore = 1.0;
      
      if (sampleResult && sampleResult.sample.length > 0) {
        finalSample = sampleResult.sample;
        representativityScore = sampleResult.representativityScore;
        coverageScore = sampleResult.selectionMetadata.coverageScore;
        diversityScore = sampleResult.selectionMetadata.diversityScore;
      }
      
      // 🔄 REGISTRAR CONTRATOS FILTRADOS - Evita duplicações mensais
      registrarContratosFiltrados(finalSample, 'Fabio')
        .then(resultado => {
          if (resultado.sucesso) {
            // Salvar amostra no contexto COM amostra_id
            setSample(finalSample, {
              totalCount: finalSample.length,
              _representativityScore: representativityScore,
              _coverageScore: coverageScore,
              _diversityScore: diversityScore,
              _originalTotal: contractsToSample.length,
              _sampleSize: finalSample.length,
              _selectionMethod: finalSample.length === contractsToSample.length ? 'complete_dataset' : 'representative_sampling',
              appliedFilters: filterParams,
              lastUpdated: new Date()
            }, resultado.amostra_id);

            // Toast de sucesso para o usuário
            if (resultado.novos_registros > 0) {
              toast({
                title: `📊 Amostra ${resultado.amostra_id} Criada`,
                description: `${resultado.novos_registros} contratos salvos para análise mensal`,
                duration: 3000,
              });
            }
          } else {
            console.error('❌ Erro ao registrar contratos:', resultado.erro);
            toast({
              title: "⚠️ Erro no Registro",
              description: `Falha ao salvar contratos: ${resultado.erro}`,
              variant: "destructive",
              duration: 5000,
            });
          }
        })
        .catch(error => {
          console.error('❌ [PAYMENT_APP] Erro na chamada de registro:', error);
          toast({
            title: "❌ Erro de Conexão",
            description: "Falha ao conectar com o banco de dados",
            variant: "destructive",
            duration: 5000,
          });
        });
      
      // Feedback para o usuário
      const isCompleteDataset = finalSample.length === contractsToSample.length;
      const representativityPercentage = (representativityScore * 100).toFixed(1);
      
      toast({
        title: isCompleteDataset ? "📊 Dataset Completo Selecionado" : "🎯 Amostra Representativa Criada",
        description: isCompleteDataset 
          ? `${finalSample.length} contratos selecionados (100% dos dados filtrados)`
          : `${finalSample.length} de ${contractsToSample.length} contratos (${representativityPercentage}% representativo)`,
      });
      
      // Limpar estado pendente
      setPendingSampleSelection(null);
    }
  }, [contracts, pendingSampleSelection, isLoading, setSample, toast, registrarContratosFiltrados, selectedAnalyst]);

  const handleCustomFilterChange = (filterId: string, value: unknown) => {
    setCustomFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleApplyFilters = async () => {
    
    const filterParams = {
      flowType,
      contractValue,
      paymentValue,
      region,
      selectedStates,
      dueDate,
      customStart,
      customEnd,
      supplierName,
      contractNumber,
      contractCount,
      customFilterValues,
      customFilters
    };

    try {
      // PASSO 1: Configurar seleção pendente (será executada pelo useEffect)
      setPendingSampleSelection({
        filterParams,
        timestamp: Date.now()
      });
      
      // PASSO 2: Aplicar filtros (o useEffect detectará a mudança nos contratos)
      await applyFilters(filterParams);
      
      // O resto do processamento será feito automaticamente pelo useEffect
      
    } catch (error) {
      // Fallback: aplicar seleção representativa imediatamente nos contratos atuais
      const sampleResult = selectRepresentativeSample(contracts, {
        maxSampleSize: Math.min(1000, contracts.length),
        diversityWeight: 0.3
      });
      
      let finalSample = contracts;
      let representativityScore = 1.0;
      let coverageScore = 1.0;
      let diversityScore = 1.0;
      
      if (sampleResult) {
        finalSample = sampleResult.sample;
        representativityScore = sampleResult.representativityScore;
        coverageScore = sampleResult.selectionMetadata.coverageScore;
        diversityScore = sampleResult.selectionMetadata.diversityScore;
      }
      
      setSample(finalSample, {
        totalCount: finalSample.length,
        _representativityScore: representativityScore,
        _coverageScore: coverageScore,
        _diversityScore: diversityScore,
        _originalTotal: contracts.length,
        _sampleSize: finalSample.length,
        _selectionMethod: 'fallback_representative',
        appliedFilters: filterParams,
        lastUpdated: new Date()
      });
      
      const representativityPercentage = (representativityScore * 100).toFixed(1);
      
      toast({
        title: "🎯 Amostra Representativa Criada (Fallback)",
        description: `${finalSample.length} contratos selecionados (${representativityPercentage}% representativo)`,
        variant: "default"
      });
      
      // Limpar estado pendente
      setPendingSampleSelection(null);
    }
  };

  const handleViewContract = (contractId: string) => {
    toast({
      title: "Visualizar Contrato",
      description: `Abrindo detalhes do contrato ${contractId}...`
    });
  };

  const handleAnalyzeContract = (contractId: string) => {
    toast({
      title: "Análise de IA",
      description: `Carregando análise inteligente do contrato ${contractId}...`
    });
  };

  const resetFilters = () => {
    setFlowType([]);
    setContractValue([0, 10000000]);
    setPaymentValue([0, 10000000]);
    setRegion("");
    setSelectedStates([]);
    setDueDate("");
    setCustomStart("");
    setCustomEnd("");
    setSupplierName("");
    setContractNumber("");
    setContractCount(10);
    setCustomFilterValues({});
    
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Default Filters */}
          <FilterContainer title="Fornecedor">
            <SupplierFilter
              supplierName={supplierName}
              contractNumber={contractNumber}
              onSupplierNameChange={setSupplierName}
              onContractNumberChange={setContractNumber}
            />
          </FilterContainer>
          
          <FilterContainer title="Tipo de Fluxo">
            <FlowTypeFilter value={flowType} onChange={setFlowType} />
          </FilterContainer>
          
          <FilterContainer title="Valor do Contrato">
            <ValueRangeFilter
              title="Valor do Contrato"
              min={0}
              max={10000000}
              value={contractValue}
              onChange={setContractValue}
            />
          </FilterContainer>
          
          <FilterContainer title="Valor do Pagamento">
            <ValueRangeFilter
              title="Valor do Pagamento"
              min={0}
              max={10000000}
              value={paymentValue}
              onChange={setPaymentValue}
            />
          </FilterContainer>
          
          <FilterContainer title="Localização">
            <LocationFilter
              region={region}
              selectedStates={selectedStates}
              onRegionChange={setRegion}
              onStatesChange={setSelectedStates}
            />
          </FilterContainer>
          
          <FilterContainer title="Data de Vencimento">
            <DueDateFilter
              value={dueDate}
              customStart={customStart}
              customEnd={customEnd}
              onChange={setDueDate}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
            />
          </FilterContainer>
          
          {/* Custom Filters */}
          {customFilters.map((filter) => (
            <FilterContainer
              key={filter.id}
              title={filter.name}
              canDelete={true}
              onDelete={() => removeFilter(filter.id)}
            >
              <CustomFilterRenderer
                filter={filter}
                value={customFilterValues[filter.id]}
                onChange={(value) => handleCustomFilterChange(filter.id, value)}
              />
            </FilterContainer>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex justify-start">
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Novos Filtros
            </Button>
          </div>
          
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract-count">Quantidade de Contratos</Label>
              <Input
                id="contract-count"
                type="number"
                min="1"
                max="1000"
                value={contractCount}
                onChange={(e) => setContractCount(parseInt(e.target.value) || 1)}
                placeholder="Quantidade"
                className="w-40"
              />
            </div>
            
            <Button onClick={handleApplyFilters} variant="default" disabled={isLoading || filtersLoading || pendingSampleSelection !== null}>
              {isLoading ? "Aplicando..." : pendingSampleSelection ? "Criando Amostra..." : "Aplicar Filtros"}
            </Button>
            
            <Button onClick={resetFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        </div>
        
        {/* Results Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Contratos Filtrados ({sampleContracts.length})
            </h2>
          </div>
          
          <ContractsTable
            contracts={sampleContracts}
            onViewContract={handleViewContract}
            onAnalyzeContract={handleAnalyzeContract}
          />
        </div>
      </main>
      
      {/* Create Filter Modal */}
      <CreateFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addFilter}
      />
    </div>
  );
};

export default PaymentVerificationApp;
