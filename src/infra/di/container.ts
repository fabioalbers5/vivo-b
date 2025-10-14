// Container de injeção de dependência
import { ContractService } from '@/core/services/ContractService';
import { CustomFilterService } from '@/core/services/CustomFilterService';
import { SupabaseContractRepository } from '@/infra/repositories/SupabaseContractRepository';
import { SupabaseCustomFilterRepository } from '@/infra/repositories/SupabaseCustomFilterRepository';

// Singleton para instâncias dos repositories
class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private _contractRepository: SupabaseContractRepository | null = null;
  private _customFilterRepository: SupabaseCustomFilterRepository | null = null;
  
  // Services
  private _contractService: ContractService | null = null;
  private _customFilterService: CustomFilterService | null = null;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Repository getters - Lazy loading
  get contractRepository(): SupabaseContractRepository {
    if (!this._contractRepository) {
      this._contractRepository = new SupabaseContractRepository();
    }
    return this._contractRepository;
  }

  get customFilterRepository(): SupabaseCustomFilterRepository {
    if (!this._customFilterRepository) {
      this._customFilterRepository = new SupabaseCustomFilterRepository();
    }
    return this._customFilterRepository;
  }

  // Service getters - Lazy loading com injeção de dependência
  get contractService(): ContractService {
    if (!this._contractService) {
      this._contractService = new ContractService(this.contractRepository);
    }
    return this._contractService;
  }

  get customFilterService(): CustomFilterService {
    if (!this._customFilterService) {
      this._customFilterService = new CustomFilterService(this.customFilterRepository);
    }
    return this._customFilterService;
  }

  // Método para resetar instâncias (útil para testes)
  reset(): void {
    this._contractRepository = null;
    this._customFilterRepository = null;
    this._contractService = null;
    this._customFilterService = null;
  }
}

// Export das instâncias dos services para uso nos componentes
export const diContainer = DIContainer.getInstance();

// Exports diretos para facilitar o uso
export const contractService = diContainer.contractService;
export const customFilterService = diContainer.customFilterService;
