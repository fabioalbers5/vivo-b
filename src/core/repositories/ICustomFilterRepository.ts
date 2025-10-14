import { CustomFilter, CreateCustomFilterData, UpdateCustomFilterData } from '../entities/CustomFilter';

// Interface do repositório de filtros personalizados
export interface ICustomFilterRepository {
  // Operações CRUD básicas
  findAll(): Promise<CustomFilter[]>;
  findById(id: string): Promise<CustomFilter | null>;
  create(data: CreateCustomFilterData): Promise<CustomFilter>;
  update(id: string, data: UpdateCustomFilterData): Promise<CustomFilter>;
  delete(id: string): Promise<void>;
  
  // Operações específicas
  findByTable(tableName: string): Promise<CustomFilter[]>;
  findByType(filterType: string): Promise<CustomFilter[]>;
  findByName(name: string): Promise<CustomFilter | null>;
}
