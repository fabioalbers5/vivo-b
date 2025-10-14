import { Contract, CreateContractData, UpdateContractData, ContractFilters } from '../entities/Contract';

// Interface do repositório de contratos - define as operações de acesso a dados
export interface IContractRepository {
  // Operações CRUD básicas
  findAll(): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
  create(data: CreateContractData): Promise<Contract>;
  update(id: string, data: UpdateContractData): Promise<Contract>;
  delete(id: string): Promise<void>;
  
  // Operações de busca avançada
  findByFilters(filters: ContractFilters): Promise<Contract[]>;
  findBySupplier(supplier: string): Promise<Contract[]>;
  findByState(state: string): Promise<Contract[]>;
  findByRegion(region: string): Promise<Contract[]>;
  findByFlowType(flowType: string): Promise<Contract[]>;
  findOverdueContracts(): Promise<Contract[]>;
  findContractsDueSoon(days: number): Promise<Contract[]>;
  
  // Operações de análise
  getContractsByStatus(): Promise<Record<string, number>>;
  getContractsByRegion(): Promise<Record<string, number>>;
  getTotalValueByStatus(): Promise<Record<string, number>>;
  getAverageContractValue(): Promise<number>;
  
  // Operações de paginação
  findPaginated(page: number, limit: number, filters?: ContractFilters): Promise<{
    contracts: Contract[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
