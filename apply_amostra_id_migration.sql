-- Script para aplicar migração do amostra_id na tabela contratos_filtrados
-- Execute este script diretamente no SQL Editor do Supabase

-- Passo 1: Adicionar campo amostra_id à tabela contratos_filtrados
ALTER TABLE public.contratos_filtrados 
ADD COLUMN IF NOT EXISTS amostra_id integer NOT NULL DEFAULT 1;

-- Passo 2: Criar índice para melhorar performance nas consultas por amostra_id
CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_amostra_id 
ON public.contratos_filtrados(amostra_id);

-- Passo 3: Criar índice composto para otimizar busca por amostra_id e mês
CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_amostra_mes 
ON public.contratos_filtrados(amostra_id, mes_referencia);

-- Passo 4: Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor" 
-- 3. Cole e execute este script
-- 4. Verifique se a coluna amostra_id foi adicionada na tabela contratos_filtrados