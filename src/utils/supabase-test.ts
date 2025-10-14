/**
 * Teste de conexão com Supabase
 * Este arquivo testa se a conexão com o banco de dados está funcionando corretamente
 */

import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  // console.log('🔄 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se as variáveis de ambiente estão configuradas
    // console.log('📋 Variáveis de ambiente:');
    // console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    // console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');
    
    // Teste 2: Verificar se a tabela filtros_personalizados existe
    // console.log('\n🔍 Verificando tabela filtros_personalizados...');
    
    const { data: filters, error: filtersError } = await supabase
      .from('filtros_personalizados')
      .select('*')
      .limit(1);
      
    if (filtersError) {
      // console.log('⚠️ Tabela filtros_personalizados - Erro:', filtersError.message);
      // console.log('   Código do erro:', filtersError.code);
      
      // Verificar se é erro de permissão ou se a tabela não existe
      if (filtersError.code === 'PGRST106') {
        // console.log('💡 A tabela filtros_personalizados não existe. Você precisa criá-la no Supabase.');
      } else if (filtersError.code === '42501') {
        // console.log('💡 Problema de permissões RLS (Row Level Security). Verifique as políticas da tabela.');
      } else {
        // console.log('💡 Erro de autenticação ou configuração. Verifique as credenciais.');
      }
    } else {
      // console.log('✅ Tabela filtros_personalizados acessível!');
      // console.log('📊 Filtros encontrados:', filters?.length || 0);
    }
    
    // Teste 3: Verificar se a tabela contratos_vivo existe
    // console.log('\n🔍 Verificando tabela contratos_vivo...');
    
    const { data: contracts, error: contractsError } = await supabase
      .from('contratos_vivo')
      .select('*')
      .limit(1);
      
    if (contractsError) {
      // console.log('⚠️ Tabela contratos_vivo - Erro:', contractsError.message);
      // console.log('   Código do erro:', contractsError.code);
      
      if (contractsError.code === 'PGRST106') {
        // console.log('💡 A tabela contratos_vivo não existe. Você precisa criá-la no Supabase.');
        // console.log('💡 Para testar, você pode usar uma tabela existente como "contratos".');
      }
    } else {
      // console.log('✅ Tabela contratos_vivo acessível!');
      // console.log('📊 Contratos encontrados:', contracts?.length || 0);
    }
    
    // Resultado final
    // console.log('\n🎯 Resumo:');
    if (!filtersError && !contractsError) {
      // console.log('✅ Conexão Supabase funcionando perfeitamente!');
      return true;
    } else if (filtersError && contractsError) {
      // console.log('❌ Problemas com ambas as tabelas. Verifique o banco de dados.');
      return false;
    } else {
      // console.log('⚠️ Conexão funciona, mas algumas tabelas estão com problemas.');
      return true;
    }
    
  } catch (error) {
    // // // console.error('💥 Erro inesperado:', error);
    return false;
  }
};

// Auto-executar o teste quando o módulo for importado
testSupabaseConnection();
