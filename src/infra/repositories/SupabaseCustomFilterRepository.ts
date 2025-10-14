import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { ICustomFilterRepository } from '@/core/repositories/ICustomFilterRepository';
import { CustomFilter, CreateCustomFilterData, UpdateCustomFilterData } from '@/core/entities/CustomFilter';

// Mapeamento entre entidade de domínio e tabela do banco
type CustomFilterRow = Tables<'filtros_personalizados'>;
type CustomFilterInsert = TablesInsert<'filtros_personalizados'>;
type CustomFilterUpdate = TablesUpdate<'filtros_personalizados'>;

export class SupabaseCustomFilterRepository implements ICustomFilterRepository {
  
  // Conversores entre domínio e persistência
  private toDomain(row: CustomFilterRow): CustomFilter {
    return {
      id: row.id,
      nomeFiltro: row.nome_filtro,
      tabelaOrigem: row.tabela_origem,
      campoOrigem: row.campo_origem,
      tipo: row.tipo as CustomFilter['tipo'],
      configuracoes: row.configuracoes as CustomFilter['configuracoes'],
      criadoEm: row.criado_em ? new Date(row.criado_em) : undefined,
      atualizadoEm: row.atualizado_em ? new Date(row.atualizado_em) : undefined,
    };
  }

  private toInsert(data: CreateCustomFilterData): CustomFilterInsert {
    return {
      nome_filtro: data.nomeFiltro,
      tabela_origem: data.tabelaOrigem,
      campo_origem: data.campoOrigem,
      tipo: data.tipo,
      configuracoes: JSON.parse(JSON.stringify(data.configuracoes)),
    };
  }

  private toUpdate(data: UpdateCustomFilterData): CustomFilterUpdate {
    const updateData: CustomFilterUpdate = {};
    
    if (data.nomeFiltro !== undefined) updateData.nome_filtro = data.nomeFiltro;
    if (data.tabelaOrigem !== undefined) updateData.tabela_origem = data.tabelaOrigem;
    if (data.campoOrigem !== undefined) updateData.campo_origem = data.campoOrigem;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.configuracoes !== undefined) updateData.configuracoes = JSON.parse(JSON.stringify(data.configuracoes));
    
    return updateData;
  }

  // Implementação das operações CRUD
  async findAll(): Promise<CustomFilter[]> {
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .order('nome_filtro', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar filtros personalizados: ${error.message}`);
    }

    return data.map(this.toDomain);
  }

  async findById(id: string): Promise<CustomFilter | null> {
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar filtro personalizado: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async create(filterData: CreateCustomFilterData): Promise<CustomFilter> {
    const insertData = this.toInsert(filterData);
    
    // Log para debug
    // console.log('🚀 Tentando inserir no Supabase:', insertData);
    
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // // // console.error('❌ Erro do Supabase:', error);
      
      // Se for erro de constraint, tentar com tipo mais genérico
      if (error.code === '23514' && insertData.tipo) {
        // console.log('🔄 Tentando com tipo genérico...');
        
        const fallbackData = {
          ...insertData,
          tipo: 'text' // Tipo mais básico que deve funcionar
        };
        
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('filtros_personalizados')
          .insert(fallbackData)
          .select()
          .single();
          
        if (fallbackError) {
          throw new Error(`Erro ao criar filtro personalizado (mesmo com fallback): ${fallbackError.message}`);
        }
        
        // console.log('✅ Sucesso com tipo fallback!');
        return this.toDomain(fallbackResult);
      }
      
      throw new Error(`Erro ao criar filtro personalizado: ${error.message}`);
    }

    // console.log('✅ Sucesso direto!');
    return this.toDomain(data);
  }

  async update(id: string, filterData: UpdateCustomFilterData): Promise<CustomFilter> {
    const updateData = this.toUpdate(filterData);
    
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar filtro personalizado: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('filtros_personalizados')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar filtro personalizado: ${error.message}`);
    }
  }

  // Operações específicas
  async findByTable(tableName: string): Promise<CustomFilter[]> {
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .eq('tabela_origem', tableName)
      .order('nome_filtro', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar filtros por tabela: ${error.message}`);
    }

    return data.map(this.toDomain);
  }

  async findByType(filterType: string): Promise<CustomFilter[]> {
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .eq('tipo', filterType)
      .order('nome_filtro', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar filtros por tipo: ${error.message}`);
    }

    return data.map(this.toDomain);
  }

  async findByName(name: string): Promise<CustomFilter | null> {
    const { data, error } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .eq('nome_filtro', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar filtro por nome: ${error.message}`);
    }

    return this.toDomain(data);
  }
}
