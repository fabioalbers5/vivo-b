const { data, error } = await supabase
  .from('contratos_vivo')
  .select(`
    *,
    contratos_filtrados!left(numero_contrato)
  `)
  .is('contratos_filtrados.numero_contrato', null)
  .eq('outros_filtros', 'valor'); // seus outros filtros, você é responsável por arrumar essa linha