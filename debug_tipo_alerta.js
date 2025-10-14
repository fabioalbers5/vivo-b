// Script para debugar os valores de tipo_alerta no banco
// Execute no console do browser

// Função para buscar valores únicos de tipo_alerta
async function debugTipoAlerta() {
  try {
    // Importar o cliente Supabase
    const { createClient } = window.supabase || await import('@supabase/supabase-js');
    
    // Configuração do Supabase (substitua pelos valores corretos)
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Buscar todos os valores únicos de tipo_alerta
    const { data, error } = await supabase
      .from('contratos_vivo')
      .select('tipo_alerta')
      .not('tipo_alerta', 'is', null);
    
    if (error) {
      console.error('Erro na consulta:', error);
      return;
    }
    
    // Extrair valores únicos
    const valoresUnicos = [...new Set(data.map(item => item.tipo_alerta))];
    
    console.log('Valores únicos de tipo_alerta encontrados:', valoresUnicos);
    console.log('Total de registros com tipo_alerta:', data.length);
    
    // Contar por valor
    const contagem = {};
    data.forEach(item => {
      const valor = item.tipo_alerta;
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    
    console.log('Contagem por valor:', contagem);
    
    // Verificar especificamente os valores problemáticos
    const problematicos = ['Cláusulas contraditórias', 'Obrigatoriedades legais'];
    problematicos.forEach(valor => {
      const encontrado = valoresUnicos.includes(valor);
      console.log(`"${valor}": ${encontrado ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar a função
debugTipoAlerta();