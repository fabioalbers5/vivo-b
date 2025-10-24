-- Adicionar metadados de filtros para amostras REAIS existentes no banco
-- Substitua os amostra_id pelos IDs reais que você tem no sistema

-- Limpar metadados existentes de 2025 (se houver)
DELETE FROM public.amostras_filtros_metadata WHERE amostra_id LIKE '2025-%';

-- Adicionar metadados para amostra 2025-11-26 (a que você está visualizando)
INSERT INTO public.amostras_filtros_metadata (
  amostra_id,
  flow_type,
  contract_value_min,
  contract_value_max,
  payment_value_min,
  payment_value_max,
  due_date,
  custom_start,
  custom_end,
  treasury_cycle,
  payment_status,
  alert_type,
  risk_level,
  supplier_name,
  contract_number,
  sample_size,
  sampling_motor,
  contract_count
) VALUES (
  '2025-11-26',
  ARRAY['RE', 'FI'],
  0,
  10000000,
  2000000,
  5000000,
  'all',
  NULL,
  NULL,
  'Sim',
  ARRAY['Pendente', 'Aprovado com análise'],
  ARRAY['Pagamento', 'Operacional'],
  ARRAY['Alto', 'Médio'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  4,
  'highest-value',
  100
);

-- Se você tiver outras amostras, adicione aqui (exemplo):
-- Substitua '2025-XX-XX' pelo ID real da sua amostra

/*
INSERT INTO public.amostras_filtros_metadata (
  amostra_id,
  flow_type,
  contract_value_min,
  contract_value_max,
  payment_value_min,
  payment_value_max,
  due_date,
  treasury_cycle,
  payment_status,
  alert_type,
  risk_level,
  sample_size,
  sampling_motor,
  contract_count
) VALUES (
  '2025-XX-XX', -- SUBSTITUA pelo ID real
  ARRAY['Real State', 'Proposta'],
  500000,
  5000000,
  0,
  10000000,
  'all',
  'Não',
  ARRAY['Aprovado em massa'],
  ARRAY['Assinatura', 'Contrato aprovado'],
  ARRAY['Baixo', 'Médio'],
  10,
  'random',
  200
);
*/

-- Verificar se foi inserido
SELECT 
  amostra_id,
  flow_type,
  treasury_cycle,
  payment_status,
  alert_type,
  risk_level
FROM public.amostras_filtros_metadata
WHERE amostra_id LIKE '2025-%'
ORDER BY amostra_id DESC;
