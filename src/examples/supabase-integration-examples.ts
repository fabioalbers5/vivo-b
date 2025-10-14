// Exemplo de uso dos services integrados com Supabase
// Coloque sua API_KEY real no arquivo .env para que funcione

import { contractService, customFilterService } from '@/infra/di/container';

// Exemplo 1: Buscar todos os contratos
export const getAllContractsExample = async () => {
  try {
    const contracts = await contractService.getAllContracts();
    // console.log('Contratos encontrados:', contracts.length);
    return contracts;
  } catch (error) {
    // // // console.error('Erro ao buscar contratos:', error);
  }
};

// Exemplo 2: Criar um novo contrato
export const createContractExample = async () => {
  try {
    const newContract = await contractService.createContract({
      numeroContrato: 'CT-2024-DEMO-001',
      fornecedor: 'Fornecedor Exemplo Ltda',
      tipoContrato: 'Serviços',
      valorContrato: 75000,
      valorPagamento: 0,
      status: 'pending',
      dataVencimento: new Date('2024-06-30'),
      dataAssinatura: new Date('2024-01-15'),
      tipoFluxo: 'RE',
      regiao: 'Sudeste',
      estado: 'SP',
      municipio: 'São Paulo',
      areaResponsavel: 'TI',
      prioridade: 'high',
      risco: 'medium',
      responsavel: 'João Silva'
    });
    
    // console.log('Contrato criado:', newContract);
    return newContract;
  } catch (error) {
    // // // console.error('Erro ao criar contrato:', error);
  }
};

// Exemplo 3: Buscar contratos com filtros
export const getFilteredContractsExample = async () => {
  try {
    const contracts = await contractService.getContractsByFilters({
      estado: ['SP', 'RJ'],
      valorMin: 10000,
      valorMax: 100000,
      status: ['pending', 'processing'],
      prioridade: ['high', 'critical']
    });
    
    // console.log('Contratos filtrados:', contracts);
    return contracts;
  } catch (error) {
    // // // console.error('Erro ao buscar contratos filtrados:', error);
  }
};

// Exemplo 4: Obter estatísticas
export const getContractStatisticsExample = async () => {
  try {
    const stats = await contractService.getContractStatistics();
    // console.log('Estatísticas:', stats);
    return stats;
  } catch (error) {
    // // // console.error('Erro ao obter estatísticas:', error);
  }
};

// Exemplo 5: Buscar contratos vencidos
export const getOverdueContractsExample = async () => {
  try {
    const overdueContracts = await contractService.getOverdueContracts();
    // console.log('Contratos vencidos:', overdueContracts.length);
    return overdueContracts;
  } catch (error) {
    // // // console.error('Erro ao buscar contratos vencidos:', error);
  }
};

// Exemplo 6: Criar filtro personalizado
export const createCustomFilterExample = async () => {
  try {
    const newFilter = await customFilterService.createCustomFilter({
      nomeFiltro: 'Filtro Estados Principais',
      tabelaOrigem: 'contratos',
      campoOrigem: 'estado',
      tipo: 'multiselect',
      configuracoes: {
        label: 'Estados',
        description: 'Selecione os estados para filtrar',
        options: [
          { value: 'SP', label: 'São Paulo' },
          { value: 'RJ', label: 'Rio de Janeiro' },
          { value: 'MG', label: 'Minas Gerais' },
          { value: 'RS', label: 'Rio Grande do Sul' }
        ],
        required: false
      }
    });
    
    // console.log('Filtro personalizado criado:', newFilter);
    return newFilter;
  } catch (error) {
    // // // console.error('Erro ao criar filtro personalizado:', error);
  }
};

// Exemplo 7: Buscar insights de pagamento
export const getPaymentInsightsExample = async () => {
  try {
    const insights = await contractService.getPaymentInsights();
    // console.log('Insights de pagamento:', insights);
    return insights;
  } catch (error) {
    // // // console.error('Erro ao obter insights de pagamento:', error);
  }
};

// Exemplo 8: Buscar contratos paginados
export const getPaginatedContractsExample = async () => {
  try {
    const page = 1;
    const limit = 10;
    const filters = {
      estado: ['SP'],
      valorMin: 50000
    };
    
    const result = await contractService.getContractsPaginated(page, limit, filters);
    // console.log('Contratos paginados:', {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      contracts: result.contracts.length
    });
    
    return result;
  } catch (error) {
    // // // console.error('Erro ao buscar contratos paginados:', error);
  }
};

// Função para executar todos os exemplos
export const runAllExamples = async () => {
  // console.log('🚀 Iniciando exemplos de integração Supabase...');
  
  await getAllContractsExample();
  await createContractExample();
  await getFilteredContractsExample();
  await getContractStatisticsExample();
  await getOverdueContractsExample();
  await createCustomFilterExample();
  await getPaymentInsightsExample();
  await getPaginatedContractsExample();
  
  // console.log('✅ Todos os exemplos executados!');
};
