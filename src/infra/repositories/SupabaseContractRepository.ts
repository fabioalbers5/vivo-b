import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { IContractRepository } from '@/core/repositories/IContractRepository';
import { Contract, CreateContractData, UpdateContractData, ContractFilters as DomainContractFilters } from '@/core/entities/Contract';
import { SearchUtils } from '@/lib/searchUtils';

// Usando tabela contratos_vivo
const TABLE_NAME = 'contratos_vivo' as const;

// Mapeamento entre entidade de domínio e tabela do banco
type ContractRow = Tables<'contratos_vivo'>;
type ContractInsert = TablesInsert<'contratos_vivo'>;
type ContractUpdate = TablesUpdate<'contratos_vivo'>;

export class SupabaseContractRepository implements IContractRepository {
  
  // Conversores entre domínio e persistência
  private toDomain(row: ContractRow): Contract {
    return {
      id: row.id,
      numeroContrato: row.numero_contrato,
      fornecedor: row.fornecedor,
      tipoContrato: row.tipo_contrato || undefined,
      valorContrato: Number(row.valor_contrato),
      valorPagamento: row.valor_pagamento ? Number(row.valor_pagamento) : undefined,
      status: row.status as Contract['status'],
      dataVencimento: this.parseValidDate(row.data_vencimento) || new Date(),
      dataAssinatura: row.data_assinatura ? this.parseValidDate(row.data_assinatura) : undefined,
      dataPagamento: row.data_pagamento ? this.parseValidDate(row.data_pagamento) : undefined,
      dataVencimentoPagamento: row.data_vencimento_pagamento ? this.parseValidDate(row.data_vencimento_pagamento) : undefined,
      tipoFluxo: row.tipo_fluxo,
      regiao: row.regiao || undefined,
      estado: row.estado,
      municipio: row.municipio || undefined,
      areaResponsavel: row.area_responsavel || undefined,
      prioridade: row.prioridade as Contract['prioridade'],
      risco: row.risco as Contract['risco'],
      responsavel: row.responsavel || undefined,
      // Novos campos
      statusPagamento: row.status_pagamento as Contract['statusPagamento'],
      tipoAlerta: row.tipo_alerta as Contract['tipoAlerta'],
      areaSolicitante: row.area_solicitante as Contract['areaSolicitante'],
      multa: row.multa ? Number(row.multa) : undefined,
    };
  }

  private toInsert(data: CreateContractData): ContractInsert {
    return {
      numero_contrato: data.numeroContrato,
      fornecedor: data.fornecedor,
      tipo_contrato: data.tipoContrato,
      valor_contrato: data.valorContrato,
      valor_pagamento: data.valorPagamento,
      status: data.status,
      data_vencimento: data.dataVencimento.toISOString().split('T')[0],
      data_assinatura: data.dataAssinatura?.toISOString().split('T')[0],
      data_pagamento: data.dataPagamento?.toISOString().split('T')[0],
      data_vencimento_pagamento: data.dataVencimentoPagamento?.toISOString().split('T')[0],
      tipo_fluxo: data.tipoFluxo,
      regiao: data.regiao,
      estado: data.estado,
      municipio: data.municipio,
      area_responsavel: data.areaResponsavel,
      prioridade: data.prioridade,
      risco: data.risco,
      responsavel: data.responsavel,
      // Novos campos
      status_pagamento: data.statusPagamento,
      tipo_alerta: data.tipoAlerta,
      area_solicitante: data.areaSolicitante,
      multa: data.multa,
    };
  }

  private toUpdate(data: UpdateContractData): ContractUpdate {
    return {
      numero_contrato: data.numeroContrato,
      fornecedor: data.fornecedor,
      tipo_contrato: data.tipoContrato,
      valor_contrato: data.valorContrato,
      valor_pagamento: data.valorPagamento,
      status: data.status,
      data_vencimento: data.dataVencimento?.toISOString().split('T')[0],
      data_assinatura: data.dataAssinatura?.toISOString().split('T')[0],
      data_pagamento: data.dataPagamento?.toISOString().split('T')[0],
      data_vencimento_pagamento: data.dataVencimentoPagamento?.toISOString().split('T')[0],
      tipo_fluxo: data.tipoFluxo,
      regiao: data.regiao,
      estado: data.estado,
      municipio: data.municipio,
      area_responsavel: data.areaResponsavel,
      prioridade: data.prioridade,
      risco: data.risco,
      responsavel: data.responsavel,
      // Novos campos
      status_pagamento: data.statusPagamento,
      tipo_alerta: data.tipoAlerta,
      area_solicitante: data.areaSolicitante,
      multa: data.multa,
    };
  }

  // Implementação das operações CRUD
  async findAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar contrato: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async create(contractData: CreateContractData): Promise<Contract> {
    const insertData = this.toInsert(contractData);
    
    const { data, error } = await supabase
      .from('contratos_vivo')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar contrato: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async update(id: string, contractData: UpdateContractData): Promise<Contract> {
    const updateData = this.toUpdate(contractData);
    
    const { data, error } = await supabase
      .from('contratos_vivo')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar contrato: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contratos_vivo')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar contrato: ${error.message}`);
    }
  }

  // Implementação das buscas avançadas
  async findByFilters(filters: DomainContractFilters): Promise<Contract[]> {
    // Primeiro: buscar contratos já processados para exclusão
    const { data: contratosProcessados } = await supabase
      .from('contratos_filtrados')
      .select('numero_contrato');
    
    const numerosProcessados = new Set(contratosProcessados?.map(c => c.numero_contrato) || []);

    let query = supabase.from('contratos_vivo').select('*');

    // Aplicar filtros
    if (filters.fornecedor?.length) {
      query = query.in('fornecedor', filters.fornecedor);
    }
    
    if (filters.estado?.length) {
      query = query.in('estado', filters.estado);
    }
    
    if (filters.regiao?.length) {
      query = query.in('regiao', filters.regiao);
    }
    
    if (filters.tipoFluxo?.length) {
      query = query.in('tipo_fluxo', filters.tipoFluxo);
    }
    
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    
    if (filters.valorMin !== undefined) {
      query = query.gte('valor_contrato', filters.valorMin);
    }
    
    if (filters.valorMax !== undefined) {
      query = query.lte('valor_contrato', filters.valorMax);
    }
    
    if (filters.dataVencimentoInicio) {
      query = query.gte('data_vencimento_pagamento', filters.dataVencimentoInicio.toISOString().split('T')[0]);
    }
    
    if (filters.dataVencimentoFim) {
      query = query.lte('data_vencimento_pagamento', filters.dataVencimentoFim.toISOString().split('T')[0]);
    }
    
    if (filters.prioridade?.length) {
      query = query.in('prioridade', filters.prioridade);
    }
    
    if (filters.risco?.length) {
      query = query.in('risco', filters.risco);
    }

    // Filtros personalizados
    if (filters.statusPagamento?.length) {
      // console.log('🔍 Aplicando filtro SQL status_pagamento:', filters.statusPagamento);
      query = query.in('status_pagamento', filters.statusPagamento);
    }
    
    if (filters.tipoAlerta?.length) {
      query = query.in('tipo_alerta', filters.tipoAlerta);
    }
    
    if (filters.areaSolicitante?.length) {
      query = query.in('area_solicitante', filters.areaSolicitante);
    }
    
    if (filters.multaMin !== undefined) {
      query = query.gte('multa', filters.multaMin);
    }
    
    if (filters.multaMax !== undefined) {
      query = query.lte('multa', filters.multaMax);
    }
    
    if (filters.municipio && filters.municipio.trim() !== '') {
      query = query.ilike('municipio', `%${filters.municipio.trim()}%`);
    }

    query = query.order('data_vencimento_pagamento', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ [SUPABASE_QUERY] Erro na query:', error);
      throw new Error(`Erro ao buscar contratos com filtros: ${error.message}`);
    }

    // Filtrar contratos já processados (exclusão em memória)
    const contratosFiltrados = data.filter(row => !numerosProcessados.has(row.numero_contrato));

    return contratosFiltrados.map(row => this.toDomain(row));
  }

  async findBySupplier(supplier: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .eq('fornecedor', supplier)
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos por fornecedor: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findByState(state: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .eq('estado', state)
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos por estado: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findByRegion(region: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .eq('regiao', region)
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos por região: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findByFlowType(flowType: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .eq('tipo_fluxo', flowType)
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos por tipo de fluxo: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findOverdueContracts(): Promise<Contract[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .lt('data_vencimento_pagamento', today)
      .neq('status', 'paid')
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos vencidos: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async findContractsDueSoon(days: number): Promise<Contract[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('*')
      .gte('data_vencimento_pagamento', today.toISOString().split('T')[0])
      .lte('data_vencimento_pagamento', futureDate.toISOString().split('T')[0])
      .neq('status', 'paid')
      .order('data_vencimento_pagamento', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contratos com vencimento próximo: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  // Operações de análise
  async getContractsByStatus(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('status')
      .not('status', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar contratos por status: ${error.message}`);
    }

    return data.reduce((acc, row) => {
      const status = row.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getContractsByRegion(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('regiao')
      .not('regiao', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar contratos por região: ${error.message}`);
    }

    return data.reduce((acc, row) => {
      const regiao = row.regiao || 'unknown';
      acc[regiao] = (acc[regiao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getTotalValueByStatus(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('status, valor_contrato')
      .not('status', 'is', null);

    if (error) {
      throw new Error(`Erro ao buscar valor total por status: ${error.message}`);
    }

    return data.reduce((acc, row) => {
      const status = row.status || 'unknown';
      const valor = Number(row.valor_contrato) || 0;
      acc[status] = (acc[status] || 0) + valor;
      return acc;
    }, {} as Record<string, number>);
  }

  async getAverageContractValue(): Promise<number> {
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('valor_contrato');

    if (error) {
      throw new Error(`Erro ao calcular valor médio dos contratos: ${error.message}`);
    }

    if (data.length === 0) return 0;

    const total = data.reduce((acc, row) => acc + Number(row.valor_contrato), 0);
    return total / data.length;
  }

  async findPaginated(page: number, limit: number, filters?: DomainContractFilters) {
    const offset = (page - 1) * limit;
    
    // Query para contar total
    let countQuery = supabase
      .from('contratos_vivo')
      .select('*', { count: 'exact', head: true });
    
    // Query para dados
    let dataQuery = supabase
      .from('contratos_vivo')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('data_vencimento_pagamento', { ascending: true });

    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.fornecedor?.length) {
        countQuery = countQuery.in('fornecedor', filters.fornecedor);
        dataQuery = dataQuery.in('fornecedor', filters.fornecedor);
      }
      // ... aplicar outros filtros conforme implementado em findByFilters
    }

    const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    if (countError) {
      throw new Error(`Erro ao contar contratos: ${countError.message}`);
    }

    if (dataError) {
      throw new Error(`Erro ao buscar contratos paginados: ${dataError.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      contracts: data.map(row => this.toDomain(row)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private parseValidDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }
}
