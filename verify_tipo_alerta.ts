import { createClient } from '@supabase/supabase-js';

// Script para verificar dados de tipo_alerta no banco
// Execute: npx tsx verify_tipo_alerta.ts

const supabaseUrl = 'https://yrpnbomhgacvovzlhbxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycG5ib21oZ2Fjdm92emxoYnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwNzU4MjEsImV4cCI6MjA0MTY1MTgyMX0.PjR4gWaS5Kcml2VKTIQ7pFp9pYL0JhdbXJhEplxW4lM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTipoAlerta() {
  try {
    console.log('🔍 Verificando dados de tipo_alerta...');
    
    // 1. Buscar todos os valores únicos de tipo_alerta
    const { data: todosOsValores, error: errorTodos } = await supabase
      .from('contratos_vivo')
      .select('tipo_alerta')
      .not('tipo_alerta', 'is', null);
    
    if (errorTodos) {
      console.error('❌ Erro ao buscar valores:', errorTodos);
      return;
    }
    
    // Valores únicos
    const valoresUnicos = [...new Set(todosOsValores.map(item => item.tipo_alerta))];
    console.log('📊 Valores únicos encontrados:');
    valoresUnicos.forEach(valor => console.log(`  - "${valor}"`));
    
    // 2. Contagem por valor
    const contagem = {};
    todosOsValores.forEach(item => {
      const valor = item.tipo_alerta;
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    
    console.log('\n📈 Contagem por valor:');
    Object.entries(contagem).forEach(([valor, count]) => {
      console.log(`  "${valor}": ${count} registros`);
    });
    
    // 3. Verificar especificamente os valores problemáticos
    const problematicos = ['Cláusulas contraditórias', 'Obrigatoriedades legais'];
    console.log('\n🔍 Verificando valores problemáticos:');
    
    for (const valor of problematicos) {
      const { data: resultados, error } = await supabase
        .from('contratos_vivo')
        .select('id, numero_contrato, tipo_alerta')
        .eq('tipo_alerta', valor);
      
      if (error) {
        console.error(`❌ Erro ao buscar "${valor}":`, error);
        continue;
      }
      
      console.log(`\n"${valor}": ${resultados.length} registros encontrados`);
      if (resultados.length > 0) {
        console.log('Exemplos:');
        resultados.slice(0, 3).forEach(reg => {
          console.log(`  - ID: ${reg.id}, Contrato: ${reg.numero_contrato}, Tipo: "${reg.tipo_alerta}"`);
        });
      }
    }
    
    // 4. Verificar variações com caracteres especiais
    console.log('\n🔍 Verificando possíveis variações:');
    const variacoes = [
      'Clausulas Contraditórias',
      'Clausulas contraditorias', 
      'Cláusulas Contraditórias',
      'clausulas contraditórias',
      'Obrigatoriedades Legais',
      'obrigatoriedades legais',
      'Obrigatoriedades legais'
    ];
    
    for (const variacao of variacoes) {
      const { data: resultados, error } = await supabase
        .from('contratos_vivo')
        .select('tipo_alerta')
        .eq('tipo_alerta', variacao);
      
      if (!error && resultados.length > 0) {
        console.log(`✅ Encontrada variação: "${variacao}" (${resultados.length} registros)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarTipoAlerta();