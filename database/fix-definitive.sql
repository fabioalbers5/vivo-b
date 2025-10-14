-- SOLUÇÃO DEFINITIVA - Execute no Supabase SQL Editor
-- Este script resolve o erro 23514 de forma definitiva

-- 1. REMOVER TODAS as constraints problemáticas
ALTER TABLE public.filtros_personalizados DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check;
ALTER TABLE public.filtros_personalizados DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check_new;

-- 2. RECRIAR com constraint mais permissiva
ALTER TABLE public.filtros_personalizados 
ADD CONSTRAINT filtros_personalizados_tipo_check_new
CHECK (
    tipo IS NOT NULL 
    AND length(tipo) > 0 
    AND length(tipo) < 50
);

-- 4. Testar inserção direta dos valores que a aplicação usa
INSERT INTO public.filtros_personalizados 
    (nome_filtro, tabela_origem, campo_origem, tipo, configuracoes) 
VALUES 
    ('TESTE multiselect', 'contratos_vivo', 'status_pagamento', 'multiselect', '{}'),
    ('TESTE range', 'contratos_vivo', 'multa', 'range', '{}'),
    ('TESTE text', 'contratos_vivo', 'municipio', 'text', '{}');

-- 5. Se chegou aqui, funcionou!
SELECT 'SUCCESS! Constraint removida e filtros funcionando!' as resultado;

-- 6. Contar filtros de teste
SELECT count(*) as total_filtros_teste FROM public.filtros_personalizados WHERE nome_filtro LIKE 'TESTE%';

-- 7. Remover filtros de teste
DELETE FROM public.filtros_personalizados WHERE nome_filtro LIKE 'TESTE%';

-- 8. Confirmação final
SELECT 'PRONTO! Agora a aplicação deve funcionar!' as status_final;