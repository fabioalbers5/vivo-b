import { IContractRepository } from '../repositories/IContractRepository';
import { Contract, CreateContractData, UpdateContractData, ContractFilters } from '../entities/Contract';

// Service com regras de negócio para contratos
export class ContractService {
  constructor(private contractRepository: IContractRepository) {}

  // Operações básicas
  async getAllContracts(): Promise<Contract[]> {
    return await this.contractRepository.findAll();
  }

  async getContractById(id: string): Promise<Contract | null> {
    return await this.contractRepository.findById(id);
  }

  async createContract(data: CreateContractData): Promise<Contract> {
    // Validações de negócio
    this.validateContractData(data);
    
    return await this.contractRepository.create(data);
  }

  async updateContract(id: string, data: UpdateContractData): Promise<Contract> {
    // Verificar se contrato existe
    const existingContract = await this.contractRepository.findById(id);
    if (!existingContract) {
      throw new Error('Contrato não encontrado');
    }

    // Validações de negócio se houver dados para atualizar
    if (Object.keys(data).length > 0) {
      this.validateUpdateData(data);
    }

    return await this.contractRepository.update(id, data);
  }

  async deleteContract(id: string): Promise<void> {
    // Verificar se contrato existe
    const existingContract = await this.contractRepository.findById(id);
    if (!existingContract) {
      throw new Error('Contrato não encontrado');
    }

    return await this.contractRepository.delete(id);
  }

  // Operações de busca e filtros
  async getContractsByFilters(filters: ContractFilters): Promise<Contract[]> {
    return await this.contractRepository.findByFilters(filters);
  }

  async getContractsBySupplier(supplier: string): Promise<Contract[]> {
    if (!supplier.trim()) {
      throw new Error('Nome do fornecedor é obrigatório');
    }
    return await this.contractRepository.findBySupplier(supplier);
  }

  async getContractsByState(state: string): Promise<Contract[]> {
    if (!state.trim()) {
      throw new Error('Estado é obrigatório');
    }
    return await this.contractRepository.findByState(state);
  }

  async getContractsByRegion(region: string): Promise<Contract[]> {
    if (!region.trim()) {
      throw new Error('Região é obrigatória');
    }
    return await this.contractRepository.findByRegion(region);
  }

  async getContractsByFlowType(flowType: string): Promise<Contract[]> {
    if (!flowType.trim()) {
      throw new Error('Tipo de fluxo é obrigatório');
    }
    return await this.contractRepository.findByFlowType(flowType);
  }

  // Operações especiais para análise de contratos
  async getOverdueContracts(): Promise<Contract[]> {
    return await this.contractRepository.findOverdueContracts();
  }

  async getContractsDueSoon(days: number = 30): Promise<Contract[]> {
    if (days < 1 || days > 365) {
      throw new Error('Número de dias deve estar entre 1 e 365');
    }
    return await this.contractRepository.findContractsDueSoon(days);
  }

  async getUrgentContracts(): Promise<Contract[]> {
    // Contratos vencidos + contratos que vencem em 7 dias
    const [overdue, dueSoon] = await Promise.all([
      this.contractRepository.findOverdueContracts(),
      this.contractRepository.findContractsDueSoon(7)
    ]);
    
    return [...overdue, ...dueSoon];
  }

  // Analytics e relatórios
  async getContractStatistics() {
    const [
      contractsByStatus,
      contractsByRegion,
      totalValueByStatus,
      averageValue,
      overdueContracts,
      contractsDueSoon
    ] = await Promise.all([
      this.contractRepository.getContractsByStatus(),
      this.contractRepository.getContractsByRegion(),
      this.contractRepository.getTotalValueByStatus(),
      this.contractRepository.getAverageContractValue(),
      this.contractRepository.findOverdueContracts(),
      this.contractRepository.findContractsDueSoon(30)
    ]);

    return {
      contractsByStatus,
      contractsByRegion,
      totalValueByStatus,
      averageValue,
      overdueCount: overdueContracts.length,
      dueSoonCount: contractsDueSoon.length,
      totalContracts: Object.values(contractsByStatus).reduce((a, b) => a + b, 0),
      totalValue: Object.values(totalValueByStatus).reduce((a, b) => a + b, 0),
    };
  }

  async getPaymentInsights() {
    const contracts = await this.contractRepository.findAll();
    
    const paidContracts = contracts.filter(c => c.status === 'paid');
    const pendingContracts = contracts.filter(c => c.status === 'pending');
    const overdueContracts = contracts.filter(c => c.status === 'overdue');
    
    const totalPaid = paidContracts.reduce((sum, c) => sum + (c.valorPagamento || 0), 0);
    const totalPending = pendingContracts.reduce((sum, c) => sum + c.valorContrato, 0);
    const totalOverdue = overdueContracts.reduce((sum, c) => sum + c.valorContrato, 0);
    
    return {
      totalPaid,
      totalPending,
      totalOverdue,
      paidCount: paidContracts.length,
      pendingCount: pendingContracts.length,
      overdueCount: overdueContracts.length,
      paymentEfficiency: contracts.length > 0 ? (paidContracts.length / contracts.length) * 100 : 0,
    };
  }

  // Operações de paginação
  async getContractsPaginated(page: number, limit: number, filters?: ContractFilters) {
    if (page < 1) {
      throw new Error('Página deve ser maior que 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new Error('Limite deve estar entre 1 e 100');
    }

    return await this.contractRepository.findPaginated(page, limit, filters);
  }

  // Validações de negócio
  private validateContractData(data: CreateContractData): void {
    if (!data.numeroContrato.trim()) {
      throw new Error('Número do contrato é obrigatório');
    }

    if (!data.fornecedor.trim()) {
      throw new Error('Fornecedor é obrigatório');
    }

    if (data.valorContrato <= 0) {
      throw new Error('Valor do contrato deve ser maior que zero');
    }

    if (!data.tipoFluxo.trim()) {
      throw new Error('Tipo de fluxo é obrigatório');
    }

    if (!data.estado.trim()) {
      throw new Error('Estado é obrigatório');
    }

    if (data.dataVencimento <= new Date()) {
      throw new Error('Data de vencimento deve ser futura');
    }

    if (data.valorPagamento && data.valorPagamento < 0) {
      throw new Error('Valor de pagamento não pode ser negativo');
    }

    if (data.dataAssinatura && data.dataAssinatura > data.dataVencimento) {
      throw new Error('Data de assinatura não pode ser posterior à data de vencimento');
    }
  }

  private validateUpdateData(data: UpdateContractData): void {
    if (data.numeroContrato !== undefined && !data.numeroContrato.trim()) {
      throw new Error('Número do contrato não pode estar vazio');
    }

    if (data.fornecedor !== undefined && !data.fornecedor.trim()) {
      throw new Error('Fornecedor não pode estar vazio');
    }

    if (data.valorContrato !== undefined && data.valorContrato <= 0) {
      throw new Error('Valor do contrato deve ser maior que zero');
    }

    if (data.tipoFluxo !== undefined && !data.tipoFluxo.trim()) {
      throw new Error('Tipo de fluxo não pode estar vazio');
    }

    if (data.estado !== undefined && !data.estado.trim()) {
      throw new Error('Estado não pode estar vazio');
    }

    if (data.valorPagamento !== undefined && data.valorPagamento < 0) {
      throw new Error('Valor de pagamento não pode ser negativo');
    }

    if (data.dataAssinatura && data.dataVencimento && data.dataAssinatura > data.dataVencimento) {
      throw new Error('Data de assinatura não pode ser posterior à data de vencimento');
    }
  }
}
