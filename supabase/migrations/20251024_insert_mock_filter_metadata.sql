-- Inserir dados mock de filtros para amostras de exemplo
-- Este script cria metadados fictícios para testar a funcionalidade de reutilização de filtros
-- VALORES REAIS que correspondem aos filtros da aplicação

-- Limpar dados existentes (se houver)
DELETE FROM public.amostras_filtros_metadata WHERE amostra_id LIKE '2024-%' OR amostra_id LIKE '2025-%';

-- Amostra 1: RE e FI com ciclo Sim | R$ 3M-6M pagamento
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
  '2024-10-15',
  ARRAY['RE', 'FI'],
  0,
  10000000,
  3000000,
  6000000,
  'all',
  NULL,
  NULL,
  'Sim',
  ARRAY['Pendente', 'Aprovado com análise'],
  ARRAY['Pagamento', 'Operacional'],
  ARRAY['Alto', 'Médio'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  25,
  'highest-value',
  500
);

-- Amostra 2: Real State com ciclo Não | Alertas específicos
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
  '2024-09-20',
  ARRAY['Real State'],
  500000,
  5000000,
  0,
  10000000,
  'all',
  NULL,
  NULL,
  'Não',
  ARRAY['Rejeitado', 'Pendente'],
  ARRAY['Clausulas contraditorias', 'Dados das partes', 'Obrigatoriedades legais'],
  ARRAY['Alto'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  15,
  'stratified',
  300
);

-- Amostra 3: Proposta e Engenharia | Risco Baixo | Todos os ciclos
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
  '2024-08-10',
  ARRAY['Proposta', 'Engenharia'],
  0,
  2000000,
  0,
  1500000,
  'all',
  NULL,
  NULL,
  'all',
  ARRAY['Aprovado em massa', 'Aprovado com análise'],
  ARRAY['Contrato aprovado', 'Assinatura'],
  ARRAY['Baixo'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  30,
  'random',
  450
);

-- Amostra 4: Todos os tipos | Valores altíssimos | Ciclo Sim
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
  '2024-07-25',
  ARRAY[]::TEXT[], -- Todos os tipos
  5000000,
  10000000,
  4000000,
  10000000,
  'all',
  NULL,
  NULL,
  'Sim',
  ARRAY['Rejeitado'],
  ARRAY['Pagamento', 'Clausulas contraditorias', 'Obrigatoriedades legais'],
  ARRAY['Alto', 'Médio'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  10,
  'highest-value',
  150
);

-- Amostra 5: RC com período customizado | Sem ciclo tesouraria
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
  '2024-06-15',
  ARRAY['RC'],
  1000000,
  4000000,
  800000,
  3500000,
  'custom',
  '2024-06-01',
  '2024-06-30',
  'Não',
  ARRAY['Pendente', 'Aprovado com análise'],
  ARRAY['Dados das partes', 'Operacional'],
  ARRAY['Médio'],
  ARRAY['Empresa A Ltda', 'Empresa B S.A.'],
  ARRAY[]::TEXT[],
  20,
  'stratified',
  280
);

-- Amostra 6: FI e Proposta | Valores médios | Alerta Assinatura
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
  '2024-05-08',
  ARRAY['FI', 'Proposta'],
  100000,
  2500000,
  50000,
  2000000,
  'all',
  NULL,
  NULL,
  'all',
  ARRAY['Aprovado em massa'],
  ARRAY['Assinatura'],
  ARRAY['Baixo', 'Médio'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  50,
  'random',
  800
);

-- Amostra 7: RE, Engenharia, Real State | Alto risco | Ciclo Sim
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
  '2024-04-18',
  ARRAY['RE', 'Engenharia', 'Real State'],
  2000000,
  8000000,
  1500000,
  7000000,
  'all',
  NULL,
  NULL,
  'Sim',
  ARRAY['Pendente', 'Aprovado com análise', 'Rejeitado'],
  ARRAY['Pagamento', 'Operacional', 'Clausulas contraditorias'],
  ARRAY['Alto'],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  18,
  'highest-value',
  220
);

-- Amostra 8: Apenas contratos específicos | Todos os valores
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
  '2024-03-12',
  ARRAY[]::TEXT[], -- Todos os tipos
  0,
  10000000,
  0,
  10000000,
  'all',
  NULL,
  NULL,
  'all',
  ARRAY[]::TEXT[], -- Todos os status
  ARRAY[]::TEXT[], -- Todos os alertas
  ARRAY[]::TEXT[], -- Todos os riscos
  ARRAY[]::TEXT[],
  ARRAY['CT-2025-001', 'CT-2025-002', 'CT-2025-003'],
  12,
  'highest-value',
  3
);

-- Mensagem de confirmação
SELECT 
  COUNT(*) as total_metadados_inseridos,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM public.amostras_filtros_metadata;
