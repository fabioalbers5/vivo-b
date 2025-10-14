/**
 * Cliente TypeScript para registro de contratos filtrados no Supabase.
 * 
 * Este módulo implementa a interface frontend para registrar contratos
 * que já foram processados, evitando duplicações nas análises mensais.
 */

import { supabase } from '../integrations/supabase/client';
import { LegacyContract } from '../hooks/useContractFilters';

export interface ContratoFiltradoData {
  numero_contrato: string;
  mes_referencia: string;
  data_analise?: string;
  usuario?: string;
  amostra_id: number;
}

export interface RegistroResult {
  sucesso: boolean;
  total_contratos: number;
  novos_registros: number;
  duplicados_ignorados: number;
  mes_referencia: string;
  data_analise: string;
  usuario?: string;
  amostra_id: number;
  erro?: string;
}

export class ContratosFiltradosService {
  
  /**
   * Gera string de mês referência no formato MM-YYYY
   */
  private static gerarMesReferencia(data?: Date): string {
    const dataRef = data || new Date();
    const mes = String(dataRef.getMonth() + 1).padStart(2, '0');
    const ano = dataRef.getFullYear();
    return `${mes}-${ano}`;
  }

  /**
   * Formata data no formato ISO com timestamp completo no timezone America/São_Paulo
   */
  private static formatarDataAnalise(data?: Date): string {
    const dataRef = data || new Date();
    return dataRef.toLocaleString('sv-SE', { 
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(' ', 'T');
  }

  /**
   * Extrai número do contrato de diferentes formatos possíveis
   */
  private static extrairNumeroContrato(contrato: LegacyContract | Record<string, unknown>): string | null {
    // Tentar diferentes campos possíveis
    const campos = ['numero_contrato', 'numeroContrato', 'number', 'id'];
    
    for (const campo of campos) {
      if (contrato[campo]) {
        const valor = String(contrato[campo]).trim();
        if (valor.length > 0) {
          return valor;
        }
      }
    }
    
    return null;
  }

  /**
   * Busca o próximo amostra_id disponível
   * Se for a primeira amostra, retorna 1. Caso contrário, incrementa o último usado.
   */
  private static async obterProximoAmostraId(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('contratos_filtrados')
        .select('amostra_id')
        .order('amostra_id', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar último amostra_id:', error);
        return 1; // Fallback para primeira amostra
      }

      if (!data || data.length === 0) {
        return 1; // Primeira amostra
      }

      return data[0].amostra_id + 1;
    } catch (error) {
      console.error('Erro inesperado ao buscar amostra_id:', error);
      return 1; // Fallback para primeira amostra
    }
  }

  /**
   * Registra contratos filtrados na tabela contratos_filtrados do Supabase.
   * 
   * Implementa lógica idempotente usando upsert para evitar duplicações
   * de contratos no mesmo mês.
   */
  public static async registrarContratosFiltrados(
    contratos: LegacyContract[],
    usuario: string = 'fabio'
  ): Promise<RegistroResult> {
    
    if (!contratos || contratos.length === 0) {
      return {
        sucesso: false,
        total_contratos: 0,
        novos_registros: 0,
        duplicados_ignorados: 0,
        mes_referencia: this.gerarMesReferencia(),
        data_analise: this.formatarDataAnalise(),
        amostra_id: 0, // Valor padrão para erro
        erro: 'Lista de contratos está vazia'
      };
    }

    const mesReferencia = this.gerarMesReferencia();
    const dataAnalise = this.formatarDataAnalise();
    const totalContratos = contratos.length;

    try {
      // Obter próximo amostra_id
      const amostraId = await this.obterProximoAmostraId();
      
      // Preparar dados para inserção
      const registros: ContratoFiltradoData[] = [];
      const contratosRejeitados: Array<{contrato: unknown, motivo: string, camposDisponiveis: string[]}> = [];
      
      for (const contrato of contratos) {
        const numeroContrato = this.extrairNumeroContrato(contrato);
        
        if (!numeroContrato) {
          contratosRejeitados.push({
            contrato,
            motivo: 'Número do contrato não encontrado',
            camposDisponiveis: Object.keys(contrato)
          });
          continue;
        }

        registros.push({
          numero_contrato: numeroContrato,
          mes_referencia: mesReferencia,
          data_analise: dataAnalise,
          usuario: usuario,
          amostra_id: amostraId
        });
      }

      if (contratosRejeitados.length > 0) {
        console.warn('⚠️ [CONTRATOS_FILTRADOS] Contratos rejeitados:', {
          quantidade: contratosRejeitados.length,
          detalhes: contratosRejeitados
        });
      }

      if (registros.length === 0) {
        return {
          sucesso: false,
          total_contratos: totalContratos,
          novos_registros: 0,
          duplicados_ignorados: 0,
          mes_referencia: mesReferencia,
          data_analise: dataAnalise,
          amostra_id: amostraId,
          erro: 'Nenhum contrato válido encontrado'
        };
      }

      // Verificar contratos já existentes
      const numerosContrato = registros.map(r => r.numero_contrato);
      const { data: existentes, error: errorExistentes } = await supabase
        .from('contratos_filtrados')
        .select('numero_contrato')
        .in('numero_contrato', numerosContrato)
        .eq('mes_referencia', mesReferencia);

      const existentesSet = new Set(existentes?.map(e => e.numero_contrato) || []);
      const novosRegistros = registros.filter(r => !existentesSet.has(r.numero_contrato));

      let novosInseridos = 0;
      
      if (novosRegistros.length > 0) {
        // Inserir apenas registros novos
        const { data, error } = await supabase
          .from('contratos_filtrados')
          .insert(novosRegistros)
          .select('id');

        if (error) {
          console.error('❌ [CONTRATOS_FILTRADOS] ERRO na inserção:', {
            error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        novosInseridos = data?.length || 0;
      }

      const duplicadosIgnorados = registros.length - novosInseridos;

      const resultado = {
        sucesso: true,
        total_contratos: totalContratos,
        novos_registros: novosInseridos,
        duplicados_ignorados: duplicadosIgnorados,
        mes_referencia: mesReferencia,
        data_analise: dataAnalise,
        usuario: usuario,
        amostra_id: amostraId
      };

      return resultado;

    } catch (error: unknown) {
      // console.error('❌ Erro ao registrar contratos filtrados:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        sucesso: false,
        total_contratos: totalContratos,
        novos_registros: 0,
        duplicados_ignorados: 0,
        mes_referencia: mesReferencia,
        data_analise: dataAnalise,
        amostra_id: 0, // Valor padrão para erro
        erro: errorMessage
      };
    }
  }

  /**
   * Verifica quais contratos já foram filtrados no mês especificado
   */
  public static async verificarContratosJaFiltrados(
    contratos: LegacyContract[],
    mesReferencia?: string
  ): Promise<string[]> {
    
    if (!contratos || contratos.length === 0) {
      return [];
    }

    const mesRef = mesReferencia || this.gerarMesReferencia();
    const numerosContrato = contratos
      .map(c => this.extrairNumeroContrato(c))
      .filter(n => n !== null) as string[];

    if (numerosContrato.length === 0) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('contratos_filtrados')
        .select('numero_contrato')
        .in('numero_contrato', numerosContrato)
        .eq('mes_referencia', mesRef);

      if (error) {
        throw error;
      }

      return data?.map(item => item.numero_contrato) || [];

    } catch (error) {
      // console.error('❌ Erro ao verificar contratos filtrados:', error);
      return [];
    }
  }

  /**
   * Filtra lista de contratos removendo aqueles já processados no mês
   */
  public static async filtrarContratosNaoProcessados(
    contratos: LegacyContract[],
    mesReferencia?: string
  ): Promise<LegacyContract[]> {
    
    const contratosJaFiltrados = await this.verificarContratosJaFiltrados(
      contratos, 
      mesReferencia
    );

    if (contratosJaFiltrados.length === 0) {
      return contratos;
    }

    const contratosNaoProcessados = contratos.filter(contrato => {
      const numeroContrato = this.extrairNumeroContrato(contrato);
      return numeroContrato && !contratosJaFiltrados.includes(numeroContrato);
    });

    // console.log(`📊 Filtrados ${contratosNaoProcessados.length} contratos não processados de ${contratos.length} total`);
    
    return contratosNaoProcessados;
  }
}

/**
 * Hook personalizado para uso em componentes React
 */
export const useContratosFiltrados = () => {
  const registrarContratosFiltrados = async (
    contratos: LegacyContract[],
    usuario?: string
  ) => {
    return await ContratosFiltradosService.registrarContratosFiltrados(contratos, usuario);
  };

  const verificarContratosJaFiltrados = async (
    contratos: LegacyContract[],
    mesReferencia?: string
  ) => {
    return await ContratosFiltradosService.verificarContratosJaFiltrados(contratos, mesReferencia);
  };

  const filtrarContratosNaoProcessados = async (
    contratos: LegacyContract[],
    mesReferencia?: string
  ) => {
    return await ContratosFiltradosService.filtrarContratosNaoProcessados(contratos, mesReferencia);
  };

  return {
    registrarContratosFiltrados,
    verificarContratosJaFiltrados,
    filtrarContratosNaoProcessados
  };
};

// Função de conveniência para compatibilidade
export const registrarContratosFiltrados = (
  contratos: LegacyContract[],
  usuario?: string
) => {
  return ContratosFiltradosService.registrarContratosFiltrados(contratos, usuario);
};