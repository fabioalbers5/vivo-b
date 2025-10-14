-- Script de diagnóstico - Execute no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'filtros_personalizados' 
ORDER BY ordinal_position;

-- 2. Verificar constraints existentes
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'filtros_personalizados';

-- 3. Testar inserção com valores que a aplicação está enviando
INSERT INTO public.filtros_personalizados 
    (nome_filtro, tabela_origem, campo_origem, tipo, configuracoes) 
VALUES 
    ('Teste Status', 'contratos_vivo', 'status_pagamento', 'multiselect', '{}');

-- 4. Se deu erro acima, vamos ver o que está permitido
SELECT 'Se chegou aqui, a inserção funcionou!' as resultado;

-- 5. Limpar teste
DELETE FROM public.filtros_personalizados WHERE nome_filtro = 'Teste Status';