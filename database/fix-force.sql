-- Script FORÇADO para corrigir constraints - Execute no Supabase SQL Editor

-- 1. Remover TODAS as constraints de check da tabela
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar todas as constraints de check na tabela
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'filtros_personalizados' 
        AND c.contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE public.filtros_personalizados DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
    END LOOP;
END $$;

-- 2. Adicionar nova constraint com TODOS os tipos possíveis
ALTER TABLE public.filtros_personalizados 
ADD CONSTRAINT filtros_personalizados_tipo_check 
CHECK (tipo IN (
    'text', 'number', 'date', 'datetime', 'time',
    'select', 'multiselect', 'dropdown', 'multi-select',
    'range', 'slider', 'boolean', 'checkbox', 'radio',
    'input', 'textarea', 'email', 'url', 'tel',
    'color', 'file', 'image', 'search'
));

-- 3. Verificar se funcionou
INSERT INTO public.filtros_personalizados 
    (nome_filtro, tabela_origem, campo_origem, tipo, configuracoes) 
VALUES 
    ('Teste Multiselect', 'contratos_vivo', 'status_pagamento', 'multiselect', '{}');

-- 4. Se chegou aqui, funcionou!
SELECT 'SUCESSO! Constraint corrigida e funcionando!' as resultado;

-- 5. Limpar teste
DELETE FROM public.filtros_personalizados WHERE nome_filtro = 'Teste Multiselect';

-- 6. Verificar constraint final
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'filtros_personalizados' AND c.contype = 'c';