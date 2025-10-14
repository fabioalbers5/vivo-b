import { LegacyContract } from '@/hooks/useContractFilters';

/**
 * Calcula distribuição de valores para um campo
 */
export const getDistribution = (contracts: LegacyContract[], field: keyof LegacyContract): Record<string, number> => {
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
 * Calcula similaridade entre duas distribuições usando coeficiente de Bhattacharyya
 */
export const calculateDistributionSimilarity = (dist1: Record<string, number>, dist2: Record<string, number>): number => {
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
 * Calcula score de representatividade comparando distribuições da amostra com população original
 */
export const calculateRepresentativityScore = (original: LegacyContract[], sample: LegacyContract[]): number => {
  if (sample.length === 0) return 0;
  if (original.length === 0) return 1;
  
  const fields = ['type', 'status', 'alertType', 'risk'];
  let totalScore = 0;
  
  fields.forEach(field => {
    const originalDist = getDistribution(original, field as keyof LegacyContract);
    const sampleDist = getDistribution(sample, field as keyof LegacyContract);
    
    // Calcular similaridade de distribuições
    const similarity = calculateDistributionSimilarity(originalDist, sampleDist);
    totalScore += similarity;
  });
  
  return totalScore / fields.length;
};

/**
 * Calcula score de diversidade interna da amostra
 */
export const calculateDiversityScore = (contracts: LegacyContract[]): number => {
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