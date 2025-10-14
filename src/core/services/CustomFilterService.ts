import { ICustomFilterRepository } from '../repositories/ICustomFilterRepository';
import { CustomFilter, CreateCustomFilterData, UpdateCustomFilterData, FilterType, FilterConfiguration } from '../entities/CustomFilter';

// Service com regras de negócio para filtros personalizados
export class CustomFilterService {
  constructor(private customFilterRepository: ICustomFilterRepository) {}

  // Operações básicas
  async getAllCustomFilters(): Promise<CustomFilter[]> {
    return await this.customFilterRepository.findAll();
  }

  async getCustomFilterById(id: string): Promise<CustomFilter | null> {
    return await this.customFilterRepository.findById(id);
  }

  async createCustomFilter(data: CreateCustomFilterData): Promise<CustomFilter> {
    // Validações de negócio
    await this.validateCustomFilterData(data);
    
    return await this.customFilterRepository.create(data);
  }

  async updateCustomFilter(id: string, data: UpdateCustomFilterData): Promise<CustomFilter> {
    // Verificar se filtro existe
    const existingFilter = await this.customFilterRepository.findById(id);
    if (!existingFilter) {
      throw new Error('Filtro personalizado não encontrado');
    }

    // Validações de negócio se houver dados para atualizar
    if (Object.keys(data).length > 0) {
      await this.validateUpdateData(data, existingFilter);
    }

    return await this.customFilterRepository.update(id, data);
  }

  async deleteCustomFilter(id: string): Promise<void> {
    // Verificar se filtro existe
    const existingFilter = await this.customFilterRepository.findById(id);
    if (!existingFilter) {
      throw new Error('Filtro personalizado não encontrado');
    }

    return await this.customFilterRepository.delete(id);
  }

  // Operações específicas
  async getCustomFiltersByTable(tableName: string): Promise<CustomFilter[]> {
    if (!tableName.trim()) {
      throw new Error('Nome da tabela é obrigatório');
    }
    return await this.customFilterRepository.findByTable(tableName);
  }

  async getCustomFiltersByType(filterType: FilterType): Promise<CustomFilter[]> {
    return await this.customFilterRepository.findByType(filterType);
  }

  async getCustomFilterByName(name: string): Promise<CustomFilter | null> {
    if (!name.trim()) {
      throw new Error('Nome do filtro é obrigatório');
    }
    return await this.customFilterRepository.findByName(name);
  }

  // Operações utilitárias
  async duplicateCustomFilter(id: string, newName: string): Promise<CustomFilter> {
    const originalFilter = await this.customFilterRepository.findById(id);
    if (!originalFilter) {
      throw new Error('Filtro personalizado não encontrado');
    }

    // Verificar se já existe um filtro com o novo nome
    const existingFilter = await this.customFilterRepository.findByName(newName);
    if (existingFilter) {
      throw new Error('Já existe um filtro com este nome');
    }

    const duplicateData: CreateCustomFilterData = {
      nomeFiltro: newName,
      tabelaOrigem: originalFilter.tabelaOrigem,
      campoOrigem: originalFilter.campoOrigem,
      tipo: originalFilter.tipo,
      configuracoes: { ...originalFilter.configuracoes },
    };

    return await this.customFilterRepository.create(duplicateData);
  }

  async getFilterSummary() {
    const filters = await this.customFilterRepository.findAll();
    
    const filtersByType = filters.reduce((acc, filter) => {
      acc[filter.tipo] = (acc[filter.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const filtersByTable = filters.reduce((acc, filter) => {
      acc[filter.tabelaOrigem] = (acc[filter.tabelaOrigem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFilters: filters.length,
      filtersByType,
      filtersByTable,
      supportedTypes: ['text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean'] as FilterType[],
    };
  }

  // Validação de configurações específicas por tipo
  private validateFilterConfiguration(tipo: FilterType, configuracoes: FilterConfiguration): void {
    switch (tipo) {
      case 'select':
      case 'multiselect':
        if (!configuracoes.options || !Array.isArray(configuracoes.options) || configuracoes.options.length === 0) {
          throw new Error('Filtros de seleção devem ter pelo menos uma opção');
        }
        break;
      
      case 'range':
        if (configuracoes.min !== undefined && configuracoes.max !== undefined) {
          if (configuracoes.min >= configuracoes.max) {
            throw new Error('Valor mínimo deve ser menor que o valor máximo');
          }
        }
        break;
      
      case 'number':
        if (configuracoes.step !== undefined && configuracoes.step <= 0) {
          throw new Error('Step deve ser maior que zero');
        }
        break;
    }
  }

  // Validações de negócio
  private async validateCustomFilterData(data: CreateCustomFilterData): Promise<void> {
    if (!data.nomeFiltro.trim()) {
      throw new Error('Nome do filtro é obrigatório');
    }

    if (!data.tabelaOrigem.trim()) {
      throw new Error('Tabela de origem é obrigatória');
    }

    if (!data.campoOrigem.trim()) {
      throw new Error('Campo de origem é obrigatório');
    }

    // Verificar se já existe um filtro com o mesmo nome
    const existingFilter = await this.customFilterRepository.findByName(data.nomeFiltro);
    if (existingFilter) {
      throw new Error('Já existe um filtro com este nome');
    }

    // Validar tipos suportados
    const supportedTypes: FilterType[] = ['text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean'];
    if (!supportedTypes.includes(data.tipo)) {
      throw new Error(`Tipo de filtro não suportado. Tipos válidos: ${supportedTypes.join(', ')}`);
    }

    // Validar configurações específicas do tipo
    this.validateFilterConfiguration(data.tipo, data.configuracoes);
  }

  private async validateUpdateData(data: UpdateCustomFilterData, existingFilter: CustomFilter): Promise<void> {
    if (data.nomeFiltro !== undefined) {
      if (!data.nomeFiltro.trim()) {
        throw new Error('Nome do filtro não pode estar vazio');
      }

      // Verificar se já existe outro filtro com o mesmo nome
      if (data.nomeFiltro !== existingFilter.nomeFiltro) {
        const existingFilterWithName = await this.customFilterRepository.findByName(data.nomeFiltro);
        if (existingFilterWithName && existingFilterWithName.id !== existingFilter.id) {
          throw new Error('Já existe um filtro com este nome');
        }
      }
    }

    if (data.tabelaOrigem !== undefined && !data.tabelaOrigem.trim()) {
      throw new Error('Tabela de origem não pode estar vazia');
    }

    if (data.campoOrigem !== undefined && !data.campoOrigem.trim()) {
      throw new Error('Campo de origem não pode estar vazio');
    }

    if (data.tipo !== undefined) {
      const supportedTypes: FilterType[] = ['text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean'];
      if (!supportedTypes.includes(data.tipo)) {
        throw new Error(`Tipo de filtro não suportado. Tipos válidos: ${supportedTypes.join(', ')}`);
      }
    }

    // Validar configurações se fornecidas
    if (data.configuracoes !== undefined) {
      const filterType = data.tipo || existingFilter.tipo;
      this.validateFilterConfiguration(filterType, data.configuracoes);
    }
  }
}
