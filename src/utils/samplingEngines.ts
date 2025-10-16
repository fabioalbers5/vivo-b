import { LegacyContract } from '@/hooks/useContractFilters';

export type SamplingMotorType = 'highest-value' | 'top-suppliers' | 'random';

/**
 * Remove duplicatas de fornecedores, mantendo apenas o contrato de maior valor por fornecedor
 */
const removeDuplicateSuppliers = (contracts: LegacyContract[]): LegacyContract[] => {
  const highestBySupplier = new Map<string, LegacyContract>();
  
  contracts.forEach(contract => {
    const supplier = contract.supplier;
    const value = contract.paymentValue || contract.value || 0;
    
    const existing = highestBySupplier.get(supplier);
    if (!existing) {
      highestBySupplier.set(supplier, contract);
    } else {
      const existingValue = existing.paymentValue || existing.value || 0;
      if (value > existingValue) {
        highestBySupplier.set(supplier, contract);
      }
    }
  });

  return Array.from(highestBySupplier.values());
};

/**
 * Motor: Maior Valor
 * Seleciona os X pagamentos com maior valor dentro dos filtros determinados
 * Evita duplicatas do mesmo fornecedor (apenas o maior pagamento por fornecedor)
 */
export const sampleByHighestValue = (
  contracts: LegacyContract[],
  sampleSize: number
): Set<string> => {
  // Remover duplicatas de fornecedores primeiro
  const uniqueContracts = removeDuplicateSuppliers(contracts);

  // Ordenar por valor (maior primeiro)
  const sorted = uniqueContracts.sort((a, b) => {
    const aValue = a.paymentValue || a.value || 0;
    const bValue = b.paymentValue || b.value || 0;
    return bValue - aValue;
  });

  // Selecionar os X primeiros
  const selected = sorted.slice(0, Math.min(sampleSize, sorted.length));

  // Retornar IDs
  return new Set(
    selected.map(contract => contract.id || `${contract.number}-${contract.supplier}`)
  );
};

/**
 * Motor: Top Fornecedores
 * Seleciona os X pagamentos com maior valor dos top fornecedores
 * Agrupa por fornecedor, soma valores, seleciona dos top fornecedores
 * Evita duplicatas do mesmo fornecedor (apenas o maior pagamento por fornecedor)
 */
export const sampleByTopSuppliers = (
  contracts: LegacyContract[],
  sampleSize: number
): Set<string> => {
  // Agrupar por fornecedor e calcular valor total
  const supplierTotals = new Map<string, { total: number; contracts: LegacyContract[] }>();

  contracts.forEach(contract => {
    const supplier = contract.supplier;
    const value = contract.paymentValue || contract.value || 0;

    if (!supplierTotals.has(supplier)) {
      supplierTotals.set(supplier, { total: 0, contracts: [] });
    }

    const entry = supplierTotals.get(supplier)!;
    entry.total += value;
    entry.contracts.push(contract);
  });

  // Ordenar fornecedores por valor total (maior primeiro)
  const sortedSuppliers = Array.from(supplierTotals.entries())
    .sort((a, b) => b[1].total - a[1].total);

  // Selecionar o maior contrato de cada fornecedor até atingir sampleSize
  const selectedContracts: LegacyContract[] = [];
  
  for (const [_, supplierData] of sortedSuppliers) {
    if (selectedContracts.length >= sampleSize) break;
    
    // Pegar o contrato de maior valor deste fornecedor
    const highestContract = supplierData.contracts.sort((a, b) => {
      const aValue = a.paymentValue || a.value || 0;
      const bValue = b.paymentValue || b.value || 0;
      return bValue - aValue;
    })[0];
    
    selectedContracts.push(highestContract);
  }

  // Retornar IDs
  return new Set(
    selectedContracts.map(contract => contract.id || `${contract.number}-${contract.supplier}`)
  );
};

/**
 * Motor: Aleatório
 * Gera uma amostra aleatória
 * Evita duplicatas do mesmo fornecedor (apenas o maior pagamento por fornecedor)
 */
export const sampleRandomly = (
  contracts: LegacyContract[],
  sampleSize: number
): Set<string> => {
  // Remover duplicatas de fornecedores primeiro
  const uniqueContracts = removeDuplicateSuppliers(contracts);
  
  const size = Math.min(sampleSize, uniqueContracts.length);

  // Embaralhar array usando Fisher-Yates
  const shuffled = [...uniqueContracts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Selecionar os primeiros N
  const selected = shuffled.slice(0, size);

  // Retornar IDs
  return new Set(
    selected.map(contract => contract.id || `${contract.number}-${contract.supplier}`)
  );
};

/**
 * Função principal que executa o motor selecionado
 */
export const executeSamplingMotor = (
  motor: SamplingMotorType,
  contracts: LegacyContract[],
  sampleSize: number
): Set<string> => {
  switch (motor) {
    case 'highest-value':
      return sampleByHighestValue(contracts, sampleSize);

    case 'top-suppliers':
      return sampleByTopSuppliers(contracts, sampleSize);

    case 'random':
      return sampleRandomly(contracts, sampleSize);

    default:
      return new Set();
  }
};
