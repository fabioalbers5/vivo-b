-- Script para verificar quais amostras existem e adicionar metadados para elas
-- Execute este script primeiro para ver os IDs das amostras reais

-- 1. Ver todas as amostras existentes
SELECT DISTINCT 
  amostra_id,
  mes_referencia,
  COUNT(*) as total_contratos,
  MIN(data_analise) as primeira_analise
FROM public.contratos_filtrados
WHERE amostra_id IS NOT NULL
GROUP BY amostra_id, mes_referencia
ORDER BY amostra_id DESC
LIMIT 20;

-- 2. Ver quais amostras JÁ TÊM metadados salvos
SELECT 
  amostra_id,
  created_at,
  flow_type,
  treasury_cycle,
  payment_status
FROM public.amostras_filtros_metadata
ORDER BY created_at DESC;
